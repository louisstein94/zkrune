/**
 * scripts/snapshot-holders.ts
 *
 * Fetches all zkRUNE token holders from Solana, builds a Poseidon sparse
 * Merkle tree (depth=20), and writes the snapshot to data/snapshot.json.
 *
 * Run:
 *   npx ts-node --project tsconfig.json scripts/snapshot-holders.ts
 *
 * Output:
 *   data/snapshot.json        (full tree with paths — NOT committed to git)
 *   public/snapshot-meta.json (root + metadata only — committed to git)
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import {
  buildTree,
  getMerklePath,
  HolderEntry,
  Snapshot,
  SnapshotMeta,
} from '../lib/merkle';

const MINT_ADDRESS =
  process.env.NEXT_PUBLIC_ZKRUNE_MINT ||
  '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump';

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  'https://api.mainnet-beta.solana.com';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';

const DECIMALS = 6;
const TREE_DEPTH = 20;

// ── Helius DAS API (preferred — no getProgramAccounts restrictions) ────────────
// Free tier at helius.dev supports getTokenAccounts with pagination.
async function fetchHoldersHelius(): Promise<HolderEntry[]> {
  console.log('Using Helius DAS API to fetch token accounts...');
  const holders: HolderEntry[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: String(page),
          method: 'getTokenAccounts',
          params: { mint: MINT_ADDRESS, limit: 1000, page },
        }),
      },
    );

    const json = await res.json() as any;

    if (json.error) {
      throw new Error(`Helius error: ${JSON.stringify(json.error)}`);
    }

    const accounts: any[] = json.result?.token_accounts ?? [];
    if (accounts.length === 0) break;

    for (const acc of accounts) {
      const balance = BigInt(acc.amount) / BigInt(10 ** DECIMALS);
      if (balance < BigInt(1)) continue;
      holders.push({ address: acc.owner, balance });
    }

    console.log(`  Page ${page}: ${accounts.length} accounts (total so far: ${holders.length})`);
    if (accounts.length < 1000) break;
    page++;
  }

  return holders;
}

// ── Standard RPC fallback (may be blocked by public endpoints) ────────────────
async function fetchHoldersRPC(connection: Connection): Promise<HolderEntry[]> {
  console.log('Using getProgramAccounts RPC (requires dedicated endpoint)...');
  const mintPubkey = new PublicKey(MINT_ADDRESS);

  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: mintPubkey.toBase58() } },
    ],
  });

  console.log(`Found ${accounts.length} raw token accounts`);
  const holders: HolderEntry[] = [];

  for (const { account } of accounts) {
    const data = account.data;
    const state = data[108]; // initialized = 1
    if (state !== 1) continue;

    const rawAmount = data.readBigUInt64LE(64);
    const balance = rawAmount / BigInt(10 ** DECIMALS);
    if (balance < BigInt(1)) continue;

    const ownerAddress = new PublicKey(data.slice(32, 64)).toBase58();
    holders.push({ address: ownerAddress, balance });
  }

  return holders;
}

async function fetchHolders(connection: Connection): Promise<HolderEntry[]> {
  let holders: HolderEntry[];

  if (HELIUS_API_KEY) {
    holders = await fetchHoldersHelius();
  } else {
    console.warn(
      'HELIUS_API_KEY not set — falling back to getProgramAccounts.\n' +
      'Public RPC endpoints often block this. Get a free key at helius.dev\n' +
      'and set HELIUS_API_KEY in .env.local',
    );
    holders = await fetchHoldersRPC(connection);
  }

  if (holders.length === 0) {
    throw new Error(
      'No holders found.\n' +
      '  → Set HELIUS_API_KEY in .env.local (free at helius.dev)\n' +
      '  → Or set NEXT_PUBLIC_SOLANA_RPC_URL to a dedicated RPC endpoint',
    );
  }

  // Deduplicate by address (keep highest balance if duplicates exist)
  const map = new Map<string, bigint>();
  for (const h of holders) {
    const existing = map.get(h.address);
    if (!existing || h.balance > existing) map.set(h.address, h.balance);
  }

  // Sort deterministically by address for consistent tree structure
  const deduped: HolderEntry[] = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([address, balance]) => ({ address, balance }));

  console.log(`Valid holders (balance ≥ 1 zkRUNE): ${deduped.length}`);
  return deduped;
}

async function main() {
  const connection = new Connection(RPC_URL, 'confirmed');

  // Fetch current slot for metadata
  const slot = await connection.getSlot();
  console.log(`Current slot: ${slot}`);

  // Fetch holders
  const holders = await fetchHolders(connection);

  if (holders.length === 0) {
    console.error('No holders found. Check mint address and RPC.');
    process.exit(1);
  }

  if (holders.length > Math.pow(2, TREE_DEPTH)) {
    console.error(`Too many holders (${holders.length}) for tree depth ${TREE_DEPTH}`);
    process.exit(1);
  }

  // Build Merkle tree
  console.log('Building Poseidon Merkle tree...');
  const { root, layers, indexByAddress } = buildTree(holders);
  console.log(`Root: ${root}`);

  // Build snapshot
  const meta: SnapshotMeta = {
    root: root.toString(),
    blockHeight: slot,
    timestamp: new Date().toISOString(),
    totalHolders: holders.length,
    depth: TREE_DEPTH,
  };

  const entries: Snapshot['entries'] = {};
  for (const holder of holders) {
    const idx = indexByAddress[holder.address];
    const { pathElements, pathIndices } = getMerklePath(layers, idx);

    entries[holder.address] = {
      balance: holder.balance.toString(), // bigint → decimal string (no precision loss)
      index: idx,
      pathElements: pathElements.map((e) => e.toString()),
      pathIndices,
    };
  }

  const snapshot: Snapshot = { meta, entries };

  // Write full snapshot (NOT in git — contains all holder addresses)
  const dataDir = path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'snapshot.json'),
    JSON.stringify(snapshot, null, 2),
  );
  console.log(`Snapshot written to data/snapshot.json (${holders.length} holders)`);

  // Write public meta only (committed to git)
  const publicDir = path.join(process.cwd(), 'public');
  fs.writeFileSync(
    path.join(publicDir, 'snapshot-meta.json'),
    JSON.stringify(meta, null, 2),
  );
  console.log('Metadata written to public/snapshot-meta.json');

  console.log('\nDone! Summary:');
  console.log(`  Holders : ${holders.length}`);
  console.log(`  Root    : ${root}`);
  console.log(`  Slot    : ${slot}`);
  console.log(`  Depth   : ${TREE_DEPTH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

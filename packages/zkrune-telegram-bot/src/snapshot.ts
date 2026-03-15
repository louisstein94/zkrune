/**
 * Snapshot service — fetches zkRUNE holders from Solana (via Helius DAS API
 * or standard RPC), builds a Poseidon Merkle tree, and keeps the result
 * in memory + on disk for the HTTP server and proof verification.
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import {
  buildTree,
  getMerklePath,
  HolderEntry,
  Snapshot,
  SnapshotMeta,
  TREE_DEPTH,
} from "./merkle";

const MINT_ADDRESS = "51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump";
const DECIMALS = 6;
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const DATA_DIR = path.resolve(__dirname, "../data");

let currentSnapshot: Snapshot | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

export function getSnapshot(): Snapshot | null {
  return currentSnapshot;
}

export function getSnapshotMeta(): SnapshotMeta | null {
  return currentSnapshot?.meta ?? null;
}

// ── Helius DAS API ──────────────────────────────────────────────────────────

async function fetchHoldersHelius(apiKey: string): Promise<HolderEntry[]> {
  console.log("[snapshot] Fetching holders via Helius DAS API...");
  const holders: HolderEntry[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: String(page),
          method: "getTokenAccounts",
          params: { mint: MINT_ADDRESS, limit: 1000, page },
        }),
      }
    );

    const json = (await res.json()) as any;
    if (json.error) throw new Error(`Helius: ${JSON.stringify(json.error)}`);

    const accounts: any[] = json.result?.token_accounts ?? [];
    if (accounts.length === 0) break;

    for (const acc of accounts) {
      const balance = BigInt(acc.amount) / BigInt(10 ** DECIMALS);
      if (balance < BigInt(1)) continue;
      holders.push({ address: acc.owner, balance });
    }

    console.log(
      `[snapshot]   Page ${page}: ${accounts.length} accounts (cumulative: ${holders.length})`
    );
    if (accounts.length < 1000) break;
    page++;
  }

  return holders;
}

// ── Standard RPC fallback ───────────────────────────────────────────────────

async function fetchHoldersRPC(
  connection: Connection
): Promise<HolderEntry[]> {
  console.log("[snapshot] Fetching holders via getProgramAccounts...");
  const mintPubkey = new PublicKey(MINT_ADDRESS);

  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: mintPubkey.toBase58() } },
    ],
  });

  const holders: HolderEntry[] = [];
  for (const { account } of accounts) {
    const data = account.data;
    if (data[108] !== 1) continue;
    const rawAmount = data.readBigUInt64LE(64);
    const balance = rawAmount / BigInt(10 ** DECIMALS);
    if (balance < BigInt(1)) continue;
    const ownerAddress = new PublicKey(data.slice(32, 64)).toBase58();
    holders.push({ address: ownerAddress, balance });
  }

  return holders;
}

// ── Dedup + sort ────────────────────────────────────────────────────────────

function dedup(holders: HolderEntry[]): HolderEntry[] {
  const map = new Map<string, bigint>();
  for (const h of holders) {
    const existing = map.get(h.address);
    if (!existing || h.balance > existing) map.set(h.address, h.balance);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([address, balance]) => ({ address, balance }));
}

// ── Build and persist ───────────────────────────────────────────────────────

export async function refreshSnapshot(): Promise<Snapshot> {
  const heliusKey = process.env.HELIUS_API_KEY || "";
  const rpcUrl = heliusKey
    ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
    : "https://api.mainnet-beta.solana.com";

  const connection = new Connection(rpcUrl, "confirmed");
  const slot = await connection.getSlot();
  console.log(`[snapshot] Current slot: ${slot}`);

  let holders: HolderEntry[];
  if (heliusKey) {
    holders = await fetchHoldersHelius(heliusKey);
  } else {
    console.warn(
      "[snapshot] HELIUS_API_KEY not set — falling back to getProgramAccounts"
    );
    holders = await fetchHoldersRPC(connection);
  }

  holders = dedup(holders);
  if (holders.length === 0) throw new Error("No holders found");

  console.log(
    `[snapshot] ${holders.length} holders, building Merkle tree...`
  );
  const { root, layers, indexByAddress } = buildTree(holders);
  console.log(`[snapshot] Root: ${root}`);

  const meta: SnapshotMeta = {
    root: root.toString(),
    blockHeight: slot,
    timestamp: new Date().toISOString(),
    totalHolders: holders.length,
    depth: TREE_DEPTH,
  };

  const entries: Snapshot["entries"] = {};
  for (const holder of holders) {
    const idx = indexByAddress[holder.address];
    const { pathElements, pathIndices } = getMerklePath(layers, idx);
    entries[holder.address] = {
      balance: holder.balance.toString(),
      index: idx,
      pathElements: pathElements.map((e) => e.toString()),
      pathIndices,
    };
  }

  const snapshot: Snapshot = { meta, entries };
  currentSnapshot = snapshot;

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, "snapshot.json"),
    JSON.stringify(snapshot, null, 2)
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "snapshot-meta.json"),
    JSON.stringify(meta, null, 2)
  );

  console.log(
    `[snapshot] Saved to data/ (${holders.length} holders, slot ${slot})`
  );
  return snapshot;
}

// ── Try loading from disk on startup ────────────────────────────────────────

function loadFromDisk(): boolean {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, "snapshot.json"), "utf-8");
    currentSnapshot = JSON.parse(raw);
    console.log(
      `[snapshot] Loaded from disk (${currentSnapshot!.meta.totalHolders} holders, ` +
        `${currentSnapshot!.meta.timestamp})`
    );
    return true;
  } catch {
    return false;
  }
}

// ── Start the cron ──────────────────────────────────────────────────────────

export function startSnapshotCron(): void {
  loadFromDisk();

  const run = async () => {
    try {
      await refreshSnapshot();
    } catch (err) {
      console.error("[snapshot] Refresh failed:", err);
    }
  };

  run();

  refreshTimer = setInterval(run, REFRESH_INTERVAL_MS);
  console.log(
    `[snapshot] Cron started — refreshing every ${REFRESH_INTERVAL_MS / 3_600_000}h`
  );
}

export function stopSnapshotCron(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

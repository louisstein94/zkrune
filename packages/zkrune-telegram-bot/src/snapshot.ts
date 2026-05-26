/**
 * Snapshot service for whale-holder-v2.
 *
 *   Helius DAS  ──►  raw Solana holders (addr, balance)
 *                          │
 *                          ▼
 *      filter to whales (balance >= threshold)
 *                          │
 *           ┌──────────────┴──────────────┐
 *           │                             │
 *      registered                    unregistered
 *  (in registry.json)             ("pending" list)
 *           │
 *           ▼
 *  Poseidon3(pkX, pkY, balance)  →  Merkle tree leaves
 *
 * Pending whales are surfaced through snapshot.json so the registration page
 * can tell a user "you're a whale, register your BJJ key to claim access."
 *
 * The tree itself never contains Solana addresses — only registered BJJ pubkeys.
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import {
  buildTree,
  getMerklePath,
  RegisteredHolder,
  Snapshot,
  SnapshotMeta,
  TREE_DEPTH,
} from "./merkle";
import { RegistryStore } from "./registry";

const MINT_ADDRESS =
  process.env.TOKEN_MINT || "51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump";
const DECIMALS = Number(process.env.TOKEN_DECIMALS || 6);
const THRESHOLD = process.env.EXPECTED_MIN_BALANCE
  ? BigInt(process.env.EXPECTED_MIN_BALANCE)
  : BigInt(10_000_000);
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const DATA_DIR = path.resolve(
  __dirname,
  process.env.DATA_DIR || "../data",
);
const STORE_DIR = path.resolve(
  __dirname,
  process.env.STORE_DIR || "..",
);

let currentSnapshot: Snapshot | null = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;

export function getSnapshot(): Snapshot | null {
  return currentSnapshot;
}

export function getSnapshotMeta(): SnapshotMeta | null {
  return currentSnapshot?.meta ?? null;
}

// Raw holder record before registry lookup.
interface RawHolder {
  address: string;
  balance: bigint;
}

// ── Helius DAS API ──────────────────────────────────────────────────────────
async function fetchHoldersHelius(apiKey: string): Promise<RawHolder[]> {
  console.log("[snapshot] Fetching holders via Helius DAS API...");
  const holders: RawHolder[] = [];
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
      },
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
      `[snapshot]   Page ${page}: ${accounts.length} accounts (cumulative: ${holders.length})`,
    );
    if (accounts.length < 1000) break;
    page++;
  }

  return holders;
}

// ── Standard RPC fallback ───────────────────────────────────────────────────
async function fetchHoldersRPC(
  connection: Connection,
): Promise<RawHolder[]> {
  console.log("[snapshot] Fetching holders via getProgramAccounts...");
  const mintPubkey = new PublicKey(MINT_ADDRESS);

  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      { dataSize: 165 },
      { memcmp: { offset: 0, bytes: mintPubkey.toBase58() } },
    ],
  });

  const holders: RawHolder[] = [];
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
function dedup(holders: RawHolder[]): RawHolder[] {
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

  // 1. Fetch all token holders.
  let rawHolders: RawHolder[];
  if (heliusKey) {
    rawHolders = await fetchHoldersHelius(heliusKey);
  } else {
    console.warn("[snapshot] HELIUS_API_KEY not set — falling back to getProgramAccounts");
    rawHolders = await fetchHoldersRPC(connection);
  }
  rawHolders = dedup(rawHolders);
  if (rawHolders.length === 0) throw new Error("No holders found");

  // 2. Filter to whales (balance >= threshold).
  const whales = rawHolders.filter((h) => h.balance >= THRESHOLD);
  console.log(
    `[snapshot] ${rawHolders.length} holders total, ${whales.length} whales (>= ${THRESHOLD})`,
  );

  // 3. Cross-reference registry: registered → tree leaf, unregistered → pending.
  const registry = new RegistryStore(STORE_DIR).load();
  const registered: RegisteredHolder[] = [];
  const pending: Record<string, { balance: string }> = {};

  for (const w of whales) {
    const reg = registry[w.address];
    if (reg) {
      registered.push({
        solanaAddress: w.address,
        bjjPubkeyX: BigInt(reg.bjjPubkeyX),
        bjjPubkeyY: BigInt(reg.bjjPubkeyY),
        balance: w.balance,
      });
    } else {
      pending[w.address] = { balance: w.balance.toString() };
    }
  }

  console.log(
    `[snapshot] Registered: ${registered.length}, pending registration: ${Object.keys(pending).length}`,
  );

  // 4. Build the Merkle tree over registered whales.
  const { root, layers, indexByBjjPubkeyX } = buildTree(registered);
  console.log(`[snapshot] Root: ${root}`);

  const meta: SnapshotMeta = {
    circuit: "whale-holder-v2",
    root: root.toString(),
    depth: TREE_DEPTH,
    blockHeight: slot,
    timestamp: new Date().toISOString(),
    totalWhales: whales.length,
    totalRegistered: registered.length,
    totalPending: Object.keys(pending).length,
  };

  const tree: Snapshot["tree"] = {};
  for (const holder of registered) {
    const pkXKey = holder.bjjPubkeyX.toString();
    const idx = indexByBjjPubkeyX[pkXKey];
    const { pathElements, pathIndices } = getMerklePath(layers, idx);
    tree[pkXKey] = {
      balance: holder.balance.toString(),
      index: idx,
      pathElements: pathElements.map((e) => e.toString()),
      pathIndices,
      bjjPubkeyY: holder.bjjPubkeyY.toString(),
    };
  }

  const snapshot: Snapshot = { meta, tree, pending };
  currentSnapshot = snapshot;

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, "snapshot.json"),
    JSON.stringify(snapshot, null, 2),
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "snapshot-meta.json"),
    JSON.stringify(meta, null, 2),
  );

  console.log(
    `[snapshot] Saved to data/ — ${registered.length} in tree, ${Object.keys(pending).length} pending`,
  );
  return snapshot;
}

// ── Try loading from disk on startup ────────────────────────────────────────
function loadFromDisk(): boolean {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, "snapshot.json"), "utf-8");
    currentSnapshot = JSON.parse(raw);
    const meta = currentSnapshot!.meta;
    console.log(
      `[snapshot] Loaded from disk — circuit=${meta.circuit}, registered=${meta.totalRegistered}, pending=${meta.totalPending}, ${meta.timestamp}`,
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
    `[snapshot] Cron started — refreshing every ${REFRESH_INTERVAL_MS / 3_600_000}h`,
  );
}

export function stopSnapshotCron(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

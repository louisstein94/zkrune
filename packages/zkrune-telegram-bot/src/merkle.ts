/**
 * Poseidon-based sparse Merkle tree utilities for whale-holder-v2.
 *
 * v2 differs from v1 in the leaf shape:
 *   v1: leaf = Poseidon(addressField, balance)         (no ownership binding)
 *   v2: leaf = Poseidon(bjjPubkeyX, bjjPubkeyY, balance) (ownership-bound via BJJ)
 *
 * The Solana address never enters the v2 tree. Holders register a BabyJubjub
 * keypair off-band by signing the BJJ pubkey with their Solana wallet; the
 * registry maps (solanaAddress → bjjPubkey), and the snapshot job substitutes
 * the bjj pubkey into the leaf for every registered holder. Unregistered
 * whales are tracked in a `pending` list and not in the tree.
 *
 * Hash function: Poseidon (matches circuits/whale-holder-v2/circuit.circom).
 */

import { poseidon2, poseidon3 } from "poseidon-lite";

export const TREE_DEPTH = 20;

// ── Zero hashes ──────────────────────────────────────────────────────────────
// zeroHashes[d] = Poseidon hash of a completely empty subtree of depth d.
export const ZERO_HASHES: bigint[] = (() => {
  const z: bigint[] = [poseidon2([BigInt(0), BigInt(0)])];
  for (let i = 1; i <= TREE_DEPTH; i++) {
    z.push(poseidon2([z[i - 1], z[i - 1]]));
  }
  return z;
})();

// ── Leaf hash (v2) ───────────────────────────────────────────────────────────
// leaf = Poseidon3(bjjPubkeyX, bjjPubkeyY, balance)
export function leafHashV2(
  bjjPubkeyX: bigint,
  bjjPubkeyY: bigint,
  balance: bigint,
): bigint {
  return poseidon3([bjjPubkeyX, bjjPubkeyY, balance]);
}

// ── Registered holder (input to buildTree) ───────────────────────────────────
export interface RegisteredHolder {
  solanaAddress: string;
  bjjPubkeyX: bigint;
  bjjPubkeyY: bigint;
  balance: bigint;
}

// ── Sparse Merkle tree ───────────────────────────────────────────────────────
export type SparseLayers = Map<number, bigint>[];

export function buildTree(holders: RegisteredHolder[]): {
  root: bigint;
  layers: SparseLayers;
  indexByBjjPubkeyX: Record<string, number>;
} {
  const layers: SparseLayers = [new Map()];
  const indexByBjjPubkeyX: Record<string, number> = {};

  holders.forEach((h, idx) => {
    layers[0].set(idx, leafHashV2(h.bjjPubkeyX, h.bjjPubkeyY, h.balance));
    indexByBjjPubkeyX[h.bjjPubkeyX.toString()] = idx;
  });

  for (let d = 0; d < TREE_DEPTH; d++) {
    const cur = layers[d];
    const next: Map<number, bigint> = new Map();

    for (const [idx, hash] of Array.from(cur.entries())) {
      const parentIdx = idx >> 1;
      if (next.has(parentIdx)) continue;

      const isRight    = (idx & 1) === 1;
      const siblingIdx = isRight ? idx - 1 : idx + 1;
      const sibling    = cur.get(siblingIdx) ?? ZERO_HASHES[d];

      const left  = isRight ? sibling : hash;
      const right = isRight ? hash    : sibling;

      next.set(parentIdx, poseidon2([left, right]));
    }

    layers.push(next);
  }

  const root = layers[TREE_DEPTH].get(0) ?? ZERO_HASHES[TREE_DEPTH];
  return { root, layers, indexByBjjPubkeyX };
}

// ── Merkle path for a leaf ───────────────────────────────────────────────────
export function getMerklePath(
  layers: SparseLayers,
  idx: number,
): { pathElements: bigint[]; pathIndices: number[] } {
  const pathElements: bigint[] = [];
  const pathIndices: number[]  = [];

  let cur = idx;
  for (let d = 0; d < TREE_DEPTH; d++) {
    const isRight    = (cur & 1) === 1;
    const siblingIdx = isRight ? cur - 1 : cur + 1;

    pathIndices.push(isRight ? 1 : 0);
    pathElements.push(layers[d].get(siblingIdx) ?? ZERO_HASHES[d]);

    cur = cur >> 1;
  }

  return { pathElements, pathIndices };
}

// ── Snapshot types (v2) ──────────────────────────────────────────────────────
export interface SnapshotMeta {
  circuit: "whale-holder-v2";
  root: string;
  depth: number;
  blockHeight: number;
  timestamp: string;
  totalWhales: number;
  totalRegistered: number;
  totalPending: number;
}

export interface SnapshotEntry {
  balance: string;
  index: number;
  pathElements: string[];
  pathIndices: number[];
  bjjPubkeyY: string;
}

export interface PendingHolder {
  balance: string;
}

export interface Snapshot {
  meta: SnapshotMeta;
  tree: Record<string, SnapshotEntry>;
  pending: Record<string, PendingHolder>;
}

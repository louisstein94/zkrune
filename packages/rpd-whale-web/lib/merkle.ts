/**
 * Poseidon-based sparse Merkle tree utilities.
 *
 * Shared between:
 *   - scripts/snapshot-holders.ts  (Node.js build time)
 *   - app/api/merkle-path/route.ts (Next.js API runtime)
 *   - app/whale-chat/page.tsx      (browser, for addressToField only)
 *
 * Hash function: Poseidon(2) — matches circuits/whale-holder/circuit.circom exactly.
 *
 * poseidon2([a, b]) from poseidon-lite is t=3 (2 inputs + capacity),
 * identical to Circom's Poseidon(2). Verified against circomlib test vectors.
 */

import { poseidon2 } from 'poseidon-lite';
import { PublicKey } from '@solana/web3.js';

export const TREE_DEPTH = 20; // must match circuit WhaleHolderProof(depth)

// ── Zero hashes (IIFE — computed once at module load, never recomputed) ───────
// zeroHashes[d] = Poseidon hash of a completely empty subtree of depth d.
// Used as sibling values for non-existent branches in the sparse tree.
export const ZERO_HASHES: bigint[] = (() => {
  const z: bigint[] = [poseidon2([BigInt(0), BigInt(0)])];
  for (let i = 1; i <= TREE_DEPTH; i++) {
    z.push(poseidon2([z[i - 1], z[i - 1]]));
  }
  return z;
})();

export const ZERO_LEAF = ZERO_HASHES[0];

// ── Address → BN254 field element ────────────────────────────────────────────
// BN254 prime ≈ 2^254. A Solana pubkey is 32 bytes (256 bits).
// We use the first 31 bytes (248 bits < 2^248 < BN254 prime) → always safe.
// Two addresses can only collide if their first 31 bytes are identical:
// probability ≈ 1/2^248 — negligible even for millions of holders.
export function addressToField(address: string): bigint {
  const bytes = new PublicKey(address).toBytes();
  let val = BigInt(0);
  for (let i = 0; i < 31; i++) {
    val = (val << BigInt(8)) | BigInt(bytes[i]);
  }
  return val;
}

// ── Leaf hash ─────────────────────────────────────────────────────────────────
// leaf = Poseidon(addressField, balance)
// balance is bigint to avoid JS float precision loss for amounts > 2^53.
// Snapshot stores balance as a string; convert with BigInt(entry.balance).
export function leafHash(address: string, balance: bigint): bigint {
  return poseidon2([addressToField(address), balance]);
}

// ── HolderEntry ───────────────────────────────────────────────────────────────
export interface HolderEntry {
  address: string;
  balance: bigint; // whole tokens (raw / 10^6), bigint to prevent float precision loss
}

// ── Sparse Merkle tree ────────────────────────────────────────────────────────
// Each layer is Map<nodeIndex, hash>. Missing nodes implicitly equal ZERO_HASHES[layer].
// Complexity: O(n × depth) time and space — fast for thousands of holders.

export type SparseLayers = Map<number, bigint>[];

export function buildTree(holders: HolderEntry[]): {
  root: bigint;
  layers: SparseLayers;
  indexByAddress: Record<string, number>;
} {
  const layers: SparseLayers = [new Map()];
  const indexByAddress: Record<string, number> = {};

  // Layer 0 — leaf hashes
  // Assumes one entry per address (duplicate addresses are overwritten).
  holders.forEach((h, idx) => {
    layers[0].set(idx, leafHash(h.address, h.balance));
    indexByAddress[h.address] = idx;
  });

  // Build parent layers bottom-up
  for (let d = 0; d < TREE_DEPTH; d++) {
    const cur = layers[d];
    const next: Map<number, bigint> = new Map();

    for (const [idx, hash] of Array.from(cur.entries())) {
      const parentIdx = idx >> 1;
      if (next.has(parentIdx)) continue; // sibling already triggered this parent

      const isRight    = (idx & 1) === 1;
      const siblingIdx = isRight ? idx - 1 : idx + 1;
      const sibling    = cur.get(siblingIdx) ?? ZERO_HASHES[d];

      // Circuit convention: Poseidon(left, right)
      // left  = current node if it is the left child  (isRight=false)
      // right = current node if it is the right child (isRight=true)
      const left  = isRight ? sibling : hash;
      const right = isRight ? hash    : sibling;

      next.set(parentIdx, poseidon2([left, right]));
    }

    layers.push(next);
  }

  const root = layers[TREE_DEPTH].get(0) ?? ZERO_HASHES[TREE_DEPTH];
  return { root, layers, indexByAddress };
}

// ── Merkle path for a leaf ────────────────────────────────────────────────────
// pathIndices[i] = 0 → current node is the LEFT  child at level i → sibling is right
// pathIndices[i] = 1 → current node is the RIGHT child at level i → sibling is left
//
// This matches the circuit's Mux1 convention:
//   muxL[i].s = pathIndices[i]
//     s=0 → left  = levelHash[i] (current), right = pathElements[i] (sibling) ✓
//     s=1 → left  = pathElements[i] (sibling), right = levelHash[i] (current) ✓
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

// ── Snapshot types ────────────────────────────────────────────────────────────
export interface SnapshotMeta {
  root: string;        // bigint serialized as decimal string
  blockHeight: number;
  timestamp: string;
  totalHolders: number;
  depth: number;
}

export interface SnapshotEntry {
  balance: string;       // bigint serialized as decimal string
  index: number;
  pathElements: string[]; // bigint[] serialized as decimal strings
  pathIndices: number[];
}

export interface Snapshot {
  meta: SnapshotMeta;
  entries: Record<string, SnapshotEntry>; // keyed by Solana address (base58)
}

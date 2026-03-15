/**
 * Poseidon-based sparse Merkle tree utilities.
 *
 * Mirrors lib/merkle.ts from the main project — bundled here so the bot
 * can run independently on Railway without depending on the Next.js tree.
 *
 * Hash: Poseidon(2) from poseidon-lite (t=3, 2 inputs + capacity).
 * Matches circuits/whale-holder/circuit.circom exactly.
 */

import { poseidon2 } from "poseidon-lite";
import { PublicKey } from "@solana/web3.js";

export const TREE_DEPTH = 20;

export const ZERO_HASHES: bigint[] = (() => {
  const z: bigint[] = [poseidon2([BigInt(0), BigInt(0)])];
  for (let i = 1; i <= TREE_DEPTH; i++) {
    z.push(poseidon2([z[i - 1], z[i - 1]]));
  }
  return z;
})();

export function addressToField(address: string): bigint {
  const bytes = new PublicKey(address).toBytes();
  let val = BigInt(0);
  for (let i = 0; i < 31; i++) {
    val = (val << BigInt(8)) | BigInt(bytes[i]);
  }
  return val;
}

export function leafHash(address: string, balance: bigint): bigint {
  return poseidon2([addressToField(address), balance]);
}

export interface HolderEntry {
  address: string;
  balance: bigint;
}

export type SparseLayers = Map<number, bigint>[];

export function buildTree(holders: HolderEntry[]): {
  root: bigint;
  layers: SparseLayers;
  indexByAddress: Record<string, number>;
} {
  const layers: SparseLayers = [new Map()];
  const indexByAddress: Record<string, number> = {};

  holders.forEach((h, idx) => {
    layers[0].set(idx, leafHash(h.address, h.balance));
    indexByAddress[h.address] = idx;
  });

  for (let d = 0; d < TREE_DEPTH; d++) {
    const cur = layers[d];
    const next: Map<number, bigint> = new Map();

    for (const [idx, hash] of Array.from(cur.entries())) {
      const parentIdx = idx >> 1;
      if (next.has(parentIdx)) continue;

      const isRight = (idx & 1) === 1;
      const siblingIdx = isRight ? idx - 1 : idx + 1;
      const sibling = cur.get(siblingIdx) ?? ZERO_HASHES[d];

      const left = isRight ? sibling : hash;
      const right = isRight ? hash : sibling;
      next.set(parentIdx, poseidon2([left, right]));
    }

    layers.push(next);
  }

  const root = layers[TREE_DEPTH].get(0) ?? ZERO_HASHES[TREE_DEPTH];
  return { root, layers, indexByAddress };
}

export function getMerklePath(
  layers: SparseLayers,
  idx: number
): { pathElements: bigint[]; pathIndices: number[] } {
  const pathElements: bigint[] = [];
  const pathIndices: number[] = [];

  let cur = idx;
  for (let d = 0; d < TREE_DEPTH; d++) {
    const isRight = (cur & 1) === 1;
    const siblingIdx = isRight ? cur - 1 : cur + 1;
    pathIndices.push(isRight ? 1 : 0);
    pathElements.push(layers[d].get(siblingIdx) ?? ZERO_HASHES[d]);
    cur = cur >> 1;
  }

  return { pathElements, pathIndices };
}

export interface SnapshotMeta {
  root: string;
  blockHeight: number;
  timestamp: string;
  totalHolders: number;
  depth: number;
}

export interface SnapshotEntry {
  balance: string;
  index: number;
  pathElements: string[];
  pathIndices: number[];
}

export interface Snapshot {
  meta: SnapshotMeta;
  entries: Record<string, SnapshotEntry>;
}

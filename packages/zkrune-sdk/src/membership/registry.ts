/**
 * MembershipRegistry — Poseidon-based sparse Merkle tree for group membership.
 *
 * Integrators create a registry, add members, publish the root, and members
 * can independently generate ZK proofs of inclusion using the membership-proof
 * circuit (depth=16, supports up to 65,536 members).
 *
 * Leaf hash: Poseidon(memberId) — single input, matching the circuit's
 * `Poseidon(1)` component.
 *
 * Usage:
 *   const registry = new MembershipRegistry();
 *   registry.addMember("alice");
 *   registry.addMember("bob");
 *   const root = registry.getRoot();
 *   const proof = registry.getMemberProof("alice");
 *   // proof.pathElements, proof.pathIndices, proof.root
 */

import { poseidon1, poseidon2 } from 'poseidon-lite';

const DEFAULT_DEPTH = 16;

type SparseLayers = Map<number, bigint>[];

function stringToBigInt(memberId: string): bigint {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(memberId);
  let val = BigInt(0);
  const limit = Math.min(bytes.length, 31);
  for (let i = 0; i < limit; i++) {
    val = (val << BigInt(8)) | BigInt(bytes[i]);
  }
  if (val === BigInt(0)) {
    throw new Error('memberId must not be empty or all-zero');
  }
  return val;
}

function memberLeafHash(memberId: string): bigint {
  return poseidon1([stringToBigInt(memberId)]);
}

function computeZeroHashes(depth: number): bigint[] {
  const z: bigint[] = [poseidon2([BigInt(0), BigInt(0)])];
  for (let i = 1; i <= depth; i++) {
    z.push(poseidon2([z[i - 1], z[i - 1]]));
  }
  return z;
}

export class MembershipRegistry {
  private depth: number;
  private members: string[] = [];
  private memberIndex: Map<string, number> = new Map();
  private layers: SparseLayers = [];
  private zeroHashes: bigint[];
  private dirty = true;

  constructor(depth: number = DEFAULT_DEPTH) {
    if (depth < 1 || depth > 32) throw new Error('depth must be 1..32');
    this.depth = depth;
    this.zeroHashes = computeZeroHashes(depth);
  }

  addMember(memberId: string): void {
    if (this.memberIndex.has(memberId)) return;
    if (this.members.length >= 2 ** this.depth) {
      throw new Error(`Registry full: max ${2 ** this.depth} members for depth=${this.depth}`);
    }
    const idx = this.members.length;
    this.members.push(memberId);
    this.memberIndex.set(memberId, idx);
    this.dirty = true;
  }

  removeMember(memberId: string): void {
    if (!this.memberIndex.has(memberId)) return;
    const idx = this.memberIndex.get(memberId)!;
    this.members.splice(idx, 1);
    this.memberIndex.clear();
    this.members.forEach((m, i) => this.memberIndex.set(m, i));
    this.dirty = true;
  }

  getMembers(): string[] {
    return [...this.members];
  }

  get size(): number {
    return this.members.length;
  }

  getRoot(): string {
    this.rebuild();
    const root = this.layers[this.depth].get(0) ?? this.zeroHashes[this.depth];
    return root.toString();
  }

  getMemberProof(memberId: string): {
    pathElements: string[];
    pathIndices: number[];
    root: string;
    memberId: string;
  } {
    const idx = this.memberIndex.get(memberId);
    if (idx === undefined) {
      throw new Error(`Member "${memberId}" not found in registry`);
    }

    this.rebuild();

    const pathElements: bigint[] = [];
    const pathIndices: number[] = [];

    let cur = idx;
    for (let d = 0; d < this.depth; d++) {
      const isRight = (cur & 1) === 1;
      const siblingIdx = isRight ? cur - 1 : cur + 1;

      pathIndices.push(isRight ? 1 : 0);
      pathElements.push(this.layers[d].get(siblingIdx) ?? this.zeroHashes[d]);

      cur = cur >> 1;
    }

    return {
      pathElements: pathElements.map(e => e.toString()),
      pathIndices,
      root: this.getRoot(),
      memberId,
    };
  }

  static fromMembers(memberIds: string[], depth: number = DEFAULT_DEPTH): MembershipRegistry {
    const registry = new MembershipRegistry(depth);
    for (const id of memberIds) {
      registry.addMember(id);
    }
    return registry;
  }

  /**
   * Returns the circuit input object ready for snarkjs.groth16.fullProve().
   * The memberId is converted to a field element internally.
   */
  getCircuitInputs(memberId: string): {
    memberId: string;
    pathElements: string[];
    pathIndices: string[];
    root: string;
  } {
    const proof = this.getMemberProof(memberId);
    return {
      memberId: stringToBigInt(memberId).toString(),
      pathElements: proof.pathElements,
      pathIndices: proof.pathIndices.map(i => i.toString()),
      root: proof.root,
    };
  }

  private rebuild(): void {
    if (!this.dirty) return;

    this.layers = [new Map()];

    for (let i = 0; i < this.members.length; i++) {
      this.layers[0].set(i, memberLeafHash(this.members[i]));
    }

    for (let d = 0; d < this.depth; d++) {
      const cur = this.layers[d];
      const next: Map<number, bigint> = new Map();

      for (const [idx] of Array.from(cur.entries())) {
        const parentIdx = idx >> 1;
        if (next.has(parentIdx)) continue;

        const isRight = (idx & 1) === 1;
        const siblingIdx = isRight ? idx - 1 : idx + 1;
        const leftIdx = isRight ? siblingIdx : idx;
        const rightIdx = isRight ? idx : siblingIdx;

        const left = cur.get(leftIdx) ?? this.zeroHashes[d];
        const right = cur.get(rightIdx) ?? this.zeroHashes[d];

        next.set(parentIdx, poseidon2([left, right]));
      }

      this.layers.push(next);
    }

    this.dirty = false;
  }
}

export { memberLeafHash, stringToBigInt, DEFAULT_DEPTH };

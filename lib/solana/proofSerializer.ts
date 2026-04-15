// Solana Groth16 proof serializer.
//
// Previously duplicated across components/SolanaVerifier.tsx and
// lib/hooks/useOnChainVerify.ts. Any bug in one file had to be fixed
// twice. This module centralizes the BN254 field arithmetic, G1/G2
// packing, and the final instruction-data layout so the on-chain
// Groth16 program receives an identical byte sequence from every
// caller in the codebase.
//
// Layout:
//   [templateId u8][proofA 64B G1 negated][proofB 128B G2][proofC 64B G1][publicSignals n*32B]

export const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088696311157297823662689037894645226208583',
);

export interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  [key: string]: unknown;
}

/** Decimal string → 32-byte big-endian array, reduced mod BN254_PRIME. */
export function fieldToBytes(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xff));
    n = n >> BigInt(8);
  }
  return bytes;
}

/** Negate a G1 y-coordinate: (x, y) → (x, p - y). */
export function negateG1(point: string[]): string[] {
  const y = BigInt(point[1]);
  const negY = y === BigInt(0) ? BigInt(0) : BN254_PRIME - (y % BN254_PRIME);
  return [point[0], negY.toString()];
}

/** G1 → 64 bytes (x BE, y BE). */
export function g1ToBytes(point: string[]): Uint8Array {
  const result = new Uint8Array(64);
  result.set(fieldToBytes(point[0]), 0);
  result.set(fieldToBytes(point[1]), 32);
  return result;
}

/**
 * G2 → 128 bytes in Light Protocol order.
 * snarkjs encodes point as [[x.c1, x.c0], [y.c1, y.c0]];
 * we emit [x.c0, x.c1, y.c0, y.c1] (each 32B BE).
 */
export function g2ToBytes(point: string[][]): Uint8Array {
  const result = new Uint8Array(128);
  result.set(fieldToBytes(point[0][1]), 0);
  result.set(fieldToBytes(point[0][0]), 32);
  result.set(fieldToBytes(point[1][1]), 64);
  result.set(fieldToBytes(point[1][0]), 96);
  return result;
}

/**
 * Build the full instruction data payload consumed by the Solana
 * Groth16 verifier program.
 */
export function serializeProof(
  templateId: number,
  proof: Groth16Proof,
  publicSignals: string[],
): Uint8Array {
  const size = 1 + 64 + 128 + 64 + publicSignals.length * 32;
  const data = new Uint8Array(size);
  let offset = 0;

  data[offset] = templateId;
  offset += 1;

  // Proof A is negated so the program can skip the negation step.
  data.set(g1ToBytes(negateG1(proof.pi_a)), offset);
  offset += 64;

  data.set(g2ToBytes(proof.pi_b), offset);
  offset += 128;

  data.set(g1ToBytes(proof.pi_c), offset);
  offset += 64;

  for (const input of publicSignals) {
    data.set(fieldToBytes(input), offset);
    offset += 32;
  }

  return data;
}

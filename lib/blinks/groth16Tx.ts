import {
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { getSolanaRpcUrl } from '../solanaRpc';

// On-chain Groth16 verifier program (Solana mainnet). Shared by every
// Blink route that submits a proof for trustless on-chain verification.
export const GROTH16_PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_GROTH16_VERIFIER_PROGRAM || '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad',
);

// Template id per circuit — must match the layout baked into the program.
export const TEMPLATE_IDS: Record<string, number> = {
  'age-verification': 0,
  'balance-proof': 1,
  'membership-proof': 2,
  'credential-proof': 3,
  'private-voting': 4,
  'nft-ownership': 5,
  'range-proof': 6,
  'hash-preimage': 7,
  'quadratic-voting': 8,
  'anonymous-reputation': 9,
  'token-swap': 10,
  'patience-proof': 11,
  'signature-verification': 12,
};

export { MAINNET_PUBLIC_RPC } from '../solanaRpc';

/** @deprecated Import getSolanaRpcUrl from lib/solanaRpc instead. */
export function getRpcUrl(): string {
  return getSolanaRpcUrl();
}

const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088696311157297823662689037894645226208583',
);

function fieldToBytes(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xff));
    n >>= BigInt(8);
  }
  return bytes;
}

function negateG1Y(point: string[]): string[] {
  const y = BigInt(point[1]);
  const negY = y === 0n ? 0n : BN254_PRIME - (y % BN254_PRIME);
  return [point[0], negY.toString()];
}

function g1ToBytes(point: string[]): Uint8Array {
  const out = new Uint8Array(64);
  out.set(fieldToBytes(point[0]), 0);
  out.set(fieldToBytes(point[1]), 32);
  return out;
}

function g2ToBytes(point: string[][]): Uint8Array {
  const out = new Uint8Array(128);
  out.set(fieldToBytes(point[0][1]), 0);
  out.set(fieldToBytes(point[0][0]), 32);
  out.set(fieldToBytes(point[1][1]), 64);
  out.set(fieldToBytes(point[1][0]), 96);
  return out;
}

export function buildVerifyInstruction(
  templateId: number,
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] },
  publicInputs: string[],
): TransactionInstruction {
  const size = 1 + 64 + 128 + 64 + publicInputs.length * 32;
  const data = new Uint8Array(size);
  let offset = 0;

  data[offset] = templateId;
  offset += 1;

  const negA = negateG1Y(proof.pi_a);
  data.set(g1ToBytes(negA), offset);
  offset += 64;

  data.set(g2ToBytes(proof.pi_b), offset);
  offset += 128;

  data.set(g1ToBytes(proof.pi_c), offset);
  offset += 64;

  for (const signal of publicInputs) {
    data.set(fieldToBytes(signal), offset);
    offset += 32;
  }

  return new TransactionInstruction({
    keys: [],
    programId: GROTH16_PROGRAM,
    data: Buffer.from(data),
  });
}

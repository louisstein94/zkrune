/**
 * Circuit registry and verifier configuration.
 *
 * This package targets the zkRune verifier deployed on Base mainnet. The
 * Solana and Sui verifiers accept the same proof envelope through a different
 * call interface — contact zkRune if you need to gate against those instead.
 */

/**
 * Maps a circuit name to the on-chain template id the Base verifier expects.
 * These ids are fixed by the deployed contract — do not reorder.
 */
export const TEMPLATE_IDS = {
  "age-verification": 0,
  "balance-proof": 1,
  "membership-proof": 2,
  "credential-proof": 3,
  "private-voting": 4,
  "nft-ownership": 5,
  "range-proof": 6,
  "hash-preimage": 7,
  "quadratic-voting": 8,
  "anonymous-reputation": 9,
  "token-swap": 10,
  "patience-proof": 11,
  "signature-verification": 12,
  "whale-holder": 13,
} as const;

export type CircuitName = keyof typeof TEMPLATE_IDS;

/** zkRune verifier contract on Base mainnet. */
export const BASE_VERIFIER_ADDRESS =
  "0xa03A353d890033aC9b3044776440C2a4c9E849EA" as const;

/** A public Base RPC. Override with your own for production traffic. */
export const DEFAULT_BASE_RPC = "https://mainnet.base.org";

/** verifyProofStatic is a view function — no wallet, no gas. */
export const VERIFIER_ABI = [
  "function verifyProofStatic(uint8 templateId, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicInputs) view returns (bool)",
] as const;

export function isKnownCircuit(name: string): name is CircuitName {
  return name in TEMPLATE_IDS;
}

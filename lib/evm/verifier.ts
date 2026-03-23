/**
 * EVM Groth16 Verifier Client
 * Submits proofs to the deployed Groth16Verifier contract on EVM chains.
 */

const GROTH16_VERIFIER_ABI = [
  "function verifyProof(uint8 templateId, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicInputs) returns (bool)",
  "function verifyProofStatic(uint8 templateId, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicInputs) view returns (bool)",
  "function getCircuitInfo(uint8 templateId) view returns (string name, uint256 nPublic, bool registered)",
  "function circuitCount() view returns (uint8)",
  "event ProofVerified(uint8 indexed templateId, bool valid, address indexed verifier)",
] as const;

export const EVM_CIRCUIT_IDS: Record<string, number> = {
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
};

export interface EvmProofData {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
  publicInputs: string[];
}

/**
 * Convert snarkjs proof format to EVM contract format.
 * snarkjs G2 uses [c1, c0] ordering; Solidity expects [c0, c1].
 */
export function formatProofForEvm(
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] },
  publicSignals: string[],
): EvmProofData {
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
    publicInputs: publicSignals,
  };
}

export { GROTH16_VERIFIER_ABI };

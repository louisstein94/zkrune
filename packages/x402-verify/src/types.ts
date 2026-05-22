/**
 * Wire types for the zkRune x402 eligibility gate.
 *
 * The gate runs entirely on HTTP headers — it never inspects or mutates the
 * request body. That keeps it composable with any x402 handler regardless of
 * what the endpoint actually does.
 */

/** A Groth16 proof in the shape snarkjs emits. */
export interface Groth16Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol?: string;
  curve?: string;
}

/**
 * The decoded payload of the `X-zkRune-Proof` header.
 * On the wire it is base64(JSON.stringify(envelope)).
 */
export interface ZkRuneProofEnvelope {
  proof: Groth16Proof;
  publicSignals: string[];
}

/** Why a proof failed to satisfy the gate. */
export type RejectReason =
  | "missing_headers"
  | "unknown_circuit"
  | "circuit_mismatch"
  | "malformed_proof"
  | "public_signals_rejected"
  | "proof_rejected"
  | "verifier_error";

/** Result of a raw on-chain verification (see verify.ts). */
export interface VerifyResult {
  valid: boolean;
  circuit?: string;
  publicSignals?: string[];
  reason?: RejectReason;
  /** Present only for verifier_error — the underlying RPC/decoding message. */
  error?: string;
}

/** A ready-to-send rejection, framework-agnostic (see gate.ts). */
export interface GateResponse {
  status: number;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

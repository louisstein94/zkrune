/**
 * The eligibility gate.
 *
 * evaluateZkRuneGate reads the zkRune headers off a request, runs the proof
 * through the on-chain verifier, applies the endpoint's policy, and returns
 * either `null` (the request may proceed) or a framework-agnostic
 * `GateResponse` describing the rejection.
 *
 * The rejection mirrors the x402 challenge pattern: a client that gets a 403
 * back learns exactly which circuit to prove and where to generate the proof,
 * then retries with the `X-zkRune-Proof` header — the same retry loop x402
 * already uses for `X-Payment`.
 */

import { verifyZkRuneProof, decodeProofHeader } from "./verify.js";
import { BASE_VERIFIER_ADDRESS, isKnownCircuit } from "./chains.js";
import type { CircuitName } from "./chains.js";
import type { GateResponse } from "./types.js";

export const HEADER_PROOF = "X-zkRune-Proof";
export const HEADER_CIRCUIT = "X-zkRune-Circuit";
export const HEADER_VERIFIER = "X-zkRune-Verifier";

export interface GateOptions {
  /** Circuit this endpoint requires. A proof for any other circuit is rejected. */
  requiredCircuit: CircuitName;
  /** Base RPC URL. Defaults to the public endpoint — set your own in prod. */
  rpcUrl?: string;
  /** Override the verifier contract address. */
  verifierAddress?: `0x${string}`;
  /**
   * Optional policy check on the proof's public signals. Use this to pin
   * values the circuit exposes — e.g. for age-verification, assert that
   * `currentYear` is actually current and `minimumAge >= 18`, so a client
   * cannot prove against a stale year or a threshold of zero.
   */
  validatePublicSignals?: (publicSignals: string[]) => boolean;
  /** Where clients should generate a proof. Shown in the 403 challenge. */
  generateProofUrl?: string;
}

/** A reader for a single header value. Case-insensitive lookups expected. */
export type HeaderReader = (name: string) => string | null | undefined;

function challenge(
  options: GateOptions,
  reason: string,
  message: string,
  status = 403
): GateResponse {
  const verifier = `base:${options.verifierAddress ?? BASE_VERIFIER_ADDRESS}`;
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-zkRune-Required": options.requiredCircuit,
    },
    body: {
      error: "zkrune_eligibility_required",
      reason,
      circuit: options.requiredCircuit,
      verifier,
      generateProofAt: options.generateProofUrl ?? "https://zkrune.com",
      message,
    },
  };
}

/**
 * Evaluate the gate. Returns `null` to allow the request, or a `GateResponse`
 * to reject it. Never throws — verifier/RPC failures surface as a 503.
 */
export async function evaluateZkRuneGate(
  getHeader: HeaderReader,
  options: GateOptions
): Promise<GateResponse | null> {
  const proofHeader = getHeader(HEADER_PROOF);
  const circuitHeader = getHeader(HEADER_CIRCUIT);

  if (!proofHeader || !circuitHeader) {
    return challenge(
      options,
      "missing_headers",
      `This endpoint requires a zkRune ${options.requiredCircuit} proof. ` +
        `Generate one, then retry with the ${HEADER_PROOF} and ${HEADER_CIRCUIT} headers.`
    );
  }

  if (!isKnownCircuit(circuitHeader) || circuitHeader !== options.requiredCircuit) {
    return challenge(
      options,
      "circuit_mismatch",
      `This endpoint accepts only the "${options.requiredCircuit}" circuit, ` +
        `but the request presented "${circuitHeader}".`
    );
  }

  const envelope = decodeProofHeader(proofHeader);
  if (!envelope) {
    return challenge(
      options,
      "malformed_proof",
      `The ${HEADER_PROOF} header is not a valid base64-encoded proof envelope.`
    );
  }

  const result = await verifyZkRuneProof(circuitHeader, envelope, {
    rpcUrl: options.rpcUrl,
    verifierAddress: options.verifierAddress,
  });

  if (result.reason === "verifier_error") {
    // The proof may be fine — the on-chain verifier was unreachable. Fail
    // closed, but with a 503 so the client retries rather than regenerates.
    return {
      status: 503,
      headers: { "Content-Type": "application/json", "Retry-After": "5" },
      body: {
        error: "zkrune_verifier_unavailable",
        message: "Could not reach the zkRune verifier. Retry shortly.",
      },
    };
  }

  if (!result.valid) {
    return challenge(
      options,
      result.reason ?? "proof_rejected",
      "The zkRune proof did not pass on-chain verification."
    );
  }

  if (
    options.validatePublicSignals &&
    !options.validatePublicSignals(result.publicSignals ?? [])
  ) {
    return challenge(
      options,
      "public_signals_rejected",
      "The proof is valid but its public signals do not satisfy this endpoint's policy."
    );
  }

  return null;
}

/**
 * @zkrune/x402-verify
 *
 * Endpoint-level zero-knowledge eligibility gate for x402 services.
 *
 * x402 answers "who paid?". zkRune answers "who is allowed?". This package
 * verifies a zkRune Groth16 proof against the on-chain verifier before your
 * endpoint serves a paid response — server-enforced, ~50ms, no gas.
 */

export { evaluateZkRuneGate, HEADER_PROOF, HEADER_CIRCUIT, HEADER_VERIFIER } from "./gate.js";
export type { GateOptions, HeaderReader } from "./gate.js";

export { verifyZkRuneProof, decodeProofHeader } from "./verify.js";
export type { VerifyOptions } from "./verify.js";

export {
  TEMPLATE_IDS,
  BASE_VERIFIER_ADDRESS,
  DEFAULT_BASE_RPC,
  isKnownCircuit,
} from "./chains.js";
export type { CircuitName } from "./chains.js";

export { zkRuneExpressMiddleware } from "./adapters/express.js";
export { zkRuneHonoMiddleware } from "./adapters/hono.js";
export { zkRuneFetchGuard } from "./adapters/fetch.js";

export type {
  Groth16Proof,
  ZkRuneProofEnvelope,
  VerifyResult,
  RejectReason,
  GateResponse,
} from "./types.js";

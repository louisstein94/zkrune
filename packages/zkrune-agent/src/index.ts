// zkAgent Passport — open ZK selective-disclosure validation layer for AI agents.
// Light mode (v1): delegated authority + human-in-the-loop + freshness, bound to
// each action. Zero new trusted setup — reuses the `signature-verification` circuit.
//
// See business/pitch/zkagent-passport-plan.md for the full design.

export { AgentPassport } from './passport';
export type { MintOptions, AttestOptions } from './passport';

export { verifyAttestation } from './verify';

export {
  evaluateAgentPassportGate,
  HEADER_PASSPORT,
  HEADER_ACTION,
} from './gate';
export type { AgentGateOptions, GateResponse, HeaderReader } from './gate';

export { agentPassportExpressMiddleware } from './adapters/express';
export { agentPassportHonoMiddleware } from './adapters/hono';
export { agentPassportFetchGuard } from './adapters/fetch';

export { createSdkBackend, localGroth16Backend } from './backend';
export type { ZkRuneLike } from './backend';

export { privateKeySigner } from './crypto';
export {
  // lower-level helpers, exported for adapters/tests
  computeBoundMessage,
  policyCommitment,
  delegationMessage,
  verifySignature,
  signMessage,
  publicKeyFromPrivate,
  canonicalize,
} from './crypto';

export { encodeEnvelope, decodeEnvelope, readHeader } from './encoding';

export type {
  Policy,
  PassportEnvelope,
  ActionDescriptor,
  ActionAttestation,
  PassportHeaders,
  EdDSAPublicKey,
  EdDSASignature,
  Groth16Proof,
  SignatureCircuitInputs,
  ProofBackend,
  AgentSigner,
  VerifyResult,
  VerifyOptions,
} from './types';

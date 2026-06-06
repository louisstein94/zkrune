// Public types for the zkAgent Passport (light mode, v1).
//
// Two layers (see business/pitch/zkagent-passport-plan.md §1):
//   - Passport (grant): long-lived. A human delegates a policy to an agent key.
//   - Action Attestation: short-lived. A fresh, action-bound ZK proof carried on
//     every request. Replay dies because the proof is bound to a specific action.

/** A BabyJubJub / EdDSA-Poseidon public key as decimal field-element strings. */
export type EdDSAPublicKey = [Ax: string, Ay: string];

/** An EdDSA-Poseidon signature as decimal field-element strings. */
export interface EdDSASignature {
  R8: [R8x: string, R8y: string];
  S: string;
}

/** The Groth16 proof shape (matches zkrune-sdk's Groth16Proof). */
export interface Groth16Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: string;
  curve: string;
}

/**
 * The policy a human grants to an agent. `maxSpend` and `onlyDomains` are
 * carried and committed in v1, but only *enforced in-circuit* in v1.1 (the
 * composed `agent-action` circuit). In light mode (v1) they are advisory
 * metadata the relying party may still check off-circuit.
 */
export interface Policy {
  /** e.g. "500 USDC" — enforced in-circuit in v1.1. */
  maxSpend?: string;
  /** Allowed domains/patterns — enforced in-circuit in v1.1. */
  onlyDomains?: string[];
  /** If true, the per-action attestation must be signed by the human, not the agent. */
  humanInLoop: boolean;
}

/** The portable passport. Carried as the `X-zkRune-Passport` header (base64). */
export interface PassportEnvelope {
  v: 1;
  agentPubkey: EdDSAPublicKey;
  humanPubkey: EdDSAPublicKey;
  policy: Policy;
  /** Poseidon commitment over the policy + keys + expiry. */
  policyCommitment: string;
  /** Unix seconds after which the passport is invalid. */
  expiry: number;
  /** Human's EdDSA signature over (agentPubkey ‖ policyCommitment ‖ expiry). */
  delegation: EdDSASignature;
}

/** The concrete action an agent is about to take. Hashed into the bound message. */
export interface ActionDescriptor {
  method: string;
  target: string;
  params?: unknown;
  /** e.g. "120 USDC". */
  amount?: string;
  /**
   * An identifier the relying party already deduplicates (x402 payment-intent
   * id, MCP/A2A request id). Binding to it gives stateless replay protection.
   */
  externalId?: string;
}

/** The per-request attestation. Carried as the `X-zkRune-Action` header (base64). */
export interface ActionAttestation {
  v: 1;
  /** Light mode reuses the already-ceremonied `signature-verification` circuit. */
  circuit: 'signature-verification';
  action: ActionDescriptor;
  /** Unix seconds when the action was signed — the freshness anchor. */
  issuedAt: number;
  /** Who signed the bound message M. */
  signer: 'human' | 'agent';
  proof: Groth16Proof;
  /** Public signals in circuit order: [Ax, Ay, M]. */
  publicSignals: [Ax: string, Ay: string, M: string];
}

/** Header pair an agent attaches to a request. */
export interface PassportHeaders {
  'X-zkRune-Passport': string;
  'X-zkRune-Action': string;
}

/** Private inputs for the `signature-verification` circuit (decimal strings). */
export interface SignatureCircuitInputs {
  R8x: string;
  R8y: string;
  S: string;
  Ax: string;
  Ay: string;
  M: string;
}

/**
 * The proving/verifying backend. Injected so the package builds and unit-tests
 * without circuit artefacts. Wire it to zkrune-sdk via `createSdkBackend()`.
 */
export interface ProofBackend {
  prove(inputs: SignatureCircuitInputs): Promise<{ proof: Groth16Proof; publicSignals: string[] }>;
  verify(proof: Groth16Proof, publicSignals: string[]): Promise<boolean>;
}

/**
 * Signs the Poseidon-bound message M. Wallets implement this; `privateKeySigner`
 * builds one from a raw 32-byte key for dev/tests.
 */
export interface AgentSigner {
  publicKey(): Promise<EdDSAPublicKey>;
  sign(message: bigint): Promise<EdDSASignature>;
}

/** Result of verifying a passport + action attestation. */
export interface VerifyResult {
  ok: boolean;
  /** Human-readable reasons each check passed or failed. */
  checks: {
    passportNotExpired: boolean;
    delegationValid: boolean;
    signerMatchesPolicy: boolean;
    proofValid: boolean;
    messageBindingValid: boolean;
    fresh: boolean;
  };
  reasons: string[];
}

/** Options for `verifyAttestation`. */
export interface VerifyOptions {
  /** Max age of the attestation in seconds. Default 300 (5 min). */
  ttlSeconds?: number;
  /** Override the current time (unix seconds) — for deterministic tests. */
  now?: number;
}

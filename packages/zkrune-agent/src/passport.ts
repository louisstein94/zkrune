// AgentPassport — mint a delegated-authority passport, then attest each action
// with a fresh, action-bound ZK proof. Light mode (v1): the per-action proof is
// the existing `signature-verification` circuit over the bound message M.

import {
  canonicalize,
  computeBoundMessage,
  delegationMessage,
  policyCommitment,
} from './crypto';
import { encodeEnvelope } from './encoding';
import type {
  ActionAttestation,
  ActionDescriptor,
  AgentSigner,
  PassportEnvelope,
  PassportHeaders,
  Policy,
  ProofBackend,
  SignatureCircuitInputs,
} from './types';

const DEFAULT_PASSPORT_TTL_SECONDS = 24 * 60 * 60;

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export interface MintOptions {
  /** Signs the delegation and, for humanInLoop policies, per-action approvals. */
  humanSigner: AgentSigner;
  /** The agent's own key. Signs per-action proofs when humanInLoop is false. */
  agentSigner: AgentSigner;
  policy: Policy;
  backend: ProofBackend;
  /** Unix seconds. Default: now + 24h. */
  expiry?: number;
  /** Override current time (unix seconds) for deterministic tests. */
  now?: number;
}

export interface AttestOptions {
  action: ActionDescriptor;
  issuedAt?: number;
  approver?: AgentSigner;
}

export class AgentPassport {
  private constructor(
    public readonly envelope: PassportEnvelope,
    private readonly agentSigner: AgentSigner,
    private readonly humanSigner: AgentSigner,
    private readonly backend: ProofBackend,
  ) {}

  /** Mint a passport: the human signs a delegation over the agent key + policy + expiry. */
  static async mint(opts: MintOptions): Promise<AgentPassport> {
    const agentPubkey = await opts.agentSigner.publicKey();
    const humanPubkey = await opts.humanSigner.publicKey();
    const expiry = opts.expiry ?? (opts.now ?? nowSeconds()) + DEFAULT_PASSPORT_TTL_SECONDS;

    const commitment = await policyCommitment(agentPubkey, humanPubkey, opts.policy, expiry);
    const delegation = await opts.humanSigner.sign(
      await delegationMessage(agentPubkey, commitment, expiry),
    );

    const envelope: PassportEnvelope = {
      v: 1,
      agentPubkey,
      humanPubkey,
      policy: opts.policy,
      policyCommitment: commitment.toString(),
      expiry,
      delegation,
    };

    return new AgentPassport(envelope, opts.agentSigner, opts.humanSigner, opts.backend);
  }

  /** Produce the headers for a single action: a fresh, action-bound attestation. */
  async attest(opts: AttestOptions): Promise<PassportHeaders> {
    const issuedAt = opts.issuedAt ?? nowSeconds();
    const humanInLoop = this.envelope.policy.humanInLoop;
    const signer = humanInLoop ? opts.approver ?? this.humanSigner : this.agentSigner;
    const signerPubkey = await signer.publicKey();

    const M = await computeBoundMessage(canonicalize(opts.action), issuedAt, signerPubkey);
    const signature = await signer.sign(M);

    const inputs: SignatureCircuitInputs = {
      R8x: signature.R8[0],
      R8y: signature.R8[1],
      S: signature.S,
      Ax: signerPubkey[0],
      Ay: signerPubkey[1],
      M: M.toString(),
    };

    const { proof, publicSignals } = await this.backend.prove(inputs);

    const attestation: ActionAttestation = {
      v: 1,
      circuit: 'signature-verification',
      action: opts.action,
      issuedAt,
      signer: humanInLoop ? 'human' : 'agent',
      proof,
      publicSignals: [publicSignals[0], publicSignals[1], publicSignals[2]],
    };

    return {
      'X-zkRune-Passport': encodeEnvelope(this.envelope),
      'X-zkRune-Action': encodeEnvelope(attestation),
    };
  }
}

// Endpoint-level eligibility gate for AI-agent requests, mirroring the
// @zkrune/x402-verify gate shape so it slots into the same x402 retry loop.
//
// x402 answers "who paid?". The passport answers "which agent, under whose
// authority, within which limits, with a human in the loop?". The gate reads
// the X-zkRune-Passport + X-zkRune-Action headers, verifies the attestation
// statelessly, then applies the endpoint's policy. Returns `null` to allow the
// request or a framework-agnostic GateResponse to reject it. Never throws.
//
// Light-mode constraint note: maxSpend / onlyDomains are enforced here by
// comparing the action against the *delegated* policy. This is sound — both the
// policy (via the human's delegation signature) and the concrete action (via the
// bound message M) are signature-verified, so the comparison is over established
// values, not client claims. The v1.1 circuit only adds ZK-hiding of the amount,
// which is moot for a relying party that already sees the action it serves.

import { verifyAttestation } from './verify';
import { decodeEnvelope } from './encoding';
import type { ActionAttestation, PassportEnvelope, ProofBackend } from './types';

export const HEADER_PASSPORT = 'X-zkRune-Passport';
export const HEADER_ACTION = 'X-zkRune-Action';

/** A reader for a single header value. Case-insensitive lookups expected. */
export type HeaderReader = (name: string) => string | null | undefined;

/** A ready-to-send rejection, framework-agnostic. */
export interface GateResponse {
  status: number;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export interface AgentGateOptions {
  /** Verifies the Groth16 proof — e.g. localGroth16Backend(vkey) or createSdkBackend(zk). */
  backend: ProofBackend;
  /** Max attestation age in seconds. Default 300 (5 min). */
  ttlSeconds?: number;
  /** Require the delegated policy to mandate human-in-the-loop. */
  requireHumanInLoop?: boolean;
  /**
   * Require the action target's host to match one of the passport's delegated
   * `onlyDomains`. Sound in light mode (see file header).
   */
  enforceDomain?: boolean;
  /** Where clients mint a passport / attest an action. Shown in the 403 challenge. */
  mintPassportUrl?: string;
  /** Extra policy check over the verified envelope + action. Return false to reject. */
  validate?: (envelope: PassportEnvelope, attestation: ActionAttestation) => boolean;
}

function challenge(
  options: AgentGateOptions,
  reason: string,
  message: string,
  status = 403,
): GateResponse {
  return {
    status,
    headers: { 'Content-Type': 'application/json', 'X-zkRune-Required': 'agent-passport' },
    body: {
      error: 'zkrune_agent_passport_required',
      reason,
      headers: [HEADER_PASSPORT, HEADER_ACTION],
      mintPassportAt: options.mintPassportUrl ?? 'https://zkrune.com/proof-of-agent',
      message,
    },
  };
}

/** "*.example.com" matches "api.example.com" and "example.com"; exact otherwise. */
function domainMatches(pattern: string, host: string): boolean {
  if (pattern.startsWith('*.')) {
    const base = pattern.slice(2);
    return host === base || host.endsWith(`.${base}`);
  }
  return host === pattern;
}

/**
 * Evaluate the gate. Returns `null` to allow, or a GateResponse to reject.
 * A verifier/RPC failure surfaces as a 503 so the client retries rather than
 * regenerating; a genuine rejection is a 403 challenge.
 */
export async function evaluateAgentPassportGate(
  getHeader: HeaderReader,
  options: AgentGateOptions,
): Promise<GateResponse | null> {
  const passport = getHeader(HEADER_PASSPORT);
  const action = getHeader(HEADER_ACTION);

  if (!passport || !action) {
    return challenge(
      options,
      'missing_headers',
      `This endpoint requires a zkRune agent passport. Mint one, attest the action, ` +
        `then retry with the ${HEADER_PASSPORT} and ${HEADER_ACTION} headers.`,
    );
  }

  const result = await verifyAttestation(
    { [HEADER_PASSPORT]: passport, [HEADER_ACTION]: action },
    options.backend,
    { ttlSeconds: options.ttlSeconds },
  );

  if (!result.ok) {
    // A backend that threw (verifier/RPC unreachable) → 503, fail-closed-retry.
    const verifierDown = result.reasons.some((r) => r.includes('proof verification threw'));
    if (verifierDown) {
      return {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '5' },
        body: {
          error: 'zkrune_verifier_unavailable',
          message: 'Could not verify the proof. Retry shortly.',
        },
      };
    }
    return challenge(options, 'attestation_rejected', result.reasons.join('; '));
  }

  // The attestation is valid — apply endpoint policy over verified, bound values.
  let envelope: PassportEnvelope;
  let attestation: ActionAttestation;
  try {
    envelope = decodeEnvelope<PassportEnvelope>(passport);
    attestation = decodeEnvelope<ActionAttestation>(action);
  } catch {
    return challenge(options, 'malformed_envelope', 'Could not decode the passport envelopes.');
  }

  if (options.requireHumanInLoop && !envelope.policy.humanInLoop) {
    return challenge(
      options,
      'human_in_loop_required',
      'This endpoint requires a human-in-the-loop policy, but the passport does not mandate it.',
    );
  }

  if (options.enforceDomain) {
    let host: string;
    try {
      host = new URL(attestation.action.target).host;
    } catch {
      return challenge(options, 'invalid_target', 'The action target is not a valid URL.');
    }
    const patterns = envelope.policy.onlyDomains ?? [];
    if (!patterns.some((p) => domainMatches(p, host))) {
      return challenge(
        options,
        'domain_not_permitted',
        `The action targets "${host}", which is outside the delegated onlyDomains policy.`,
      );
    }
  }

  if (options.validate && !options.validate(envelope, attestation)) {
    return challenge(
      options,
      'policy_rejected',
      "The attestation is valid but does not satisfy this endpoint's policy.",
    );
  }

  return null;
}

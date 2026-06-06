// Stateless verification of a passport + action attestation. No database, no
// shared state — a relying party can run this anywhere (this is the "no DB
// needed" differentiator). Closes replay via action-binding + freshness window.

import {
  canonicalize,
  computeBoundMessage,
  delegationMessage,
  policyCommitment,
  verifySignature,
} from './crypto';
import { decodeEnvelope, readHeader } from './encoding';
import type {
  ActionAttestation,
  EdDSAPublicKey,
  PassportEnvelope,
  ProofBackend,
  VerifyOptions,
  VerifyResult,
} from './types';

const DEFAULT_TTL_SECONDS = 300;
/** Tolerance for clock skew on the "not from the future" check. */
const CLOCK_SKEW_SECONDS = 60;

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function keysEqual(a: EdDSAPublicKey, b: EdDSAPublicKey): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export async function verifyAttestation(
  headers: Record<string, string | undefined> | Headers,
  backend: ProofBackend,
  opts: VerifyOptions = {},
): Promise<VerifyResult> {
  const reasons: string[] = [];
  const checks = {
    passportNotExpired: false,
    delegationValid: false,
    signerMatchesPolicy: false,
    proofValid: false,
    messageBindingValid: false,
    fresh: false,
  };

  const passportB64 = readHeader(headers, 'X-zkRune-Passport');
  const actionB64 = readHeader(headers, 'X-zkRune-Action');
  if (!passportB64 || !actionB64) {
    reasons.push('missing X-zkRune-Passport or X-zkRune-Action header');
    return { ok: false, checks, reasons };
  }

  let envelope: PassportEnvelope;
  let attestation: ActionAttestation;
  try {
    envelope = decodeEnvelope<PassportEnvelope>(passportB64);
    attestation = decodeEnvelope<ActionAttestation>(actionB64);
  } catch {
    reasons.push('malformed envelope (base64/JSON decode failed)');
    return { ok: false, checks, reasons };
  }

  const now = opts.now ?? nowSeconds();
  const ttl = opts.ttlSeconds ?? DEFAULT_TTL_SECONDS;

  // 1) Passport not expired.
  checks.passportNotExpired = envelope.expiry > now;
  if (!checks.passportNotExpired) reasons.push('passport expired');

  // 2) Delegation: the policy commitment is well-formed and the human signed it.
  try {
    const recomputed = await policyCommitment(
      envelope.agentPubkey,
      envelope.humanPubkey,
      envelope.policy,
      envelope.expiry,
    );
    const commitmentMatches = recomputed.toString() === envelope.policyCommitment;
    const delegationSigValid = await verifySignature(
      envelope.humanPubkey,
      await delegationMessage(envelope.agentPubkey, recomputed, envelope.expiry),
      envelope.delegation,
    );
    checks.delegationValid = commitmentMatches && delegationSigValid;
    if (!commitmentMatches) reasons.push('policy commitment does not match policy');
    if (!delegationSigValid) reasons.push('delegation signature invalid');
  } catch {
    reasons.push('delegation verification threw');
  }

  // 3) The per-action signer matches what the policy requires.
  const publicKey: EdDSAPublicKey = [attestation.publicSignals[0], attestation.publicSignals[1]];
  const expectedSigner = envelope.policy.humanInLoop ? 'human' : 'agent';
  const expectedKey = envelope.policy.humanInLoop ? envelope.humanPubkey : envelope.agentPubkey;
  checks.signerMatchesPolicy =
    attestation.signer === expectedSigner && keysEqual(publicKey, expectedKey);
  if (!checks.signerMatchesPolicy) {
    reasons.push(
      `action must be signed by the ${expectedSigner} key (humanInLoop=${envelope.policy.humanInLoop})`,
    );
  }

  // 4) The Groth16 proof itself is valid (signature over M by the claimed key).
  try {
    checks.proofValid = await backend.verify(attestation.proof, attestation.publicSignals);
    if (!checks.proofValid) reasons.push('groth16 proof invalid');
  } catch {
    reasons.push('proof verification threw');
  }

  // 5) Message binding: M must reconstruct from THIS action + timestamp + signer.
  try {
    const expectedM = await computeBoundMessage(
      canonicalize(attestation.action),
      attestation.issuedAt,
      publicKey,
    );
    checks.messageBindingValid = expectedM.toString() === attestation.publicSignals[2];
    if (!checks.messageBindingValid) {
      reasons.push('bound message M does not match action/timestamp (possible replay or tamper)');
    }
  } catch {
    reasons.push('message binding check threw');
  }

  // 6) Freshness: within TTL and not from the future.
  const age = now - attestation.issuedAt;
  checks.fresh = age <= ttl && age >= -CLOCK_SKEW_SECONDS;
  if (!checks.fresh) reasons.push(`attestation not fresh (age ${age}s, ttl ${ttl}s)`);

  const ok = Object.values(checks).every(Boolean);
  return { ok, checks, reasons };
}

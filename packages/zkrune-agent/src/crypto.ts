// EdDSA-Poseidon signing + Poseidon binding, using circomlibjs so the off-circuit
// hashing matches the in-circuit Poseidon exactly (circomlib standard).
//
// The bound message is M = Poseidon(actionDigest, issuedAt, agentId), where
// agentId = Poseidon(Ax, Ay). The `signature-verification` circuit exposes M as
// a public signal, so binding the action + freshness into M is free — no circuit
// change, no new ceremony (see plan §3a).

import { buildEddsa, buildPoseidon, type Eddsa, type Poseidon } from 'circomlibjs';
import type { AgentSigner, EdDSAPublicKey, EdDSASignature, Policy } from './types';

let _eddsa: Eddsa | undefined;
let _poseidon: Poseidon | undefined;

async function getEddsa(): Promise<Eddsa> {
  if (!_eddsa) _eddsa = await buildEddsa();
  return _eddsa;
}

async function getPoseidon(): Promise<Poseidon> {
  if (!_poseidon) _poseidon = await buildPoseidon();
  return _poseidon;
}

/** The scalar field modulus (BN254), used to reduce digests into the field. */
export async function fieldModulus(): Promise<bigint> {
  return (await getPoseidon()).F.p;
}

/** Poseidon hash of field-element bigints → canonical bigint. */
export async function poseidon(inputs: bigint[]): Promise<bigint> {
  const p = await getPoseidon();
  return p.F.toObject(p(inputs));
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let acc = 0n;
  for (const b of bytes) acc = (acc << 8n) | BigInt(b);
  return acc;
}

/** SHA-256 of a string → big-endian bigint reduced into the field. Portable. */
export async function digestToField(input: string): Promise<bigint> {
  const data = new TextEncoder().encode(input);
  // Cast keeps stricter DOM typings happy: TextEncoder.encode now returns
  // Uint8Array<ArrayBufferLike>, while subtle.digest wants BufferSource over
  // ArrayBuffer specifically. Runtime is unchanged.
  const hash = await globalThis.crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return bytesToBigInt(new Uint8Array(hash)) % (await fieldModulus());
}

/** Deterministic, stable serialization so prover and verifier agree on the digest. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((value as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return value;
}

/** agentId = Poseidon(Ax, Ay) — a single-field handle for a key. */
export async function agentId(pubkey: EdDSAPublicKey): Promise<bigint> {
  return poseidon([BigInt(pubkey[0]), BigInt(pubkey[1])]);
}

/** Poseidon commitment binding both keys, the policy, and expiry. */
export async function policyCommitment(
  agentPubkey: EdDSAPublicKey,
  humanPubkey: EdDSAPublicKey,
  policy: Policy,
  expiry: number,
): Promise<bigint> {
  const policyDigest = await digestToField(canonicalize(policy));
  return poseidon([
    await agentId(agentPubkey),
    await agentId(humanPubkey),
    policyDigest,
    BigInt(expiry),
  ]);
}

/** The message a human signs to delegate authority to an agent key. */
export async function delegationMessage(
  agentPubkey: EdDSAPublicKey,
  commitment: bigint,
  expiry: number,
): Promise<bigint> {
  return poseidon([await agentId(agentPubkey), commitment, BigInt(expiry)]);
}

/**
 * The bound message M for a single action. Recomputed identically by prover and
 * verifier; tampering with the action or timestamp breaks the public-signal match.
 */
export async function computeBoundMessage(
  actionCanonical: string,
  issuedAt: number,
  signerPubkey: EdDSAPublicKey,
): Promise<bigint> {
  const actionDigest = await digestToField(actionCanonical);
  return poseidon([actionDigest, BigInt(issuedAt), await agentId(signerPubkey)]);
}

/** Derive an EdDSA-Poseidon public key from a 32-byte private key. */
export async function publicKeyFromPrivate(privateKey: Uint8Array): Promise<EdDSAPublicKey> {
  const eddsa = await getEddsa();
  const pub = eddsa.prv2pub(privateKey);
  return [eddsa.F.toObject(pub[0]).toString(), eddsa.F.toObject(pub[1]).toString()];
}

/** Sign a field-element message with a raw private key. */
export async function signMessage(
  privateKey: Uint8Array,
  message: bigint,
): Promise<EdDSASignature> {
  const eddsa = await getEddsa();
  const sig = eddsa.signPoseidon(privateKey, eddsa.F.e(message));
  return {
    R8: [eddsa.F.toObject(sig.R8[0]).toString(), eddsa.F.toObject(sig.R8[1]).toString()],
    S: sig.S.toString(),
  };
}

/** Verify an EdDSA-Poseidon signature over a field-element message. */
export async function verifySignature(
  pubkey: EdDSAPublicKey,
  message: bigint,
  signature: EdDSASignature,
): Promise<boolean> {
  const eddsa = await getEddsa();
  const F = eddsa.F;
  return eddsa.verifyPoseidon(
    F.e(message),
    { R8: [F.e(BigInt(signature.R8[0])), F.e(BigInt(signature.R8[1]))], S: BigInt(signature.S) },
    [F.e(BigInt(pubkey[0])), F.e(BigInt(pubkey[1]))],
  );
}

/** Build an AgentSigner from a raw 32-byte key (dev/tests; wallets implement AgentSigner directly). */
export function privateKeySigner(privateKey: Uint8Array): AgentSigner {
  return {
    publicKey: () => publicKeyFromPrivate(privateKey),
    sign: (message: bigint) => signMessage(privateKey, message),
  };
}

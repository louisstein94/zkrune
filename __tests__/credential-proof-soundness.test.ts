import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

// Regression tests for the credential-proof soundness fix.
//
// The circuit used to hash credentialSecret with Poseidon and then never
// constrain the result, while credentialHash was a free private input
// compared against the public expectedHash. Both the secret and the expiry
// were therefore unconstrained, and a valid proof could be produced for any
// issuer-published hash while holding no credential at all.
//
// The commitment constraint (Poseidon(secret, validUntil) === expectedHash)
// is what binds a proof to a real issuance. These tests fail if it is
// removed or weakened.

async function getSnarkjs() {
  return (await import('snarkjs')) as any;
}

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits');
const wasmPath = path.join(CIRCUITS_DIR, 'credential-proof', 'circuit_js', 'circuit.wasm');
const zkeyPath = path.join(CIRCUITS_DIR, 'credential-proof', 'circuit_test.zkey');
const vkeyPath = path.join(CIRCUITS_DIR, 'credential-proof', 'test_vkey.json');

// A credential the issuer actually handed out.
const SECRET = '874512369874125369874125';
const VALID_UNTIL = '4102444800'; // 2100-01-01
const NOW = String(Math.floor(Date.parse('2026-08-19T00:00:00Z') / 1000));

let issuedCommitment: string;

beforeAll(async () => {
  const { buildPoseidon } = await import('circomlibjs');
  const poseidon = await buildPoseidon();
  issuedCommitment = poseidon.F.toObject(
    poseidon([BigInt(SECRET), BigInt(VALID_UNTIL)]),
  ).toString();
});

async function prove(input: Record<string, string>) {
  const snarkjs = await getSnarkjs();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
  const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
  const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  return { valid, publicSignals };
}

describe('credential-proof soundness', () => {
  it('VALID: the holder of an issued credential can prove eligibility', async () => {
    const { valid, publicSignals } = await prove({
      credentialSecret: SECRET,
      validUntil: VALID_UNTIL,
      currentTime: NOW,
      expectedHash: issuedCommitment,
    });

    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('REJECTS: a forged secret against a published commitment', async () => {
    await expect(
      prove({
        credentialSecret: '1',
        validUntil: '99999999999',
        currentTime: NOW,
        expectedHash: issuedCommitment,
      }),
    ).rejects.toThrow();
  }, 30000);

  it('REJECTS: the real secret with an inflated expiry', async () => {
    // validUntil feeds the commitment, so extending it breaks the equality.
    await expect(
      prove({
        credentialSecret: SECRET,
        validUntil: '99999999999',
        currentTime: NOW,
        expectedHash: issuedCommitment,
      }),
    ).rejects.toThrow();
  }, 30000);

  it('REJECTS: a wrong secret with the correct expiry', async () => {
    await expect(
      prove({
        credentialSecret: '999',
        validUntil: VALID_UNTIL,
        currentTime: NOW,
        expectedHash: issuedCommitment,
      }),
    ).rejects.toThrow();
  }, 30000);

  it('REJECTS: a correctly issued but expired credential', async () => {
    const { buildPoseidon } = await import('circomlibjs');
    const poseidon = await buildPoseidon();
    const expired = '1000000000'; // 2001
    const commitment = poseidon.F.toObject(
      poseidon([BigInt(SECRET), BigInt(expired)]),
    ).toString();

    await expect(
      prove({
        credentialSecret: SECRET,
        validUntil: expired,
        currentTime: NOW,
        expectedHash: commitment,
      }),
    ).rejects.toThrow();
  }, 30000);
});

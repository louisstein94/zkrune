// Integration test: drives a REAL Groth16 proof through the actual
// signature-verification circuit artefacts in public/circuits/. This confirms
// the light-mode binding works end-to-end and pins the publicSignals order to
// [Ax, Ay, M] (the assumption the verifier relies on).
//
// Skips automatically if the artefacts are not present.

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as snarkjs from 'snarkjs';

import { AgentPassport } from '../src/passport';
import { verifyAttestation } from '../src/verify';
import { privateKeySigner, signMessage, publicKeyFromPrivate } from '../src/crypto';
import { decodeEnvelope, encodeEnvelope } from '../src/encoding';
import type { ActionAttestation, Groth16Proof, ProofBackend } from '../src/types';

const here = dirname(fileURLToPath(import.meta.url));
const circuitsDir = resolve(here, '../../../public/circuits');
const WASM = resolve(circuitsDir, 'signature-verification.wasm');
const ZKEY = resolve(circuitsDir, 'signature-verification.zkey');
const VKEY = resolve(circuitsDir, 'signature-verification_vkey.json');

const haveArtefacts = existsSync(WASM) && existsSync(ZKEY) && existsSync(VKEY);
const vkey = haveArtefacts ? JSON.parse(readFileSync(VKEY, 'utf8')) : null;

// Real backend: generate and verify Groth16 proofs with snarkjs.
const realBackend: ProofBackend = {
  async prove(inputs) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      { R8x: inputs.R8x, R8y: inputs.R8y, S: inputs.S, Ax: inputs.Ax, Ay: inputs.Ay, M: inputs.M },
      WASM,
      ZKEY,
    );
    return { proof: proof as unknown as Groth16Proof, publicSignals };
  },
  async verify(proof, publicSignals) {
    return snarkjs.groth16.verify(vkey, publicSignals, proof as unknown as object);
  },
};

const run = haveArtefacts ? describe : describe.skip;

run('signature-verification — real Groth16', () => {
  it('publicSignals order is [Ax, Ay, M] and the proof verifies', async () => {
    const priv = new Uint8Array(32).fill(3);
    const pub = await publicKeyFromPrivate(priv);
    const M = 1234567890n;
    const sig = await signMessage(priv, M);

    const { proof, publicSignals } = await realBackend.prove({
      R8x: sig.R8[0], R8y: sig.R8[1], S: sig.S,
      Ax: pub[0], Ay: pub[1], M: M.toString(),
    });

    // CONFIRMED ORDER: [Ax, Ay, M]
    expect(publicSignals).toEqual([pub[0], pub[1], M.toString()]);
    expect(await realBackend.verify(proof, publicSignals)).toBe(true);
  }, 60_000);

  it('full mint → attest → verify with a real proof', async () => {
    const human = privateKeySigner(new Uint8Array(32).fill(7));
    const agent = privateKeySigner(new Uint8Array(32).fill(9));

    const passport = await AgentPassport.mint({
      humanSigner: human,
      agentSigner: agent,
      policy: { maxSpend: '500 USDC', onlyDomains: ['*.example.com'], humanInLoop: false },
      backend: realBackend,
      now: 1_000_000,
    });

    const headers = await passport.attest({
      action: { method: 'POST', target: 'https://api.example.com/pay', amount: '120 USDC' },
      issuedAt: 1_000_010,
    });

    const result = await verifyAttestation(headers, realBackend, { now: 1_000_020 });
    expect(result.reasons).toEqual([]);
    expect(result.ok).toBe(true);
  }, 60_000);

  it('a real proof cannot be replayed onto a different action', async () => {
    const human = privateKeySigner(new Uint8Array(32).fill(7));
    const agent = privateKeySigner(new Uint8Array(32).fill(9));

    const passport = await AgentPassport.mint({
      humanSigner: human,
      agentSigner: agent,
      policy: { humanInLoop: false },
      backend: realBackend,
      now: 1_000_000,
    });

    const headers = await passport.attest({
      action: { method: 'POST', target: 'https://api.example.com/pay', amount: '120 USDC' },
      issuedAt: 1_000_010,
    });

    // Swap in a different action; the real proof's public M no longer matches.
    const tampered = decodeEnvelope<ActionAttestation>(headers['X-zkRune-Action']);
    tampered.action = { ...tampered.action, target: 'https://evil.example.com/drain' };
    headers['X-zkRune-Action'] = encodeEnvelope(tampered);

    const result = await verifyAttestation(headers, realBackend, { now: 1_000_020 });
    expect(result.ok).toBe(false);
    expect(result.checks.proofValid).toBe(true); // the proof itself is still valid…
    expect(result.checks.messageBindingValid).toBe(false); // …but it's bound to the original action
  }, 60_000);
});

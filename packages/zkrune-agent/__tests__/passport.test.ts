import { describe, expect, it } from 'vitest';
import { AgentPassport } from '../src/passport';
import { verifyAttestation } from '../src/verify';
import { privateKeySigner, verifySignature } from '../src/crypto';
import { decodeEnvelope, encodeEnvelope } from '../src/encoding';
import type { ActionAttestation, ProofBackend } from '../src/types';

// Test-only backend: instead of a Groth16 proof it verifies the EdDSA signature
// directly (carried inside the proof object). This validates the package's
// orchestration, binding, freshness and delegation logic without circuit
// artefacts — the real backend proves the same statement in zero knowledge.
const stubBackend: ProofBackend = {
  async prove(inputs) {
    return {
      proof: {
        pi_a: ['0', '0', '0'],
        pi_b: [['0', '0'], ['0', '0'], ['0', '0']],
        pi_c: ['0', '0', '0'],
        protocol: 'groth16',
        curve: 'bn128',
        // test-only carrier for the private signature
        _sig: { R8: [inputs.R8x, inputs.R8y] as [string, string], S: inputs.S },
      } as any,
      publicSignals: [inputs.Ax, inputs.Ay, inputs.M],
    };
  },
  async verify(proof: any, publicSignals) {
    const sig = proof?._sig;
    if (!sig) return false;
    return verifySignature(
      [publicSignals[0], publicSignals[1]],
      BigInt(publicSignals[2]),
      { R8: sig.R8, S: sig.S },
    );
  },
};

const humanKey = new Uint8Array(32).fill(7);
const agentKey = new Uint8Array(32).fill(9);
const human = privateKeySigner(humanKey);
const agent = privateKeySigner(agentKey);

const action = { method: 'POST', target: 'https://api.example.com/pay', amount: '120 USDC' };

describe('AgentPassport (light mode)', () => {
  it('mint → attest → verify happy path (agent-signed)', async () => {
    const passport = await AgentPassport.mint({
      humanSigner: human,
      agentSigner: agent,
      policy: { maxSpend: '500 USDC', onlyDomains: ['*.example.com'], humanInLoop: false },
      backend: stubBackend,
      now: 1_000_000,
    });

    const headers = await passport.attest({ action, issuedAt: 1_000_010 });
    const result = await verifyAttestation(headers, stubBackend, { now: 1_000_020 });

    expect(result.ok).toBe(true);
    expect(Object.values(result.checks).every(Boolean)).toBe(true);
  });

  it('human-in-the-loop: attestation must be human-signed', async () => {
    const passport = await AgentPassport.mint({
      humanSigner: human,
      agentSigner: agent,
      policy: { humanInLoop: true },
      backend: stubBackend,
      now: 1_000_000,
    });

    const headers = await passport.attest({ action, issuedAt: 1_000_010 });
    const decoded = decodeEnvelope<ActionAttestation>(headers['X-zkRune-Action']);
    expect(decoded.signer).toBe('human');

    const result = await verifyAttestation(headers, stubBackend, { now: 1_000_020 });
    expect(result.ok).toBe(true);
  });

  it('rejects a tampered action (binding/replay defense)', async () => {
    const passport = await AgentPassport.mint({
      humanSigner: human,
      agentSigner: agent,
      policy: { humanInLoop: false },
      backend: stubBackend,
      now: 1_000_000,
    });

    const headers = await passport.attest({ action, issuedAt: 1_000_010 });
    const tampered = decodeEnvelope<ActionAttestation>(headers['X-zkRune-Action']);
    tampered.action = { ...tampered.action, target: 'https://evil.example.com/drain' };
    headers['X-zkRune-Action'] = encodeEnvelope(tampered);

    const result = await verifyAttestation(headers, stubBackend, { now: 1_000_020 });
    expect(result.ok).toBe(false);
    expect(result.checks.messageBindingValid).toBe(false);
  });

  it('rejects a stale attestation (freshness window)', async () => {
    const passport = await AgentPassport.mint({
      humanSigner: human,
      agentSigner: agent,
      policy: { humanInLoop: false },
      backend: stubBackend,
      now: 1_000_000,
    });

    const headers = await passport.attest({ action, issuedAt: 1_000_010 });
    // verify 10 minutes later with a 5-minute TTL
    const result = await verifyAttestation(headers, stubBackend, { now: 1_000_010 + 600, ttlSeconds: 300 });

    expect(result.ok).toBe(false);
    expect(result.checks.fresh).toBe(false);
  });

  it('rejects a tampered policy (delegation defense)', async () => {
    const passport = await AgentPassport.mint({
      humanSigner: human,
      agentSigner: agent,
      policy: { maxSpend: '500 USDC', humanInLoop: false },
      backend: stubBackend,
      now: 1_000_000,
    });

    const headers = await passport.attest({ action, issuedAt: 1_000_010 });
    const env = decodeEnvelope<any>(headers['X-zkRune-Passport']);
    env.policy.maxSpend = '999999 USDC'; // raise the limit without re-signing
    headers['X-zkRune-Passport'] = encodeEnvelope(env);

    const result = await verifyAttestation(headers, stubBackend, { now: 1_000_020 });
    expect(result.ok).toBe(false);
    expect(result.checks.delegationValid).toBe(false);
  });
});

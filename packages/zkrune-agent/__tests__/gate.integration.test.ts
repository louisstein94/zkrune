// Integration test for the x402-style passport gate, end-to-end with a REAL
// Groth16 proof and the fetch adapter. Skips if circuit artefacts are absent.

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as snarkjs from 'snarkjs';

import { AgentPassport } from '../src/passport';
import { privateKeySigner } from '../src/crypto';
import { localGroth16Backend } from '../src/backend';
import { agentPassportFetchGuard } from '../src/adapters/fetch';
import type { Groth16Proof, ProofBackend } from '../src/types';

const here = dirname(fileURLToPath(import.meta.url));
const circuitsDir = resolve(here, '../../../public/circuits');
const WASM = resolve(circuitsDir, 'signature-verification.wasm');
const ZKEY = resolve(circuitsDir, 'signature-verification.zkey');
const VKEY = resolve(circuitsDir, 'signature-verification_vkey.json');

const haveArtefacts = existsSync(WASM) && existsSync(ZKEY) && existsSync(VKEY);
const vkey = haveArtefacts ? JSON.parse(readFileSync(VKEY, 'utf8')) : null;

const provingBackend: ProofBackend = {
  async prove(inputs) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      { R8x: inputs.R8x, R8y: inputs.R8y, S: inputs.S, Ax: inputs.Ax, Ay: inputs.Ay, M: inputs.M },
      WASM,
      ZKEY,
    );
    return { proof: proof as unknown as Groth16Proof, publicSignals };
  },
  async verify() {
    return true;
  },
};

function req(headers: Record<string, string>): Request {
  return new Request('https://rp.example.com/agent/pay', { method: 'POST', headers });
}

const run = haveArtefacts ? describe : describe.skip;

run('agent passport gate (x402-style)', () => {
  async function mintAndAttest(target: string, humanInLoop = false) {
    const passport = await AgentPassport.mint({
      humanSigner: privateKeySigner(new Uint8Array(32).fill(7)),
      agentSigner: privateKeySigner(new Uint8Array(32).fill(9)),
      policy: { maxSpend: '500 USDC', onlyDomains: ['*.example.com'], humanInLoop },
      backend: provingBackend,
    });
    return passport.attest({ action: { method: 'POST', target, amount: '120 USDC' } });
  }

  it('allows an in-policy request (returns null)', async () => {
    const h = await mintAndAttest('https://api.example.com/pay');
    const guard = agentPassportFetchGuard({ backend: localGroth16Backend(vkey), enforceDomain: true });
    const blocked = await guard(req(h));
    expect(blocked).toBeNull();
  }, 60_000);

  it('rejects an out-of-policy domain with a 403 challenge', async () => {
    const h = await mintAndAttest('https://attacker.io/drain');
    const guard = agentPassportFetchGuard({ backend: localGroth16Backend(vkey), enforceDomain: true });
    const blocked = await guard(req(h));
    expect(blocked?.status).toBe(403);
    const body = await blocked!.json();
    expect(body.reason).toBe('domain_not_permitted');
  }, 60_000);

  it('challenges when headers are missing', async () => {
    const guard = agentPassportFetchGuard({ backend: localGroth16Backend(vkey) });
    const blocked = await guard(req({}));
    expect(blocked?.status).toBe(403);
    const body = await blocked!.json();
    expect(body.reason).toBe('missing_headers');
    expect(body.headers).toEqual(['X-zkRune-Passport', 'X-zkRune-Action']);
  });

  it('enforces requireHumanInLoop against the delegated policy', async () => {
    const h = await mintAndAttest('https://api.example.com/pay', false);
    const guard = agentPassportFetchGuard({ backend: localGroth16Backend(vkey), requireHumanInLoop: true });
    const blocked = await guard(req(h));
    expect(blocked?.status).toBe(403);
    const body = await blocked!.json();
    expect(body.reason).toBe('human_in_loop_required');
  }, 60_000);
});

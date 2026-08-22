import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

// lockup-proof covers transfer restrictions rather than identity: a transfer
// agent records a position, and the holder later proves the restricted period
// has elapsed and the position still meets a venue's minimum — without
// revealing the size of the position or whose it is.
//
// Both the amount and the unlock date are hashed into the leaf, so the attacks
// worth testing are a holder inflating their own position or bringing their
// own unlock date forward.

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits');
const CIRCUIT = 'lockup-proof';
const DEPTH = 20;

let poseidon: any, F: any;
const p2 = (a: bigint, b: bigint) => F.toObject(poseidon([a, b]));
const p3 = (a: bigint, b: bigint, c: bigint) => F.toObject(poseidon([a, b, c]));

beforeAll(async () => {
  const { buildPoseidon } = await import('circomlibjs');
  poseidon = await buildPoseidon();
  F = poseidon.F;
});

function pathFor(leaf: bigint, depth: number) {
  const zeros: bigint[] = [0n];
  for (let i = 1; i <= depth; i++) zeros.push(p2(zeros[i - 1], zeros[i - 1]));
  let cur = leaf;
  const pathElements: string[] = [];
  const pathIndices: string[] = [];
  for (let i = 0; i < depth; i++) {
    pathElements.push(zeros[i].toString());
    pathIndices.push('0');
    cur = p2(cur, zeros[i]);
  }
  return { root: cur.toString(), pathElements, pathIndices };
}

async function prove(input: Record<string, unknown>) {
  const snarkjs = (await import('snarkjs')) as any;
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    path.join(CIRCUITS_DIR, CIRCUIT, 'circuit_js', 'circuit.wasm'),
    path.join(CIRCUITS_DIR, CIRCUIT, 'circuit_test.zkey'),
  );
  const vkey = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, CIRCUIT, 'test_vkey.json'), 'utf-8'),
  );
  const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  return { valid, publicSignals };
}

const SECRET = 1122334455n;
const AMOUNT = 500000n;
const UNLOCKED_AT = 1750000000n;
const NOW = 1787000000;
const CTX = '77';

const recorded = (amount = AMOUNT, unlockTime = UNLOCKED_AT) =>
  pathFor(p3(SECRET, amount, unlockTime), DEPTH);

const input = (t: ReturnType<typeof recorded>, over: Record<string, unknown> = {}) => ({
  credentialSecret: SECRET.toString(),
  lockedAmount: AMOUNT.toString(),
  unlockTime: UNLOCKED_AT.toString(),
  pathElements: t.pathElements,
  pathIndices: t.pathIndices,
  issuerRoot: t.root,
  minimumAmount: '100000',
  currentTime: String(NOW),
  contextId: CTX,
  ...over,
});

describe('lockup-proof', () => {
  it('VALID: restriction elapsed and position meets the minimum', async () => {
    const { valid, publicSignals } = await prove(input(recorded()));
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 60000);

  it('REJECTS: the restricted period has not elapsed', async () => {
    const stillLocked = 1900000000n;
    const t = recorded(AMOUNT, stillLocked);
    await expect(
      prove(input(t, { unlockTime: stillLocked.toString() })),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: a position below the venue minimum', async () => {
    const t = recorded(1000n);
    await expect(prove(input(t, { lockedAmount: '1000' }))).rejects.toThrow();
  }, 60000);

  it('REJECTS: inflating the recorded position', async () => {
    const t = recorded(1000n);
    await expect(prove(input(t, { lockedAmount: '999999' }))).rejects.toThrow();
  }, 60000);

  it('REJECTS: bringing the unlock date forward', async () => {
    const stillLocked = 1900000000n;
    const t = recorded(AMOUNT, stillLocked);
    await expect(
      prove(input(t, { unlockTime: '1700000000' })),
    ).rejects.toThrow();
  }, 60000);

  it('nullifier is stable per context and unlinkable across contexts', async () => {
    const t = recorded();
    const a = await prove(input(t, { contextId: '77' }));
    const b = await prove(input(t, { contextId: '77' }));
    const c = await prove(input(t, { contextId: '88' }));
    expect(a.publicSignals[1]).toBe(b.publicSignals[1]);
    expect(a.publicSignals[1]).not.toBe(c.publicSignals[1]);
  }, 120000);
});

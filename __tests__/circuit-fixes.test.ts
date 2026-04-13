import { describe, it, expect } from 'vitest';
import * as path from 'path';

// Use dynamic import for snarkjs (ESM)
async function getSnarkjs() {
  return await import('snarkjs') as any;
}

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits');

// ============================================================
// P1-01: hash-preimage — isValid === 1 hard constraint
// ============================================================
describe('P1-01: hash-preimage circuit fix', () => {
  const wasmPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'circuit_js', 'circuit.wasm');
  const zkeyPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'circuit_test.zkey');
  const vkeyPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'test_vkey.json');

  it('VALID: correct preimage generates a valid proof', async () => {
    const snarkjs = await getSnarkjs();
    const { poseidon2 } = await import('poseidon-lite');

    const preimage = BigInt(12345);
    const salt = BigInt(67890);
    const expectedHash = poseidon2([preimage, salt]);

    const input = {
      preimage: preimage.toString(),
      salt: salt.toString(),
      expectedHash: expectedHash.toString(),
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(require('fs').readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    // isValid output should be 1
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('INVALID: wrong preimage makes circuit unsatisfiable', async () => {
    const snarkjs = await getSnarkjs();
    const { poseidon2 } = await import('poseidon-lite');

    const realPreimage = BigInt(12345);
    const salt = BigInt(67890);
    const expectedHash = poseidon2([realPreimage, salt]);

    const wrongPreimage = BigInt(99999);
    const input = {
      preimage: wrongPreimage.toString(),
      salt: salt.toString(),
      expectedHash: expectedHash.toString(),
    };

    // With isValid === 1 constraint, wrong preimage should make circuit unsatisfiable
    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);
});

// ============================================================
// P1-02: quadratic-voting — real sqrt implementation
// ============================================================
describe('P1-02: quadratic-voting circuit fix', () => {
  const wasmPath = path.join(CIRCUITS_DIR, 'quadratic-voting', 'circuit_js', 'circuit.wasm');
  const zkeyPath = path.join(CIRCUITS_DIR, 'quadratic-voting', 'circuit_test.zkey');
  const vkeyPath = path.join(CIRCUITS_DIR, 'quadratic-voting', 'test_vkey.json');

  it('VALID: correct sqrtVal for perfect square (10000 tokens, sqrt=100)', async () => {
    const snarkjs = await getSnarkjs();

    const tokenBalance = 10000;
    const sqrtVal = Math.floor(Math.sqrt(tokenBalance)); // 100

    const input = {
      voterId: '123456',
      tokenBalance: tokenBalance.toString(),
      voteChoice: '1',
      sqrtVal: sqrtVal.toString(),
      pollId: '42',
      minTokens: '100',
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(require('fs').readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    // voteWeight (output) should be sqrtVal = 100, not tokenBalance = 10000
    // publicSignals order: [voteCommitment, voteWeight, canVote, pollId, minTokens]
    expect(publicSignals[1]).toBe('100');
  }, 30000);

  it('VALID: correct sqrtVal for non-perfect square (500 tokens, sqrt=22)', async () => {
    const snarkjs = await getSnarkjs();

    const tokenBalance = 500;
    const sqrtVal = Math.floor(Math.sqrt(tokenBalance)); // 22 (22^2=484 <= 500 < 529=23^2)

    const input = {
      voterId: '123456',
      tokenBalance: tokenBalance.toString(),
      voteChoice: '0',
      sqrtVal: sqrtVal.toString(),
      pollId: '1',
      minTokens: '10',
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(require('fs').readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    expect(publicSignals[1]).toBe('22');
  }, 30000);

  it('INVALID: wrong sqrtVal (too high) makes circuit unsatisfiable', async () => {
    const snarkjs = await getSnarkjs();

    const tokenBalance = 10000;
    const wrongSqrtVal = 101; // 101^2 = 10201 > 10000, lowerBound fails

    const input = {
      voterId: '123456',
      tokenBalance: tokenBalance.toString(),
      voteChoice: '1',
      sqrtVal: wrongSqrtVal.toString(),
      pollId: '42',
      minTokens: '100',
    };

    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('INVALID: wrong sqrtVal (too low) makes circuit unsatisfiable', async () => {
    const snarkjs = await getSnarkjs();

    const tokenBalance = 10000;
    const wrongSqrtVal = 99; // 99^2=9801, (99+1)^2=10000, but 10000 < 10000 is false -> upperBound fails

    const input = {
      voterId: '123456',
      tokenBalance: tokenBalance.toString(),
      voteChoice: '1',
      sqrtVal: wrongSqrtVal.toString(),
      pollId: '42',
      minTokens: '100',
    };

    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('VALID: whale scenario — 999999 tokens, sqrt=999', async () => {
    const snarkjs = await getSnarkjs();

    const tokenBalance = 999999;
    const sqrtVal = Math.floor(Math.sqrt(tokenBalance)); // 999

    const input = {
      voterId: '999',
      tokenBalance: tokenBalance.toString(),
      voteChoice: '5',
      sqrtVal: sqrtVal.toString(),
      pollId: '10',
      minTokens: '1',
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(require('fs').readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    // 999, not 999999
    expect(publicSignals[1]).toBe('999');
  }, 30000);

  it('VALID: minimum case — 1 token, sqrt=1', async () => {
    const snarkjs = await getSnarkjs();

    const tokenBalance = 1;
    const sqrtVal = 1; // 1^2=1 <= 1 < 4=2^2

    const input = {
      voterId: '1',
      tokenBalance: tokenBalance.toString(),
      voteChoice: '0',
      sqrtVal: sqrtVal.toString(),
      pollId: '1',
      minTokens: '1',
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(require('fs').readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    expect(publicSignals[1]).toBe('1');
  }, 30000);
});

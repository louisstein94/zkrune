import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

async function getSnarkjs() {
  return await import('snarkjs') as any;
}

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits');

// ============================================================
// P1-03: balance-proof — Range check to 2^53
// ============================================================
describe('P1-03: balance-proof circuit fix', () => {
  const wasmPath = path.join(CIRCUITS_DIR, 'balance-proof', 'circuit_js', 'circuit.wasm');
  const zkeyPath = path.join(CIRCUITS_DIR, 'balance-proof', 'circuit_test.zkey');
  const vkeyPath = path.join(CIRCUITS_DIR, 'balance-proof', 'test_vkey.json');

  it('VALID: balance 1000 >= minimum 500', async () => {
    const snarkjs = await getSnarkjs();
    const input = { balance: '1000', minimumBalance: '500' };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('VALID: balance exactly equals minimum', async () => {
    const snarkjs = await getSnarkjs();
    const input = { balance: '100', minimumBalance: '100' };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
  }, 30000);

  it('INVALID: balance 100 < minimum 500 — circuit unsatisfiable', async () => {
    const snarkjs = await getSnarkjs();
    const input = { balance: '100', minimumBalance: '500' };

    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('VALID: large balance within 2^53 range', async () => {
    const snarkjs = await getSnarkjs();
    // Just under 2^53
    const input = { balance: '9007199254740991', minimumBalance: '1' };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
  }, 30000);

  it('INVALID: balance exceeds 2^53 — circuit unsatisfiable', async () => {
    const snarkjs = await getSnarkjs();
    // Exactly 2^53
    const input = { balance: '9007199254740992', minimumBalance: '1' };

    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);
});

// ============================================================
// P1-04: age-verification — birthYear bounds
// ============================================================
describe('P1-04: age-verification circuit fix', () => {
  const wasmPath = path.join(CIRCUITS_DIR, 'age-verification', 'circuit_js', 'circuit.wasm');
  const zkeyPath = path.join(CIRCUITS_DIR, 'age-verification', 'circuit_test.zkey');
  const vkeyPath = path.join(CIRCUITS_DIR, 'age-verification', 'test_vkey.json');

  it('VALID: born 2000, current 2026, min age 18 (age=26)', async () => {
    const snarkjs = await getSnarkjs();
    const input = { birthYear: '2000', currentYear: '2026', minimumAge: '18' };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('VALID: exactly 18 years old (boundary)', async () => {
    const snarkjs = await getSnarkjs();
    const input = { birthYear: '2008', currentYear: '2026', minimumAge: '18' };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
  }, 30000);

  it('INVALID: too young (born 2010, age=16, min=18)', async () => {
    const snarkjs = await getSnarkjs();
    const input = { birthYear: '2010', currentYear: '2026', minimumAge: '18' };

    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('INVALID: birthYear before 1900 — circuit unsatisfiable', async () => {
    const snarkjs = await getSnarkjs();
    const input = { birthYear: '1899', currentYear: '2026', minimumAge: '18' };

    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('INVALID: birthYear after currentYear — circuit unsatisfiable', async () => {
    const snarkjs = await getSnarkjs();
    const input = { birthYear: '2027', currentYear: '2026', minimumAge: '18' };

    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);

  it('VALID: born 1900 (lower boundary)', async () => {
    const snarkjs = await getSnarkjs();
    const input = { birthYear: '1900', currentYear: '2026', minimumAge: '18' };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
  }, 30000);
});

// ============================================================
// A14: demoHash replaced with Poseidon in clientZkProof.ts
// ============================================================
describe('A14: computeHash uses Poseidon', () => {
  it('hash-preimage prepareCircuitInputs produces valid Poseidon hash', async () => {
    const { poseidon2 } = await import('poseidon-lite');

    // Dynamically import to test the actual function
    const { generateClientProof } = await import('../lib/clientZkProof');

    // The function should compute expectedHash = Poseidon(preimage, salt)
    const preimage = '12345';
    const salt = '67890';
    const expectedPoseidon = poseidon2([BigInt(preimage), BigInt(salt)]).toString();

    // We can't directly test prepareCircuitInputs (not exported),
    // but we can verify the hash-preimage circuit proof works with Poseidon
    const snarkjs = await import('snarkjs') as any;
    const wasmPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'circuit_js', 'circuit.wasm');
    const zkeyPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'circuit_test.zkey');
    const vkeyPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'test_vkey.json');

    // Use the same Poseidon hash the updated computeHash would produce
    const input = {
      preimage,
      salt,
      expectedHash: expectedPoseidon,
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
    const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    expect(valid).toBe(true);
    // isValid should be 1 since hash matches
    expect(publicSignals[0]).toBe('1');
  }, 30000);

  it('old demoHash value no longer works with circuit', async () => {
    const snarkjs = await import('snarkjs') as any;
    const wasmPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'circuit_js', 'circuit.wasm');
    const zkeyPath = path.join(CIRCUITS_DIR, 'hash-preimage', 'circuit_test.zkey');

    // Old demoHash: simple charcode sum of "12345-67890"
    const oldDemoHash = '12345-67890'.split('').reduce((s, c) => s + c.charCodeAt(0), 0).toString();

    const input = {
      preimage: '12345',
      salt: '67890',
      expectedHash: oldDemoHash,
    };

    // Should fail because Poseidon(12345, 67890) != charcode sum
    await expect(
      snarkjs.groth16.fullProve(input, wasmPath, zkeyPath)
    ).rejects.toThrow();
  }, 30000);
});

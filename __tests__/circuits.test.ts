import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const CIRCUITS_DIR = path.join(__dirname, '..', 'public', 'circuits');
const CIRCUITS_SRC_DIR = path.join(__dirname, '..', 'circuits');

const EXPECTED_CIRCUITS = [
  'age-verification',
  'anonymous-reputation',
  'balance-proof',
  'credential-proof',
  'hash-preimage',
  'membership-proof',
  'nft-ownership',
  'patience-proof',
  'private-voting',
  'quadratic-voting',
  'range-proof',
  'signature-verification',
  'token-swap',
  'whale-holder',
];

describe('Circuit Artifacts', () => {
  it('public/circuits directory exists', () => {
    expect(fs.existsSync(CIRCUITS_DIR)).toBe(true);
  });

  for (const circuit of EXPECTED_CIRCUITS) {
    describe(circuit, () => {
      it('has .wasm file', () => {
        const wasmPath = path.join(CIRCUITS_DIR, `${circuit}.wasm`);
        expect(fs.existsSync(wasmPath)).toBe(true);
        const stat = fs.statSync(wasmPath);
        expect(stat.size).toBeGreaterThan(0);
      });

      it('has .zkey file', () => {
        const zkeyPath = path.join(CIRCUITS_DIR, `${circuit}.zkey`);
        expect(fs.existsSync(zkeyPath)).toBe(true);
        const stat = fs.statSync(zkeyPath);
        expect(stat.size).toBeGreaterThan(0);
      });

      it('has valid verification key JSON', () => {
        const vkeyPath = path.join(CIRCUITS_DIR, `${circuit}_vkey.json`);
        expect(fs.existsSync(vkeyPath)).toBe(true);

        const raw = fs.readFileSync(vkeyPath, 'utf-8');
        const vkey = JSON.parse(raw);

        expect(vkey.protocol).toBe('groth16');
        expect(vkey.curve).toBe('bn128');
        expect(vkey.nPublic).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(vkey.IC)).toBe(true);
        expect(vkey.IC.length).toBe(vkey.nPublic + 1);
      });

      it('has matching source .circom file', () => {
        const circomPath = path.join(CIRCUITS_SRC_DIR, circuit, 'circuit.circom');
        expect(fs.existsSync(circomPath)).toBe(true);
      });
    });
  }
});

describe('Circuit VKey Consistency', () => {
  it('all circuits have distinct IC vectors (different constraint systems)', () => {
    const icSignatures = new Set<string>();

    for (const circuit of EXPECTED_CIRCUITS) {
      const vkeyPath = path.join(CIRCUITS_DIR, `${circuit}_vkey.json`);
      const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
      const icSig = JSON.stringify(vkey.IC);
      icSignatures.add(icSig);
    }

    expect(icSignatures.size).toBe(EXPECTED_CIRCUITS.length);
  });

  it('no circuit has nPublic > 10 (sanity check)', () => {
    for (const circuit of EXPECTED_CIRCUITS) {
      const vkeyPath = path.join(CIRCUITS_DIR, `${circuit}_vkey.json`);
      const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf-8'));
      expect(vkey.nPublic).toBeLessThanOrEqual(10);
    }
  });
});

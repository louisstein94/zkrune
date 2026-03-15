import { describe, it, expect } from 'vitest';
import * as sdk from '../index';

describe('public API exports', () => {
  it('exports ZkRune class', () => {
    expect(sdk.ZkRune).toBeDefined();
    expect(typeof sdk.ZkRune).toBe('function');
  });

  it('exports templates constant', () => {
    expect(sdk.templates).toBeDefined();
    expect(sdk.templates.AGE_VERIFICATION).toBe('age-verification');
  });

  it('exports backward-compatible standalone functions', () => {
    expect(typeof sdk.generateProof).toBe('function');
    expect(typeof sdk.verifyProof).toBe('function');
    expect(typeof sdk.verifyProofRemote).toBe('function');
  });

  it('exports error classes', () => {
    expect(sdk.ZkRuneError).toBeDefined();
    expect(sdk.ZkRuneErrorCode).toBeDefined();
    expect(sdk.toZkRuneError).toBeDefined();
  });

  it('exports CircuitLoader', () => {
    expect(sdk.CircuitLoader).toBeDefined();
  });

  it('exports Logger', () => {
    expect(sdk.Logger).toBeDefined();
  });

  it('exports DEFAULT_CONFIG', () => {
    expect(sdk.DEFAULT_CONFIG).toBeDefined();
    expect(sdk.DEFAULT_CONFIG.circuitBaseUrl).toBe('https://zkrune.com/circuits');
  });

  it('exports CIRCUIT_SCHEMAS', () => {
    expect(sdk.CIRCUIT_SCHEMAS).toBeDefined();
    expect(Object.keys(sdk.CIRCUIT_SCHEMAS)).toHaveLength(13);
  });

  it('exports validateInputs', () => {
    expect(typeof sdk.validateInputs).toBe('function');
  });

  it('exports prove and verify functions', () => {
    expect(typeof sdk.prove).toBe('function');
    expect(typeof sdk.verifyLocal).toBe('function');
    expect(typeof sdk.verifyRemote).toBe('function');
  });
});

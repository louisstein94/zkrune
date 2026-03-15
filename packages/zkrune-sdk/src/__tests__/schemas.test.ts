import { describe, it, expect } from 'vitest';
import { validateInputs, CIRCUIT_SCHEMAS } from '../circuits/schemas';
import type { TemplateId } from '../types';

describe('CIRCUIT_SCHEMAS', () => {
  const templateIds: TemplateId[] = [
    'age-verification', 'balance-proof', 'membership-proof', 'range-proof',
    'private-voting', 'hash-preimage', 'credential-proof', 'token-swap',
    'signature-verification', 'patience-proof', 'quadratic-voting',
    'nft-ownership', 'anonymous-reputation',
  ];

  it('has schemas for all 13 templates', () => {
    expect(Object.keys(CIRCUIT_SCHEMAS)).toHaveLength(13);
    for (const id of templateIds) {
      expect(CIRCUIT_SCHEMAS[id]).toBeDefined();
      expect(CIRCUIT_SCHEMAS[id].id).toBe(id);
    }
  });

  it('every schema has at least one field', () => {
    for (const id of templateIds) {
      expect(CIRCUIT_SCHEMAS[id].fields.length).toBeGreaterThan(0);
    }
  });

  it('every schema has a valid category', () => {
    const validCategories = ['identity', 'financial', 'governance', 'cryptographic'];
    for (const id of templateIds) {
      expect(validCategories).toContain(CIRCUIT_SCHEMAS[id].category);
    }
  });
});

describe('validateInputs', () => {
  it('passes valid age-verification inputs', () => {
    const result = validateInputs('age-verification', {
      birthYear: '1990',
      currentYear: '2026',
      minimumAge: '18',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when required fields are missing', () => {
    const result = validateInputs('age-verification', {
      birthYear: '1990',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(result.errors.some(e => e.includes('currentYear'))).toBe(true);
    expect(result.errors.some(e => e.includes('minimumAge'))).toBe(true);
  });

  it('fails when integer field contains non-numeric value', () => {
    const result = validateInputs('age-verification', {
      birthYear: 'abc',
      currentYear: '2026',
      minimumAge: '18',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('birthYear'))).toBe(true);
  });

  it('fails when unknown fields are provided', () => {
    const result = validateInputs('balance-proof', {
      balance: '10000',
      minimumBalance: '5000',
      extraField: '123',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('extraField'))).toBe(true);
  });

  it('accepts hex values for hash fields', () => {
    const result = validateInputs('hash-preimage', {
      preimage: '0xabcdef123',
      salt: '42',
      expectedHash: '0x1234567890abcdef',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid hash values', () => {
    const result = validateInputs('hash-preimage', {
      preimage: 'not-a-hash',
      salt: '42',
      expectedHash: '100',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('preimage'))).toBe(true);
  });

  it('validates all fields for credential-proof', () => {
    const result = validateInputs('credential-proof', {
      credentialHash: '12345',
      credentialSecret: '67890',
      validUntil: '1700000000',
      currentTime: '1690000000',
      expectedHash: '11111',
    });
    expect(result.valid).toBe(true);
  });

  it('validates token-swap with all 5 fields', () => {
    const result = validateInputs('token-swap', {
      tokenABalance: '10000',
      swapSecret: '999',
      requiredTokenA: '5000',
      swapRate: '1500',
      minReceive: '7000',
    });
    expect(result.valid).toBe(true);
  });

  it('validates quadratic-voting inputs', () => {
    const result = validateInputs('quadratic-voting', {
      voterId: '123',
      tokenBalance: '1000',
      voteChoice: '1',
      pollId: '42',
      minTokens: '100',
    });
    expect(result.valid).toBe(true);
  });
});

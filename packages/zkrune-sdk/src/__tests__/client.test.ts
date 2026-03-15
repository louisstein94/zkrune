import { describe, it, expect } from 'vitest';
import { ZkRune } from '../client';
import { templates } from '../circuits';
import { DEFAULT_CONFIG } from '../types';

describe('ZkRune', () => {
  it('creates instance with default config', () => {
    const zk = new ZkRune();
    expect(zk).toBeDefined();
    expect(zk.getCachedCircuits()).toEqual([]);
  });

  it('creates instance with custom config', () => {
    const zk = new ZkRune({
      circuitBaseUrl: 'https://custom.com/circuits',
      debug: true,
      timeout: 60_000,
    });
    expect(zk).toBeDefined();
  });

  it('rejects invalid inputs before loading circuits', async () => {
    const zk = new ZkRune();
    const result = await zk.prove('age-verification', {
      birthYear: 'not-a-number',
      currentYear: '2026',
      minimumAge: '18',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('birthYear');
  });

  it('rejects missing required fields', async () => {
    const zk = new ZkRune();
    const result = await zk.prove('balance-proof', {
      balance: '1000',
    } as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('minimumBalance');
  });
});

describe('templates', () => {
  it('has 13 template entries', () => {
    expect(Object.keys(templates)).toHaveLength(13);
  });

  it('all template values are kebab-case strings', () => {
    for (const value of Object.values(templates)) {
      expect(value).toMatch(/^[a-z]+-[a-z]+(-[a-z]+)?$/);
    }
  });
});

describe('DEFAULT_CONFIG', () => {
  it('has correct default values', () => {
    expect(DEFAULT_CONFIG.circuitBaseUrl).toBe('https://zkrune.com/circuits');
    expect(DEFAULT_CONFIG.verifierUrl).toBe('https://zkrune.com/api/verify-proof');
    expect(DEFAULT_CONFIG.debug).toBe(false);
    expect(DEFAULT_CONFIG.timeout).toBe(30_000);
    expect(DEFAULT_CONFIG.cache).toBe(true);
  });
});

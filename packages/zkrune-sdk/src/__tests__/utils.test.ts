import { describe, it, expect } from 'vitest';
import { ZkRuneError, ZkRuneErrorCode, toZkRuneError } from '../utils/errors';
import { Logger } from '../utils/logger';
import { hashProof } from '../utils/hash';

describe('ZkRuneError', () => {
  it('creates an error with code', () => {
    const err = new ZkRuneError('test', ZkRuneErrorCode.TIMEOUT);
    expect(err.message).toBe('test');
    expect(err.code).toBe(ZkRuneErrorCode.TIMEOUT);
    expect(err.name).toBe('ZkRuneError');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('toZkRuneError', () => {
  it('returns same error if already ZkRuneError', () => {
    const original = new ZkRuneError('x', ZkRuneErrorCode.NETWORK_ERROR);
    expect(toZkRuneError(original)).toBe(original);
  });

  it('wraps a plain Error', () => {
    const err = toZkRuneError(new Error('plain'));
    expect(err).toBeInstanceOf(ZkRuneError);
    expect(err.message).toBe('plain');
    expect(err.code).toBe(ZkRuneErrorCode.UNKNOWN);
  });

  it('wraps a string', () => {
    const err = toZkRuneError('string error');
    expect(err.message).toBe('string error');
    expect(err.code).toBe(ZkRuneErrorCode.UNKNOWN);
  });

  it('wraps null/undefined', () => {
    expect(toZkRuneError(null).message).toBe('null');
    expect(toZkRuneError(undefined).message).toBe('undefined');
  });
});

describe('Logger', () => {
  it('defaults to silent (no output)', () => {
    const logger = new Logger();
    // Should not throw
    logger.debug('test');
    logger.info('test');
    logger.warn('test');
    logger.error('test');
  });

  it('changes level with setLevel', () => {
    const logger = new Logger('silent');
    logger.setLevel('debug');
    // Should not throw
    logger.debug('now visible');
  });
});

describe('hashProof', () => {
  it('returns a 64-char hex string (SHA-256)', async () => {
    const hash = await hashProof({ pi_a: ['1', '2', '3'] });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns consistent hash for same input', async () => {
    const input = { a: '1', b: '2' };
    const hash1 = await hashProof(input);
    const hash2 = await hashProof(input);
    expect(hash1).toBe(hash2);
  });

  it('returns different hash for different input', async () => {
    const hash1 = await hashProof({ x: '1' });
    const hash2 = await hashProof({ x: '2' });
    expect(hash1).not.toBe(hash2);
  });
});

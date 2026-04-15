import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isCeremonyAdmin, isCeremonyAuthConfigured } from '../lib/auth/ceremonyAuth';

const originalToken = process.env.CEREMONY_ADMIN_TOKEN;

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/ceremony', {
    method: 'POST',
    headers,
  });
}

describe('ceremonyAuth', () => {
  afterEach(() => {
    if (originalToken !== undefined) {
      process.env.CEREMONY_ADMIN_TOKEN = originalToken;
    } else {
      delete process.env.CEREMONY_ADMIN_TOKEN;
    }
  });

  describe('isCeremonyAuthConfigured', () => {
    it('returns false when token unset', () => {
      delete process.env.CEREMONY_ADMIN_TOKEN;
      expect(isCeremonyAuthConfigured()).toBe(false);
    });

    it('returns false when token too short', () => {
      process.env.CEREMONY_ADMIN_TOKEN = 'short';
      expect(isCeremonyAuthConfigured()).toBe(false);
    });

    it('returns true when token is 16+ chars', () => {
      process.env.CEREMONY_ADMIN_TOKEN = 'a'.repeat(16);
      expect(isCeremonyAuthConfigured()).toBe(true);
    });
  });

  describe('isCeremonyAdmin', () => {
    const validToken = 'test-token-32-chars-long-for-tests';

    beforeEach(() => {
      process.env.CEREMONY_ADMIN_TOKEN = validToken;
    });

    it('accepts matching Bearer token', () => {
      const req = makeRequest({ Authorization: `Bearer ${validToken}` });
      expect(isCeremonyAdmin(req)).toBe(true);
    });

    it('accepts case-insensitive Bearer prefix', () => {
      const req = makeRequest({ Authorization: `bearer ${validToken}` });
      expect(isCeremonyAdmin(req)).toBe(true);
    });

    it('rejects missing Authorization header', () => {
      const req = makeRequest();
      expect(isCeremonyAdmin(req)).toBe(false);
    });

    it('rejects wrong token of same length', () => {
      const wrong = 'X'.repeat(validToken.length);
      const req = makeRequest({ Authorization: `Bearer ${wrong}` });
      expect(isCeremonyAdmin(req)).toBe(false);
    });

    it('rejects wrong token of different length', () => {
      const req = makeRequest({ Authorization: 'Bearer short' });
      expect(isCeremonyAdmin(req)).toBe(false);
    });

    it('rejects non-Bearer scheme', () => {
      const req = makeRequest({ Authorization: `Basic ${validToken}` });
      expect(isCeremonyAdmin(req)).toBe(false);
    });

    it('rejects when env var is unset even with correct request', () => {
      delete process.env.CEREMONY_ADMIN_TOKEN;
      const req = makeRequest({ Authorization: `Bearer ${validToken}` });
      expect(isCeremonyAdmin(req)).toBe(false);
    });

    it('rejects when env token is below minimum length', () => {
      process.env.CEREMONY_ADMIN_TOKEN = 'short';
      const req = makeRequest({ Authorization: 'Bearer short' });
      expect(isCeremonyAdmin(req)).toBe(false);
    });
  });
});

// Phase 3 static integration tests
//
// These tests do not spin up a server — they verify code-level invariants
// that protect the security properties added in Phase 3 (Day 11-20).
// They are fast, deterministic, and catch regressions like "someone
// re-introduced NEXT_PUBLIC_SUPABASE_ANON_KEY in a server route" without
// needing a full Next.js runtime.

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

function exists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ============================================================
// Service role key isolation (P3-01)
// ============================================================
describe('service role key isolation', () => {
  it('no API route imports NEXT_PUBLIC_SUPABASE_ANON_KEY directly', () => {
    const apiDir = path.join(ROOT, 'app', 'api');
    const routes = findRouteFiles(apiDir);
    expect(routes.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const route of routes) {
      const content = fs.readFileSync(route, 'utf-8');
      if (content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
        offenders.push(path.relative(ROOT, route));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('lib/supabase/serverClient.ts uses SUPABASE_SERVICE_ROLE_KEY', () => {
    const content = read('lib/supabase/serverClient.ts');
    expect(content).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(content).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  });

  it('lib/supabase/serverClient.ts fails closed on missing env', () => {
    const content = read('lib/supabase/serverClient.ts');
    // Must throw instead of silently continuing.
    expect(content).toMatch(/throw new Error/);
  });
});

// ============================================================
// Fail-closed secrets (Day 13)
// ============================================================
describe('fail-closed secrets', () => {
  it('balance-attestation has no hardcoded secret fallback', () => {
    const content = read('app/api/balance-attestation/route.ts');
    expect(content).not.toContain('zkrune-attestation-default-key');
    // Should read the env at request time via a helper that throws.
    expect(content).toMatch(/getAttestationSecret/);
  });

  it('zcash-balance returns failure instead of fake 5.12345678 balance', () => {
    const content = read('app/api/zcash-balance/route.ts');
    // Fake balance must not appear in a success response.
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('5.12345678')) {
        // Allowed only inside a block that sets success:false.
        const windowStart = Math.max(0, i - 5);
        const windowEnd = Math.min(lines.length, i + 5);
        const block = lines.slice(windowStart, windowEnd).join('\n');
        expect(block).not.toMatch(/success:\s*true/);
      }
    }
  });

  it('zcash-balance-lightwalletd returns failure on error', () => {
    const content = read('app/api/zcash-balance-lightwalletd/route.ts');
    // Error path must not return a fabricated success.
    expect(content).not.toMatch(/balance:\s*5\.12345678,\s*[\r\n]+\s*source:\s*'demo'/);
  });

  it('supabase client does not ship placeholder credentials', () => {
    // Strip JSDoc / block comments so doc references to the old behaviour
    // do not count as live code.
    const raw = read('lib/supabase/client.ts');
    const stripped = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    expect(stripped).not.toContain('placeholder.supabase.co');
    expect(stripped).not.toContain("'placeholder-key'");
  });
});

// ============================================================
// Ceremony admin auth (A3)
// ============================================================
describe('ceremony admin auth', () => {
  const ceremonyRoutes = [
    'app/api/ceremony/route.ts',
    'app/api/ceremony/sync/route.ts',
    'app/api/ceremony/zkey/route.ts',
  ];

  for (const route of ceremonyRoutes) {
    it(`${route} POST gates on isCeremonyAdmin`, () => {
      const content = read(route);
      expect(content).toContain('isCeremonyAdmin');
      expect(content).toContain('isCeremonyAuthConfigured');
    });
  }

  it('ceremonyAuth helper uses constant-time compare', () => {
    const content = read('lib/auth/ceremonyAuth.ts');
    expect(content).toContain('timingSafeEqual');
  });
});

// ============================================================
// Votes route (P3-02, P3-03, P3-04)
// ============================================================
describe('votes route hardening', () => {
  const content = read('app/api/governance/votes/route.ts');

  it('distinguishes RPC outage from missing token account', () => {
    expect(content).toMatch(/accountMissing|account not found/i);
    // Must return 503 on non-"missing" RPC errors.
    expect(content).toContain('503');
  });

  it('calls cast_vote RPC for atomic tallying', () => {
    expect(content).toContain('rpc/cast_vote');
    expect(content).toContain('p_quorum_threshold');
  });

  it('computes quorum from staking TVL, not a hardcoded 100', () => {
    // The old "totalVotes >= 100" pattern must be gone.
    expect(content).not.toMatch(/totalVotes\s*>=\s*100\b/);
    expect(content).toContain('QUORUM_PERCENTAGE');
    expect(content).toContain('staking_positions');
  });
});

// ============================================================
// Marketplace templates (P3-05, P3-06, P3-07)
// ============================================================
describe('marketplace templates route', () => {
  const content = read('app/api/marketplace/templates/route.ts');

  it('requires signedMessage + signature on POST', () => {
    expect(content).toMatch(/signedMessage.*signature|signature.*signedMessage/s);
    expect(content).toContain("'create-template'");
  });

  it('validates price is a finite non-negative number', () => {
    expect(content).toContain('Number.isFinite');
    expect(content).toContain('numericPrice');
  });

  it('sanitizes search parameter before PostgREST interpolation', () => {
    // Must strip special characters before interpolating into or() filter.
    expect(content).toMatch(/safeSearch|replace\(\/\[\^/);
  });
});

// ============================================================
// Marketplace purchases (Day 18)
// ============================================================
describe('marketplace purchases route', () => {
  const content = read('app/api/marketplace/purchases/route.ts');

  it('requires signedMessage + signature on POST', () => {
    expect(content).toContain('signedMessage');
    expect(content).toContain("'purchase-template'");
  });

  it('rejects txSig replay across all purchases', () => {
    expect(content).toMatch(/transaction_signature=eq\.\${?transactionSignature}?/);
    expect(content).toContain('already been used for a purchase');
  });
});

// ============================================================
// Staking route (P4-05, Day 18)
// ============================================================
describe('staking route validation', () => {
  const content = read('app/api/staking/route.ts');

  it('validates amount is a finite positive number on POST', () => {
    expect(content).toMatch(/Number\.isFinite\(numericAmount\)/);
    expect(content).toContain('amount must be a positive number');
  });

  it('whitelists PATCH action to claim/unstake before verifyAuth', () => {
    // Isolate the PATCH handler body and verify the whitelist runs before
    // the verifyAuth(action) call within that handler.
    const patchStart = content.indexOf('export async function PATCH');
    expect(patchStart).toBeGreaterThan(0);
    const patchBody = content.slice(patchStart);
    const whitelistIdx = patchBody.indexOf("action !== 'claim' && action !== 'unstake'");
    // verifyAuth inside PATCH uses `action` as the second positional arg.
    const verifyIdx = patchBody.search(/verifyAuth\([\s\S]*?action,/);
    expect(whitelistIdx).toBeGreaterThan(0);
    expect(verifyIdx).toBeGreaterThan(whitelistIdx);
  });
});

// ============================================================
// Governance proposals (Day 19)
// ============================================================
describe('governance proposals route', () => {
  const content = read('app/api/governance/proposals/route.ts');

  it('requires wallet signature on POST', () => {
    expect(content).toContain('signedMessage');
    expect(content).toContain("'create-proposal'");
    expect(content).toContain('verifyAuth');
  });

  it('whitelists proposal type against configured enum', () => {
    expect(content).toContain('PROPOSAL_TYPES.includes');
  });
});

// ============================================================
// Client hooks signed payloads
// ============================================================
describe('client hooks send signed payloads', () => {
  it('useGovernance.createProposal binds signature', () => {
    const content = read('lib/hooks/useGovernance.ts');
    expect(content).toContain("buildSignedPayload('create-proposal'");
  });

  it('useMarketplacePurchase.purchase binds signature', () => {
    const content = read('lib/hooks/useMarketplacePurchase.ts');
    expect(content).toContain("'purchase-template'");
    expect(content).toContain('buildSignedPayload');
  });

  it('useMarketplace.listTemplate signature type requires signed payload', () => {
    const content = read('lib/hooks/useMarketplace.ts');
    // The public hook type must require signedMessage + signature so
    // callers cannot pass an unsigned payload at compile time.
    expect(content).toMatch(/listTemplate[\s\S]*signedMessage: string[\s\S]*signature: string/);
  });
});

// ============================================================
// Migration files exist (Phase 3 DB state)
// ============================================================
describe('Phase 3 migrations present', () => {
  const migrations = [
    'lib/supabase/migrations/20260414_restrict_rls_policies.sql',
    'lib/supabase/migrations/20260414_cast_vote_atomic.sql',
    'lib/supabase/migrations/20260414_add_trust_level.sql',
    'lib/supabase/migrations/20260414_purchases_txsig_unique.sql',
  ];
  for (const m of migrations) {
    it(m, () => {
      expect(exists(m)).toBe(true);
    });
  }
});

// ---------- helpers ----------

function findRouteFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRouteFiles(full));
    } else if (entry.isFile() && entry.name === 'route.ts') {
      results.push(full);
    }
  }
  return results;
}

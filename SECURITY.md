# Security Policy

## 🛡️ Security Overview

zkRune takes security seriously. This document outlines our security practices, implemented protections, and vulnerability reporting procedures.

> **Last updated:** 2026-04-14 — Phase 1–4 remediation complete.
> See `SECURITY_FIX_DAILY_PLAN.md` for the per-day breakdown.

---

## ✅ Implemented Security Measures

### 1. **Security Headers** (via Middleware)

#### Content Security Policy (CSP) — nonce-based
```
default-src 'self'
script-src 'self' 'nonce-<per-request>' 'strict-dynamic' 'unsafe-eval'
frame-ancestors 'none' (default) | EMBED_ALLOWED_PARENTS (embed)
```
- `unsafe-eval` is kept because the snarkjs WASM loader requires it.
- `'unsafe-inline'` was removed from `script-src` in Phase 4 Day 22.
- A per-request nonce is forwarded via the `x-nonce` request header.
- Embed CSP reads `EMBED_ALLOWED_PARENTS` env var instead of `*`.

#### Additional Headers
- **X-Frame-Options**: DENY (default routes; embed pages opt out)
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **HSTS**: Enabled in production (31536000 seconds)
- **Permissions-Policy**: camera / microphone / geolocation disabled

All of the above now also apply to `/api/actions/*` (previously they
short-circuited the middleware and shipped without any headers).

### 2. **Rate Limiting**

- **Global** (middleware): 100 requests per minute per IP.
- **RPC proxy** (`/api/rpc`): 30 req/min per IP + JSON-RPC method
  whitelist + 50 KB body cap + batch cap of 20 calls.
- **AI routes**: 10 req/min for `/api/ai-chat`, 5 req/min for
  `/api/ai-circuit` (paid upstream models).
- IP resolution prefers `x-real-ip` / `cf-connecting-ip` /
  `x-vercel-forwarded-for` over the spoofable `x-forwarded-for`.
- In-memory store is **capped** at 10 000 entries with oldest-first
  eviction and a periodic sweep to bound memory under IP spoofing.
  Multi-instance deployments should migrate to Upstash Redis (TODO
  marker in `middleware.ts`).

### 3. **Input Validation**

**Zod schemas with length bounds:**
- Proof verification: every field-element array has explicit
  `.length()` / `.max()` caps. `vk_alphabeta_12` is a typed 2×3×2
  tensor (previously `z.array(z.any())`).
- `publicSignals.max(64)`, `IC.max(65)`.
- `vKey.protocol === 'groth16'` and `vKey.curve === 'bn128'` enforced.
- Zcash address format, template-ID enum, environment variables.

**What was removed:**
The old `sanitizeString` helper (blocklist-based XSS "protection") was
deleted in Phase 4 Day 26. It was never called and its regex was
bypassable. No component renders user input as HTML.

### 4. **Authentication & Replay Protection**

- Wallet signatures bind `action + wallet + sorted fields + ts` in a
  canonical message checked by `verifyAuth`.
- Timestamps must be **fresh** (≤ 5 min) AND **not more than 30 s in
  the future** (Phase 4 Day 24 A6b).
- Successfully verified signatures are recorded for `MAX_AGE_MS + grace`
  and a replay is rejected at the signature level (Phase 4 Day 24 A6a).
- Ceremony routes (`/api/ceremony*`) require a bearer
  `CEREMONY_ADMIN_TOKEN`; all POSTs fail closed when unset.

### 5. **Server-side Data Access**

- Every `/app/api/*` route talks to Supabase via
  `lib/supabase/serverClient.ts`, which uses `SUPABASE_SERVICE_ROLE_KEY`
  and throws when unset. No route imports `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- All write-side RLS policies are scoped `TO service_role`; anon-reads
  remain public. Migration SQL is in `lib/supabase/migrations/`.
- Votes use an atomic PL/pgSQL `cast_vote` RPC: the vote row insert
  and proposal aggregate update happen in a single transaction, with
  a unique `(proposal_id, voter)` constraint to prevent double voting.
- Premium + marketplace purchase routes enforce **tx-signature replay
  protection** via unique constraints on `burn_history` and `purchases`.

### 6. **Client-Side Security**

**Privacy-First Architecture:**
- ✅ 100% client-side proof generation
- ✅ Zero server-side storage of sensitive data
- ✅ No telemetry without consent
- ✅ Verification key fetched with integrity checks (HTTP status,
  content-type, structural validation) and cached per-session to
  prevent mid-session VK substitution (Phase 4 Day 23 A15).
- ✅ Public inputs derived from secrets (collectionRoot, expectedHash,
  commitmentHash) are **always recomputed** from private inputs;
  caller-supplied values are discarded (Phase 4 Day 23 P4-03).
- ✅ Local-only cryptographic operations

**Web Security:**
- Touch manipulation CSS (prevents double-tap zoom exploits)
- Tap highlight removal (prevents visual tracking)
- Secure random generation for cryptographic operations

---

## 🔒 Security Best Practices

### For Developers

#### 1. **Never Commit Secrets**
```bash
# ❌ BAD
NEXT_PUBLIC_API_KEY=secret123

# ✅ GOOD  
# Use environment variables
# Store in .env.local (gitignored)
```

#### 2. **Validate All Inputs**
```typescript
import { validateAndSanitize, proofVerificationSchema } from '@/lib/validation';

const result = validateAndSanitize(proofVerificationSchema, data);
if (!result.success) {
  return res.status(400).json({ error: result.error });
}
```

#### 3. **Use Type-Safe Environment Access**
```typescript
import { getEnv, isProduction } from '@/lib/env';

const apiUrl = getEnv('NEXT_PUBLIC_APP_URL');
```

#### 4. **Sanitize User Input**
```typescript
import { sanitizeString, containsMaliciousPattern } from '@/lib/validation';

const safe = sanitizeString(userInput);
if (containsMaliciousPattern(userInput)) {
  throw new Error('Malicious input detected');
}
```

### For Users

#### 1. **Verify Deployment**
- Check URL: https://zkrune.com (official)
- Verify SSL certificate
- Check for browser warnings

#### 2. **Protect Your Data**
- Never share private keys
- Never share viewing keys publicly
- Use hardware wallets when possible

#### 3. **Verify Proofs**
- All proofs generated client-side
- No data sent to servers
- Verify proofs independently

---

## 🚨 Known Limitations

### 1. **Trusted Setup**

**Current:** Multi-party ceremony completed (January 2026)
```
⚠️  Proving keys generated via single-party snarkjs zkey contribute
✅  Produces valid, verifiable proofs
⚠️  Key generator could theoretically forge proofs
```

**Production Path:**
- Multi-party ceremony (MPC)
- 10+ independent contributors
- Tools: snarkjs ceremony, Phase2 Coordinator

### 2. **Dependencies**

**Current Vulnerabilities:**
```
4 vulnerabilities (3 high, 1 critical)
```

**Status:**
- Reviewed: All are in development dependencies
- Impact: No runtime security issues
- Plan: Monitor and update regularly

**To fix:**
```bash
npm audit fix
# Or for force updates:
npm audit fix --force
```

### 3. **Rate Limiting**

**Current:** In-memory storage
```
⚠️  Resets on server restart
⚠️  Not shared across multiple instances
```

**Production Recommendation:**
- Use Redis for distributed rate limiting
- Implement IP-based blocking
- Add CAPTCHA for suspicious activity

---

## 📋 Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] Environment variables validated
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] HTTPS enforced
- [ ] Dependencies updated
- [ ] `npm audit` clean
- [ ] CSP headers configured
- [ ] CORS properly configured
- [ ] Error messages don't leak sensitive info

### Post-Deployment

- [ ] SSL certificate valid
- [ ] Security headers verified (securityheaders.com)
- [ ] Rate limiting tested
- [ ] Error handling tested
- [ ] Monitoring configured
- [ ] Incident response plan ready

---

## 🐛 Reporting a Vulnerability

### Where to Report

**GitHub Security Advisories:**
1. Go to: https://github.com/louisstein94/zkrune/security/advisories
2. Click "New draft security advisory"
3. Fill in details

**Email:**
- Direct: [Your security email]
- Include: "SECURITY" in subject line

### What to Include

```
1. Description of vulnerability
2. Steps to reproduce
3. Impact assessment
4. Suggested fix (if any)
5. Your contact information
```

### Response Timeline

- **24 hours**: Initial acknowledgment
- **7 days**: Impact assessment
- **30 days**: Fix developed and tested
- **Public disclosure**: After fix deployed

### Scope

**In Scope:**
- ✅ XSS vulnerabilities
- ✅ CSRF vulnerabilities
- ✅ Authentication bypass
- ✅ Sensitive data exposure
- ✅ Injection attacks
- ✅ Cryptographic issues

**Out of Scope:**
- ❌ Social engineering
- ❌ Physical attacks
- ❌ DDoS attacks
- ❌ Issues in third-party dependencies (report upstream)

---

## 🔐 Cryptographic Security

### Proof Generation

**Client-Side Only:**
```
✅ All cryptographic operations in browser
✅ Private inputs never transmitted
✅ Uses Web Crypto API when available
✅ Groth16 zk-SNARKs (battle-tested)
```

**Verification:**
```typescript
// Independent verification
import { groth16 } from 'snarkjs';

const isValid = await groth16.verify(vKey, publicSignals, proof);
```

### Random Generation

```typescript
// Secure random generation
crypto.getRandomValues(new Uint8Array(32));

// NOT crypto.randomBytes() on client
// NOT Math.random()
```

---

## 📊 Security Monitoring

### Metrics to Track

1. **Failed authentication attempts**
2. **Rate limit violations**
3. **Invalid input patterns**
4. **Error rates**
5. **Response times**

### Logging

**What We Log:**
- ✅ API requests (anonymized)
- ✅ Error messages (sanitized)
- ✅ Performance metrics

**What We DON'T Log:**
- ❌ Private keys
- ❌ Viewing keys
- ❌ User secrets
- ❌ Proof inputs
- ❌ Personal information

---

## 🛠️ Development Security

### Code Review Checklist

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Error handling doesn't leak info
- [ ] SQL injection not possible (N/A - no SQL)
- [ ] XSS prevention in place
- [ ] CSRF tokens used (where needed)
- [ ] Authentication required (where needed)
- [ ] Rate limiting applied

### Testing

```bash
# Security testing
npm run test:security

# Dependency audit
npm audit

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📚 Resources

### Security Tools

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Headers Check](https://securityheaders.com/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

### Crypto Resources

- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
- [snarkjs Documentation](https://github.com/iden3/snarkjs)
- [Zcash Protocol](https://z.cash/technology/)

---

## 📝 Changelog

### 2025-12-04 - Initial Security Implementation
- ✅ Security headers middleware
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ Environment validation
- ✅ XSS prevention
- ✅ Security documentation

### Future Enhancements
- [ ] Redis-based rate limiting
- [ ] Multi-party trusted setup
- [ ] Automated security scanning
- [ ] Bug bounty program
- [ ] Security audit (third-party)

---

## ⚖️ Responsible Disclosure

We appreciate security researchers who:
- ✅ Report vulnerabilities privately
- ✅ Give us time to fix issues
- ✅ Don't exploit vulnerabilities
- ✅ Don't access/modify user data

**Recognition:**
We maintain a Hall of Fame for security researchers who responsibly disclose vulnerabilities.

---

**Last Updated:** 2025-12-04  
**Version:** 1.0  
**Status:** Active

For questions: Open an issue on GitHub or contact the maintainers.


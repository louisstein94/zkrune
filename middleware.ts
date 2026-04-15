import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// =============================================================================
// Rate limiting (Day 21, P4-01)
// =============================================================================
//
// In-memory limiter. This is a best-effort defense layer that works on a
// single-instance deploy; on multi-instance serverless (Vercel) each instance
// has its own map, so the effective limit is MAX_REQUESTS_PER_WINDOW * N
// instances. The long-term plan is to move to Upstash Redis (see TODO below),
// but until then we at least:
//
// 1. Prefer the platform-provided client IP (x-real-ip / request.ip) over the
//    trivially spoofable first entry of x-forwarded-for.
// 2. Cap the map at RATE_LIMIT_MAX_KEYS so a flood of distinct "IPs"
//    (spoofed or NATed) cannot leak unbounded memory.
// 3. Sweep expired entries periodically (every ~RATE_LIMIT_WINDOW).
//
// TODO(P4-01c): swap this for @upstash/ratelimit + @upstash/redis when a
// managed Redis is provisioned. Gate behind an env var so local dev keeps
// using the in-memory map.

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;
const RATE_LIMIT_MAX_KEYS = 10_000;

const rateLimit = new Map<string, { count: number; resetTime: number }>();
let lastSweep = Date.now();

function sweepExpired(now: number) {
  // Drop expired entries in bulk every RATE_LIMIT_WINDOW so the map cannot
  // grow monotonically when keys never repeat.
  if (now - lastSweep < RATE_LIMIT_WINDOW) return;
  lastSweep = now;
  for (const [k, v] of rateLimit) {
    if (now > v.resetTime) rateLimit.delete(k);
  }
  // If still over the cap (pathological spam), drop oldest entries until
  // back under the limit. Iteration order in a Map is insertion order, so
  // the first entry is always the oldest remaining one.
  while (rateLimit.size > RATE_LIMIT_MAX_KEYS) {
    const oldest = rateLimit.keys().next().value;
    if (oldest === undefined) break;
    rateLimit.delete(oldest);
  }
}

function getClientIp(req: NextRequest): string {
  // Vercel sets x-real-ip to the connecting IP. Other platforms may use
  // cf-connecting-ip (Cloudflare) or x-vercel-forwarded-for. Prefer those
  // over x-forwarded-for, which any client can set.
  const candidates = [
    req.headers.get('x-real-ip'),
    req.headers.get('cf-connecting-ip'),
    req.headers.get('x-vercel-forwarded-for'),
    // Last resort: use the *left-most* x-forwarded-for only when the
    // platform is expected to overwrite it (still spoofable on bare Node).
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
  ];
  for (const c of candidates) {
    if (c && c.length > 0) return c;
  }
  return 'anonymous';
}

function getRateLimitKey(req: NextRequest): string {
  return `ratelimit:${getClientIp(req)}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  sweepExpired(now);

  const record = rateLimit.get(key);
  if (record && now > record.resetTime) {
    rateLimit.delete(key);
  }

  const current = rateLimit.get(key) ?? { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  rateLimit.set(key, current);

  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - current.count };
}

// =============================================================================
// Content Security Policy (Day 22, P4-02 + A21)
// =============================================================================
//
// Next.js App Router requires any inline script to be authorized either via
// a nonce or via a hash. We generate a per-request nonce, expose it through
// a request header so Server Components can read it, and emit a nonce-based
// CSP that no longer needs `unsafe-inline` for scripts.
//
// snarkjs still requires `unsafe-eval` for its WASM loader; there is no
// workaround at the CSP layer.

function generateNonce(): string {
  // 128-bit nonce, base64 encoded — matches what Next.js recommends.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

const EMBED_ALLOWED_PARENTS = (
  process.env.EMBED_ALLOWED_PARENTS ??
    'https://zkrune.com https://www.zkrune.com'
)
  .split(/\s+/)
  .filter(Boolean);

function buildDefaultCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // Nonce for inline scripts + 'strict-dynamic' so Next.js's hydration
    // script can load downstream chunks. unsafe-eval remains for snarkjs.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`,
    "worker-src 'self' blob:", // snarkjs creates Web Workers from blob URLs
    // Tailwind injects inline <style> at build time; keep unsafe-inline on
    // style-src only — it is substantially less risky than on script-src.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.helius-rpc.com https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://mainnet.lightwalletd.com:9067 https://*.vercel.app",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function buildEmbedCsp(nonce: string): string {
  // A21: no more `frame-ancestors *`. Only documented parent origins may
  // embed the widget. Override with EMBED_ALLOWED_PARENTS for staging.
  const parents = EMBED_ALLOWED_PARENTS.length > 0
    ? EMBED_ALLOWED_PARENTS.join(' ')
    : "'none'";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://cdn.jsdelivr.net`,
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://zkrune.com https://www.zkrune.com https://*.helius-rpc.com https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://mainnet.lightwalletd.com:9067 https://*.vercel.app",
    `frame-ancestors ${parents}`,
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

// Headers that are always safe (do not depend on CSP / framing).
const baseSecurityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': ['camera=()', 'microphone=()', 'geolocation=()', 'interest-cohort=()'].join(', '),
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};

// =============================================================================
// Middleware entrypoint
// =============================================================================

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isActions = pathname.startsWith('/api/actions/');
  const isEmbed = pathname.startsWith('/widget/embed');
  const isApi = pathname.startsWith('/api/');

  // Rate limit every API route, including /api/actions, to prevent RPC
  // proxy abuse. A22: actions routes also get base security headers.
  const shouldRateLimit = isApi;

  // Per-request nonce for CSP script-src (P4-02).
  const nonce = generateNonce();

  // Forward the nonce to downstream Server Components via a request header
  // so they can stamp it on any <Script> / <script> tag. Reading side:
  // `import { headers } from 'next/headers'; headers().get('x-nonce')`.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Apply base security headers to every response, including /api/actions.
  for (const [k, v] of Object.entries(baseSecurityHeaders)) {
    response.headers.set(k, v);
  }

  if (isActions) {
    // Actions routes do not need CSP/X-Frame-Options (they are JSON
    // endpoints hit by wallets), but they DO benefit from base headers.
    // CORS is handled by the route itself.
  } else if (isEmbed) {
    response.headers.set('Content-Security-Policy', buildEmbedCsp(nonce));
    // Embeds must be frame-able by the allow-list, so no X-Frame-Options.
  } else {
    response.headers.set('Content-Security-Policy', buildDefaultCsp(nonce));
    response.headers.set('X-Frame-Options', 'DENY');
  }

  if (shouldRateLimit) {
    const rateLimitKey = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());

    if (!allowed) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Retry-After': '60',
        ...baseSecurityHeaders,
      };
      // 429 response still respects the same CSP regime for the path.
      if (isEmbed) {
        headers['Content-Security-Policy'] = buildEmbedCsp(nonce);
      } else if (!isActions) {
        headers['Content-Security-Policy'] = buildDefaultCsp(nonce);
        headers['X-Frame-Options'] = 'DENY';
      }
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        { status: 429, headers },
      );
    }
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|wasm|zkey|json)$).*)',
  ],
};

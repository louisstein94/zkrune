// Ceremony admin authorization
//
// Ceremony endpoints (POST /api/ceremony, POST /api/ceremony/sync,
// POST /api/ceremony/zkey) allow privileged operations like inserting new
// contributions, wiping the DB, and uploading arbitrary zkey files. They
// MUST be gated by a secret admin token — never exposed publicly.
//
// Set CEREMONY_ADMIN_TOKEN to a long random value (32+ chars) in the server
// environment. Requests must include:
//
//     Authorization: Bearer <token>
//
// using constant-time comparison to avoid timing leaks.

import crypto from 'crypto';

/**
 * Extracts the bearer token from an Authorization header, if present.
 */
function extractBearer(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Returns true when the request carries a valid ceremony admin token.
 * Returns false on any failure: no env var, missing header, wrong length,
 * or mismatched value. The comparison is constant-time to avoid revealing
 * partial matches.
 *
 * Behavior:
 * - If CEREMONY_ADMIN_TOKEN is unset, this always returns false. The ceremony
 *   routes should then 503-short-circuit with a clear "not configured" error.
 */
export function isCeremonyAdmin(request: Request): boolean {
  const expected = process.env.CEREMONY_ADMIN_TOKEN;
  if (!expected || expected.length < 16) return false;

  const provided = extractBearer(request.headers.get('authorization'));
  if (!provided) return false;

  const providedBuf = Buffer.from(provided, 'utf-8');
  const expectedBuf = Buffer.from(expected, 'utf-8');
  if (providedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Returns true when the server has a ceremony admin token configured at all.
 * Use this to distinguish between "unauthorized" (401) and "not configured"
 * (503) responses.
 */
export function isCeremonyAuthConfigured(): boolean {
  const token = process.env.CEREMONY_ADMIN_TOKEN;
  return Boolean(token && token.length >= 16);
}

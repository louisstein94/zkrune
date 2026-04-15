/**
 * Server-side Solana wallet signature verification
 *
 * Clients sign a canonical message that binds the action AND its critical
 * payload fields, preventing signature reuse across different requests:
 *
 *   zkrune:<action>:<wallet>:<field1=val1>&<field2=val2>:<timestampMs>
 *
 * Fields are sorted alphabetically so the canonical form is deterministic.
 *
 * Replay protection (Day 24):
 * - A6a: every successfully verified signature is recorded for
 *   MAX_AGE_MS + grace so a replay within the freshness window is
 *   rejected with "signature already used".
 * - A6b: timestamps more than FUTURE_SKEW_MS in the future are rejected
 *   so a client cannot stretch the freshness window by forward-dating.
 */

import nacl from 'tweetnacl';
import bs58 from 'bs58';

const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const FUTURE_SKEW_MS = 30 * 1000; // 30 seconds tolerance for clock drift

export interface AuthPayload {
  wallet: string;
  signedMessage: string;
  signature: string; // base58-encoded Ed25519 signature
}

/** Build the canonical signed message string (same logic on client and server). */
export function buildCanonicalMessage(
  action: string,
  wallet: string,
  fields: Record<string, string | number>,
  timestamp: number,
): string {
  const sorted = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `zkrune:${action}:${wallet}:${sorted}:${timestamp}`;
}

/** Raw Ed25519 signature check. */
export function verifyWalletSignature(payload: AuthPayload): boolean {
  try {
    const { wallet, signedMessage, signature } = payload;
    const publicKeyBytes = bs58.decode(wallet);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(signedMessage);
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

// A6a: in-memory store of already-accepted signatures. Keys expire after
// MAX_AGE_MS + a grace margin so any payload that is still inside the
// freshness window cannot be replayed.
//
// Note: in a multi-instance serverless environment this per-instance map
// only stops replay against the SAME instance. Full cross-instance replay
// protection requires a shared store (Redis). We document this limitation
// in SECURITY.md (Phase 4 plan) and move to Upstash alongside the rate
// limiter.
const REPLAY_TTL_MS = MAX_AGE_MS + 30 * 1000;
const REPLAY_MAX_KEYS = 10_000;
const usedSignatures = new Map<string, number>();
let replaySweepAt = Date.now();

function sweepUsedSignatures(now: number) {
  if (now - replaySweepAt < MAX_AGE_MS) return;
  replaySweepAt = now;
  for (const [k, expires] of usedSignatures) {
    if (now > expires) usedSignatures.delete(k);
  }
  while (usedSignatures.size > REPLAY_MAX_KEYS) {
    const oldest = usedSignatures.keys().next().value;
    if (oldest === undefined) break;
    usedSignatures.delete(oldest);
  }
}

/**
 * Records a signature as used. Returns `true` when the signature was newly
 * accepted, `false` when it was already seen (replay).
 */
function markSignatureUsed(signature: string, now: number): boolean {
  sweepUsedSignatures(now);
  const existing = usedSignatures.get(signature);
  if (existing && existing > now) return false;
  usedSignatures.set(signature, now + REPLAY_TTL_MS);
  return true;
}

/**
 * Full auth check:
 * 1. Valid Ed25519 signature over signedMessage
 * 2. Timestamp is fresh (< 5 min)
 * 3. action matches
 * 4. All expectedFields are present in the signed message with correct values
 */
export function verifyAuth(
  payload: AuthPayload,
  expectedAction: string,
  expectedFields: Record<string, string | number>,
): boolean {
  if (!verifyWalletSignature(payload)) return false;

  // Parse timestamp from the last colon-separated segment
  const parts = payload.signedMessage.split(':');
  if (parts.length < 5 || parts[0] !== 'zkrune') return false;

  const ts = parseInt(parts[parts.length - 1], 10);
  if (isNaN(ts)) return false;

  const now = Date.now();
  // A6b: reject future timestamps beyond a small clock-skew tolerance.
  // Without this, a client could set ts = now + MAX_AGE_MS - 1 and keep
  // the signature valid for ~2 * MAX_AGE_MS.
  if (ts > now + FUTURE_SKEW_MS) return false;
  // Reject stale signatures as before.
  if (now - ts > MAX_AGE_MS) return false;

  // Verify action
  if (parts[1] !== expectedAction) return false;

  // Verify wallet is bound in message
  if (parts[2] !== payload.wallet) return false;

  // Verify every expected field is present and matches
  const canonical = buildCanonicalMessage(expectedAction, payload.wallet, expectedFields, ts);
  if (canonical !== payload.signedMessage) return false;

  // A6a: single-use signature enforcement. Reject a replay of a signature
  // that has already been accepted within the freshness window.
  if (!markSignatureUsed(payload.signature, now)) return false;

  return true;
}

/**
 * Test hook: clears the in-memory replay store. Exposed only for tests;
 * never call from production code paths.
 */
export function __resetReplayStore(): void {
  usedSignatures.clear();
  replaySweepAt = Date.now();
}

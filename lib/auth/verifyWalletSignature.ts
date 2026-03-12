/**
 * Server-side Solana wallet signature verification
 *
 * Clients sign a canonical message that binds the action AND its critical
 * payload fields, preventing signature reuse across different requests:
 *
 *   zkrune:<action>:<wallet>:<field1=val1>&<field2=val2>:<timestampMs>
 *
 * Fields are sorted alphabetically so the canonical form is deterministic.
 * Replay protection: reject if timestamp is older than MAX_AGE_MS.
 */

import nacl from 'tweetnacl';
import bs58 from 'bs58';

const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

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
  if (isNaN(ts) || Date.now() - ts > MAX_AGE_MS) return false;

  // Verify action
  if (parts[1] !== expectedAction) return false;

  // Verify wallet is bound in message
  if (parts[2] !== payload.wallet) return false;

  // Verify every expected field is present and matches
  const canonical = buildCanonicalMessage(expectedAction, payload.wallet, expectedFields, ts);
  if (canonical !== payload.signedMessage) return false;

  return true;
}

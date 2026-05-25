/**
 * Wallet-ownership + Telegram-binding checks for whale verification.
 *
 * The bot verifies three things in addition to the ZK proof itself:
 *
 *   1. Ed25519 signature over a canonical message — proves the submitter
 *      actually controls the wallet whose Merkle path was used.
 *   2. The signed message binds the proof's nullifier AND the Telegram
 *      user_id, so a leaked signature cannot be replayed from a different
 *      Telegram account or against a different proof.
 *   3. (Optional) Telegram WebApp `initData` HMAC — proves the payload was
 *      produced inside the bot's Mini App rather than crafted directly.
 *
 * Canonical message format (matches lib/auth/verifyWalletSignature.ts in
 * the main app):
 *
 *   zkrune:<action>:<wallet>:<k=v&k=v...>:<timestampMs>
 *
 * Fields are sorted alphabetically.
 */

import nacl from "tweetnacl";
import bs58 from "bs58";
import crypto from "crypto";

const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const FUTURE_SKEW_MS = 30 * 1000; // 30 s clock-drift tolerance

export interface OwnershipPayload {
  wallet: string;
  signature: string;       // base58 Ed25519 signature
  signedMessage: string;
}

export function buildCanonicalMessage(
  action: string,
  wallet: string,
  fields: Record<string, string | number>,
  timestamp: number,
): string {
  const sorted = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `zkrune:${action}:${wallet}:${sorted}:${timestamp}`;
}

export function verifyWalletSignature(payload: OwnershipPayload): boolean {
  try {
    const publicKeyBytes = bs58.decode(payload.wallet);
    const signatureBytes = bs58.decode(payload.signature);
    const messageBytes = new TextEncoder().encode(payload.signedMessage);
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );
  } catch {
    return false;
  }
}

/**
 * Validate a wallet-ownership payload AND its binding to the expected
 * action/fields. Returns `{ valid: true }` on success or a reason string
 * suitable for showing to the user.
 */
export function verifyOwnership(
  payload: OwnershipPayload,
  expectedAction: string,
  expectedFields: Record<string, string | number>,
): { valid: boolean; reason?: string } {
  if (!payload.wallet || !payload.signature || !payload.signedMessage) {
    return { valid: false, reason: "Missing ownership signature." };
  }

  if (!verifyWalletSignature(payload)) {
    return { valid: false, reason: "Wallet signature is invalid." };
  }

  const parts = payload.signedMessage.split(":");
  if (parts.length < 5 || parts[0] !== "zkrune") {
    return { valid: false, reason: "Signed message has unexpected format." };
  }

  const ts = parseInt(parts[parts.length - 1], 10);
  if (isNaN(ts)) {
    return { valid: false, reason: "Signed message timestamp is invalid." };
  }

  const now = Date.now();
  if (ts > now + FUTURE_SKEW_MS) {
    return { valid: false, reason: "Signed message is from the future." };
  }
  if (now - ts > MAX_AGE_MS) {
    return {
      valid: false,
      reason: "Signed message has expired — generate a fresh proof.",
    };
  }

  if (parts[1] !== expectedAction) {
    return {
      valid: false,
      reason: `Signed message action mismatch (expected ${expectedAction}).`,
    };
  }

  if (parts[2] !== payload.wallet) {
    return { valid: false, reason: "Wallet in signed message does not match." };
  }

  const canonical = buildCanonicalMessage(
    expectedAction,
    payload.wallet,
    expectedFields,
    ts,
  );
  if (canonical !== payload.signedMessage) {
    return {
      valid: false,
      reason: "Signed message does not bind the expected fields.",
    };
  }

  return { valid: true };
}

// ── Telegram initData HMAC verification ─────────────────────────────────────
//
// Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
//
// Given the raw `initData` query-string passed by the WebApp SDK, derive a
// secret key as HMAC_SHA256("WebAppData", botToken) and check that the
// `hash` parameter matches HMAC_SHA256(secret, data_check_string), where
// data_check_string is the remaining fields sorted alphabetically and
// joined by '\n' as `<k>=<v>`.
//
// Returns the parsed `user.id` on success; null on failure.

export function verifyTelegramInitData(
  initData: string,
  botToken: string,
): { userId: number } | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;
    params.delete("hash");

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();
    const computed = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (computed !== hash) return null;

    // Optional but recommended: reject ancient initData
    const authDate = parseInt(params.get("auth_date") || "0", 10);
    if (!authDate) return null;
    const ageSec = Math.floor(Date.now() / 1000) - authDate;
    if (ageSec > 24 * 60 * 60) return null; // 24h max

    const userJson = params.get("user");
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    if (typeof user.id !== "number") return null;
    return { userId: user.id };
  } catch {
    return null;
  }
}

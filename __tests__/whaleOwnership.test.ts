/**
 * Whale-chat ownership / Telegram-binding tests for the verification bot.
 *
 * These tests exercise the same helper the bot wires into handleProof in
 * packages/zkrune-telegram-bot/src/index.ts. The threat being defended:
 * a stranger pastes a known holder's public address into the verifier and
 * passes the gate, because the snapshot Merkle path is public and the ZK
 * proof on its own only asserts inclusion.
 */

import { describe, it, expect } from 'vitest';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import crypto from 'crypto';

import {
  buildCanonicalMessage,
  verifyOwnership,
  verifyTelegramInitData,
} from '../packages/zkrune-telegram-bot/src/ownership';

function makeWallet() {
  const kp = nacl.sign.keyPair();
  return {
    wallet: bs58.encode(kp.publicKey),
    sign(msg: string) {
      const sigBytes = nacl.sign.detached(new TextEncoder().encode(msg), kp.secretKey);
      return bs58.encode(sigBytes);
    },
  };
}

describe('verifyOwnership', () => {
  const nullifier = '12345678901234567890';
  const tgUserId = 4242;

  it('accepts a fresh, well-formed signature that binds nullifier + tg_user_id', () => {
    const w = makeWallet();
    const ts = Date.now();
    const msg = buildCanonicalMessage(
      'whale-chat',
      w.wallet,
      { nullifier, tg_user_id: tgUserId },
      ts,
    );
    const result = verifyOwnership(
      { wallet: w.wallet, signature: w.sign(msg), signedMessage: msg },
      'whale-chat',
      { nullifier, tg_user_id: tgUserId },
    );
    expect(result.valid).toBe(true);
  });

  it('rejects an attacker who signs with their own wallet but claims the victim address', () => {
    // This models the copy-paste attack: Bob knows Alice's public address
    // (from an explorer) and tries to submit a proof for it. Bob can sign
    // with his OWN wallet but the canonical message embeds the signing
    // wallet — so the signature is valid for Bob, not for Alice.
    const alice = makeWallet();
    const bob = makeWallet();
    const ts = Date.now();

    // Bob crafts a message claiming Alice's wallet but signs with his key.
    const msg = buildCanonicalMessage(
      'whale-chat',
      alice.wallet,
      { nullifier, tg_user_id: tgUserId },
      ts,
    );
    const bobSig = bob.sign(msg);

    const result = verifyOwnership(
      { wallet: alice.wallet, signature: bobSig, signedMessage: msg },
      'whale-chat',
      { nullifier, tg_user_id: tgUserId },
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/signature is invalid/i);
  });

  it("rejects a signature that doesn't bind the submitter's Telegram user_id", () => {
    // Alice signs with tg_user_id = 1111, Bob (4242) forwards her exported
    // proof from his own account. handleProof will pass tg_user_id = 4242
    // as the expected field, so the canonical mismatch trips.
    const alice = makeWallet();
    const ts = Date.now();
    const msg = buildCanonicalMessage(
      'whale-chat',
      alice.wallet,
      { nullifier, tg_user_id: 1111 },
      ts,
    );
    const result = verifyOwnership(
      { wallet: alice.wallet, signature: alice.sign(msg), signedMessage: msg },
      'whale-chat',
      { nullifier, tg_user_id: 4242 },
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/does not bind the expected fields/i);
  });

  it('rejects when the signed nullifier differs from the proof nullifier', () => {
    // Alice signs for nullifier A, then tries to attach the signature to a
    // proof whose nullifier is B (e.g. swapping in a stronger proof).
    const alice = makeWallet();
    const ts = Date.now();
    const msg = buildCanonicalMessage(
      'whale-chat',
      alice.wallet,
      { nullifier: 'A', tg_user_id: tgUserId },
      ts,
    );
    const result = verifyOwnership(
      { wallet: alice.wallet, signature: alice.sign(msg), signedMessage: msg },
      'whale-chat',
      { nullifier: 'B', tg_user_id: tgUserId },
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/does not bind the expected fields/i);
  });

  it('rejects a stale signature (older than the freshness window)', () => {
    const w = makeWallet();
    const oldTs = Date.now() - 10 * 60 * 1000; // 10 min ago
    const msg = buildCanonicalMessage(
      'whale-chat',
      w.wallet,
      { nullifier, tg_user_id: tgUserId },
      oldTs,
    );
    const result = verifyOwnership(
      { wallet: w.wallet, signature: w.sign(msg), signedMessage: msg },
      'whale-chat',
      { nullifier, tg_user_id: tgUserId },
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/expired/i);
  });

  it('rejects a signature dated far in the future', () => {
    const w = makeWallet();
    const futureTs = Date.now() + 10 * 60 * 1000;
    const msg = buildCanonicalMessage(
      'whale-chat',
      w.wallet,
      { nullifier, tg_user_id: tgUserId },
      futureTs,
    );
    const result = verifyOwnership(
      { wallet: w.wallet, signature: w.sign(msg), signedMessage: msg },
      'whale-chat',
      { nullifier, tg_user_id: tgUserId },
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/future/i);
  });

  it('rejects when ownership fields are missing entirely', () => {
    const result = verifyOwnership(
      { wallet: '', signature: '', signedMessage: '' },
      'whale-chat',
      { nullifier, tg_user_id: tgUserId },
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/missing/i);
  });
});

// ── Telegram WebApp initData HMAC ────────────────────────────────────────────

function buildSignedInitData(
  botToken: string,
  fields: Record<string, string>,
): string {
  const dataCheckString = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  const params = new URLSearchParams({ ...fields, hash });
  return params.toString();
}

describe('verifyTelegramInitData', () => {
  const botToken = '123:ABC-test-token';

  it('accepts initData signed with the correct bot token', () => {
    const fields = {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 7777, first_name: 'Test' }),
      query_id: 'q1',
    };
    const initData = buildSignedInitData(botToken, fields);
    const res = verifyTelegramInitData(initData, botToken);
    expect(res?.userId).toBe(7777);
  });

  it('rejects initData signed with a different bot token', () => {
    const fields = {
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 7777 }),
    };
    const initData = buildSignedInitData('attacker-token', fields);
    expect(verifyTelegramInitData(initData, botToken)).toBeNull();
  });

  it('rejects initData older than 24h', () => {
    const fields = {
      auth_date: String(Math.floor(Date.now() / 1000) - 25 * 60 * 60),
      user: JSON.stringify({ id: 7777 }),
    };
    const initData = buildSignedInitData(botToken, fields);
    expect(verifyTelegramInitData(initData, botToken)).toBeNull();
  });
});

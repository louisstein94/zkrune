import { describe, it, expect, beforeEach } from 'vitest';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import {
  buildCanonicalMessage,
  verifyWalletSignature,
  verifyAuth,
  __resetReplayStore,
} from '../lib/auth/verifyWalletSignature';

function createTestKeypair() {
  const keypair = nacl.sign.keyPair();
  return {
    publicKey: bs58.encode(keypair.publicKey),
    secretKey: keypair.secretKey,
  };
}

function signMessage(message: string, secretKey: Uint8Array): string {
  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, secretKey);
  return bs58.encode(signature);
}

describe('buildCanonicalMessage', () => {
  it('builds correct format', () => {
    const msg = buildCanonicalMessage('stake', 'WALLET123', { amount: '100', lockPeriodDays: '30' }, 1700000000000);
    expect(msg).toBe('zkrune:stake:WALLET123:amount=100&lockPeriodDays=30:1700000000000');
  });

  it('sorts fields alphabetically', () => {
    const msg = buildCanonicalMessage('test', 'W', { zebra: '1', alpha: '2', mid: '3' }, 0);
    expect(msg).toBe('zkrune:test:W:alpha=2&mid=3&zebra=1:0');
  });

  it('handles single field', () => {
    const msg = buildCanonicalMessage('claim', 'W', { positionId: 'abc' }, 100);
    expect(msg).toBe('zkrune:claim:W:positionId=abc:100');
  });
});

describe('verifyWalletSignature', () => {
  it('verifies valid Ed25519 signature', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const message = 'test message';
    const signature = signMessage(message, secretKey);

    expect(
      verifyWalletSignature({ wallet: publicKey, signedMessage: message, signature }),
    ).toBe(true);
  });

  it('rejects tampered message', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const signature = signMessage('original', secretKey);

    expect(
      verifyWalletSignature({ wallet: publicKey, signedMessage: 'tampered', signature }),
    ).toBe(false);
  });

  it('rejects wrong wallet', () => {
    const kp1 = createTestKeypair();
    const kp2 = createTestKeypair();
    const signature = signMessage('msg', kp1.secretKey);

    expect(
      verifyWalletSignature({ wallet: kp2.publicKey, signedMessage: 'msg', signature }),
    ).toBe(false);
  });

  it('rejects invalid base58', () => {
    expect(
      verifyWalletSignature({ wallet: '!!!', signedMessage: 'x', signature: '!!!' }),
    ).toBe(false);
  });
});

describe('verifyAuth', () => {
  beforeEach(() => {
    __resetReplayStore();
  });

  it('accepts valid auth with fresh timestamp', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const ts = Date.now();
    const fields = { amount: '500', lockPeriodDays: '90' };
    const message = buildCanonicalMessage('stake', publicKey, fields, ts);
    const signature = signMessage(message, secretKey);

    expect(
      verifyAuth({ wallet: publicKey, signedMessage: message, signature }, 'stake', fields),
    ).toBe(true);
  });

  it('rejects expired timestamp', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const ts = Date.now() - 6 * 60 * 1000; // 6 minutes ago
    const fields = { amount: '500' };
    const message = buildCanonicalMessage('stake', publicKey, fields, ts);
    const signature = signMessage(message, secretKey);

    expect(
      verifyAuth({ wallet: publicKey, signedMessage: message, signature }, 'stake', fields),
    ).toBe(false);
  });

  it('rejects wrong action', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const ts = Date.now();
    const fields = { positionId: 'abc' };
    const message = buildCanonicalMessage('claim', publicKey, fields, ts);
    const signature = signMessage(message, secretKey);

    expect(
      verifyAuth({ wallet: publicKey, signedMessage: message, signature }, 'unstake', fields),
    ).toBe(false);
  });

  it('rejects tampered field values', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const ts = Date.now();
    const fields = { amount: '500' };
    const message = buildCanonicalMessage('stake', publicKey, fields, ts);
    const signature = signMessage(message, secretKey);

    expect(
      verifyAuth(
        { wallet: publicKey, signedMessage: message, signature },
        'stake',
        { amount: '9999' },
      ),
    ).toBe(false);
  });

  it('rejects signature from different wallet', () => {
    const kp1 = createTestKeypair();
    const kp2 = createTestKeypair();
    const ts = Date.now();
    const fields = { amount: '100' };
    const message = buildCanonicalMessage('stake', kp1.publicKey, fields, ts);
    const signature = signMessage(message, kp2.secretKey);

    expect(
      verifyAuth({ wallet: kp1.publicKey, signedMessage: message, signature }, 'stake', fields),
    ).toBe(false);
  });

  // A6b: future timestamps must be rejected beyond the clock-skew tolerance.
  it('rejects timestamps too far in the future', () => {
    const { publicKey, secretKey } = createTestKeypair();
    // 2 minutes in the future — well beyond the 30s skew tolerance
    const ts = Date.now() + 2 * 60 * 1000;
    const fields = { amount: '100' };
    const message = buildCanonicalMessage('stake', publicKey, fields, ts);
    const signature = signMessage(message, secretKey);

    expect(
      verifyAuth({ wallet: publicKey, signedMessage: message, signature }, 'stake', fields),
    ).toBe(false);
  });

  // A6b: small clock drift (within FUTURE_SKEW_MS) is still accepted.
  it('accepts timestamps within clock-skew tolerance', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const ts = Date.now() + 10 * 1000; // +10s, within the 30s tolerance
    const fields = { amount: '100' };
    const message = buildCanonicalMessage('stake', publicKey, fields, ts);
    const signature = signMessage(message, secretKey);

    expect(
      verifyAuth({ wallet: publicKey, signedMessage: message, signature }, 'stake', fields),
    ).toBe(true);
  });

  // A6a: first verification succeeds, second with same signature fails.
  it('rejects replay of a previously accepted signature', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const ts = Date.now();
    const fields = { amount: '500' };
    const message = buildCanonicalMessage('stake', publicKey, fields, ts);
    const signature = signMessage(message, secretKey);

    const payload = { wallet: publicKey, signedMessage: message, signature };

    expect(verifyAuth(payload, 'stake', fields)).toBe(true);
    // Second call with the identical payload must be rejected as a replay.
    expect(verifyAuth(payload, 'stake', fields)).toBe(false);
  });

  // A6a: different signatures from the same wallet are both accepted.
  it('accepts two distinct signatures from the same wallet', () => {
    const { publicKey, secretKey } = createTestKeypair();
    const fields1 = { amount: '100' };
    const fields2 = { amount: '200' };
    const msg1 = buildCanonicalMessage('stake', publicKey, fields1, Date.now());
    const msg2 = buildCanonicalMessage('stake', publicKey, fields2, Date.now());
    const sig1 = signMessage(msg1, secretKey);
    const sig2 = signMessage(msg2, secretKey);

    expect(
      verifyAuth({ wallet: publicKey, signedMessage: msg1, signature: sig1 }, 'stake', fields1),
    ).toBe(true);
    expect(
      verifyAuth({ wallet: publicKey, signedMessage: msg2, signature: sig2 }, 'stake', fields2),
    ).toBe(true);
  });
});

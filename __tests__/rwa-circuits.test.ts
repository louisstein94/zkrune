import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';

// Soundness and behaviour tests for the RWA eligibility circuits.
//
// Each circuit proves an issuer attested something about the holder, without
// revealing who the holder is. The attested values are hashed into the Merkle
// leaf, so the attack these tests care about most is a holder who takes a real
// credential and tries to improve it — a higher tier, a later expiry, a larger
// position, a different jurisdiction. Every one of those changes the leaf and
// has to break the path.

const CIRCUITS_DIR = path.join(__dirname, '..', 'circuits');

let poseidon: any, F: any;
const p1 = (a: bigint) => F.toObject(poseidon([a]));
const p2 = (a: bigint, b: bigint) => F.toObject(poseidon([a, b]));
const p3 = (a: bigint, b: bigint, c: bigint) => F.toObject(poseidon([a, b, c]));

beforeAll(async () => {
  const { buildPoseidon } = await import('circomlibjs');
  poseidon = await buildPoseidon();
  F = poseidon.F;
});

/** Merkle tree holding a single leaf, padded with zero hashes. */
function pathFor(leaf: bigint, depth: number) {
  const zeros: bigint[] = [0n];
  for (let i = 1; i <= depth; i++) zeros.push(p2(zeros[i - 1], zeros[i - 1]));
  let cur = leaf;
  const pathElements: string[] = [];
  const pathIndices: string[] = [];
  for (let i = 0; i < depth; i++) {
    pathElements.push(zeros[i].toString());
    pathIndices.push('0');
    cur = p2(cur, zeros[i]);
  }
  return { root: cur.toString(), pathElements, pathIndices };
}

async function prove(circuit: string, input: Record<string, unknown>) {
  const snarkjs = (await import('snarkjs')) as any;
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    path.join(CIRCUITS_DIR, circuit, 'circuit_js', 'circuit.wasm'),
    path.join(CIRCUITS_DIR, circuit, 'circuit_test.zkey'),
  );
  const vkey = JSON.parse(
    fs.readFileSync(path.join(CIRCUITS_DIR, circuit, 'test_vkey.json'), 'utf-8'),
  );
  const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  return { valid, publicSignals };
}

const NOW = 1787000000;      // mid-2026
const FUTURE = '4102444800'; // 2100
const CTX = '77';

// ────────────────────────────────────────────────────────────────────
describe('accredited-investor', () => {
  const SECRET = 918273645n;
  const TIER = 2n; // qualified purchaser

  function issued(tier = TIER, validUntil = BigInt(FUTURE)) {
    return pathFor(p3(SECRET, tier, validUntil), 20);
  }

  it('VALID: a qualified purchaser clears a gate asking for accredited', async () => {
    const t = issued();
    const { valid, publicSignals } = await prove('accredited-investor', {
      credentialSecret: SECRET.toString(),
      accreditationTier: TIER.toString(),
      validUntil: FUTURE,
      pathElements: t.pathElements,
      pathIndices: t.pathIndices,
      issuerRoot: t.root,
      minimumTier: '1',
      currentTime: String(NOW),
      contextId: CTX,
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 60000);

  it('REJECTS: a tier below what the venue requires', async () => {
    const t = issued(1n);
    await expect(
      prove('accredited-investor', {
        credentialSecret: SECRET.toString(),
        accreditationTier: '1',
        validUntil: FUTURE,
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumTier: '2',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: claiming a higher tier than the issuer attested', async () => {
    // The tier is hashed into the leaf, so raising it breaks the path.
    const t = issued(1n);
    await expect(
      prove('accredited-investor', {
        credentialSecret: SECRET.toString(),
        accreditationTier: '2',
        validUntil: FUTURE,
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumTier: '2',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: an expired credential', async () => {
    const expired = 1700000000n;
    const t = issued(TIER, expired);
    await expect(
      prove('accredited-investor', {
        credentialSecret: SECRET.toString(),
        accreditationTier: TIER.toString(),
        validUntil: expired.toString(),
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumTier: '1',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: a holder who was never issued a credential', async () => {
    const t = issued();
    await expect(
      prove('accredited-investor', {
        credentialSecret: '5555',
        accreditationTier: TIER.toString(),
        validUntil: FUTURE,
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumTier: '1',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('nullifier is stable per context and unlinkable across contexts', async () => {
    const t = issued();
    const base = {
      credentialSecret: SECRET.toString(),
      accreditationTier: TIER.toString(),
      validUntil: FUTURE,
      pathElements: t.pathElements,
      pathIndices: t.pathIndices,
      issuerRoot: t.root,
      minimumTier: '1',
      currentTime: String(NOW),
    };
    const a = await prove('accredited-investor', { ...base, contextId: '77' });
    const b = await prove('accredited-investor', { ...base, contextId: '77' });
    const c = await prove('accredited-investor', { ...base, contextId: '88' });
    expect(a.publicSignals[1]).toBe(b.publicSignals[1]);
    expect(a.publicSignals[1]).not.toBe(c.publicSignals[1]);
  }, 120000);
});

// ────────────────────────────────────────────────────────────────────
describe('jurisdiction-proof', () => {
  const SECRET = 5647382910n;
  const CODE = 276n; // ISO 3166-1 numeric

  function setup(attested = CODE, allowed = CODE, validUntil = BigInt(FUTURE)) {
    const issuer = pathFor(p3(SECRET, attested, validUntil), 20);
    const list = pathFor(p1(allowed), 8);
    return { issuer, list };
  }

  it('VALID: attested jurisdiction is on the allow list', async () => {
    const { issuer, list } = setup();
    const { valid, publicSignals } = await prove('jurisdiction-proof', {
      credentialSecret: SECRET.toString(),
      jurisdictionCode: CODE.toString(),
      validUntil: FUTURE,
      issuerPathElements: issuer.pathElements,
      issuerPathIndices: issuer.pathIndices,
      listPathElements: list.pathElements,
      listPathIndices: list.pathIndices,
      issuerRoot: issuer.root,
      allowedRoot: list.root,
      currentTime: String(NOW),
      contextId: CTX,
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 60000);

  it('REJECTS: attested jurisdiction is not on the allow list', async () => {
    const { issuer } = setup();
    const otherList = pathFor(p1(840n), 8); // venue only serves a different country
    await expect(
      prove('jurisdiction-proof', {
        credentialSecret: SECRET.toString(),
        jurisdictionCode: CODE.toString(),
        validUntil: FUTURE,
        issuerPathElements: issuer.pathElements,
        issuerPathIndices: issuer.pathIndices,
        listPathElements: otherList.pathElements,
        listPathIndices: otherList.pathIndices,
        issuerRoot: issuer.root,
        allowedRoot: otherList.root,
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: claiming an allowed jurisdiction that was not attested', async () => {
    // Attested 840, venue serves 276. Claiming 276 breaks the issuer leaf.
    const issuer = pathFor(p3(SECRET, 840n, BigInt(FUTURE)), 20);
    const list = pathFor(p1(276n), 8);
    await expect(
      prove('jurisdiction-proof', {
        credentialSecret: SECRET.toString(),
        jurisdictionCode: '276',
        validUntil: FUTURE,
        issuerPathElements: issuer.pathElements,
        issuerPathIndices: issuer.pathIndices,
        listPathElements: list.pathElements,
        listPathIndices: list.pathIndices,
        issuerRoot: issuer.root,
        allowedRoot: list.root,
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);
});

// ────────────────────────────────────────────────────────────────────
describe('lockup-proof', () => {
  const SECRET = 1122334455n;
  const AMOUNT = 500000n;

  function recorded(amount = AMOUNT, unlockTime = 1750000000n) {
    return pathFor(p3(SECRET, amount, unlockTime), 20);
  }

  it('VALID: lock-up elapsed and position meets the minimum', async () => {
    const t = recorded();
    const { valid, publicSignals } = await prove('lockup-proof', {
      credentialSecret: SECRET.toString(),
      lockedAmount: AMOUNT.toString(),
      unlockTime: '1750000000',
      pathElements: t.pathElements,
      pathIndices: t.pathIndices,
      issuerRoot: t.root,
      minimumAmount: '100000',
      currentTime: String(NOW),
      contextId: CTX,
    });
    expect(valid).toBe(true);
    expect(publicSignals[0]).toBe('1');
  }, 60000);

  it('REJECTS: the restricted period has not elapsed', async () => {
    const stillLocked = 1900000000n;
    const t = recorded(AMOUNT, stillLocked);
    await expect(
      prove('lockup-proof', {
        credentialSecret: SECRET.toString(),
        lockedAmount: AMOUNT.toString(),
        unlockTime: stillLocked.toString(),
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumAmount: '100000',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: a position below the venue minimum', async () => {
    const t = recorded(1000n);
    await expect(
      prove('lockup-proof', {
        credentialSecret: SECRET.toString(),
        lockedAmount: '1000',
        unlockTime: '1750000000',
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumAmount: '100000',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: inflating the recorded position', async () => {
    const t = recorded(1000n);
    await expect(
      prove('lockup-proof', {
        credentialSecret: SECRET.toString(),
        lockedAmount: '999999',
        unlockTime: '1750000000',
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumAmount: '100000',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);

  it('REJECTS: bringing the unlock date forward', async () => {
    const stillLocked = 1900000000n;
    const t = recorded(AMOUNT, stillLocked);
    await expect(
      prove('lockup-proof', {
        credentialSecret: SECRET.toString(),
        lockedAmount: AMOUNT.toString(),
        unlockTime: '1700000000',
        pathElements: t.pathElements,
        pathIndices: t.pathIndices,
        issuerRoot: t.root,
        minimumAmount: '100000',
        currentTime: String(NOW),
        contextId: CTX,
      }),
    ).rejects.toThrow();
  }, 60000);
});

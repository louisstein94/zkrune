import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import {
  ACCREDITATION_TIERS,
  buildCircuitInput,
  buildJurisdictionAllowlist,
  createIssuerKeypair,
  issueCredential,
  subjectCommitment,
  type IssuerKeypair,
  type JurisdictionAllowlist,
  type SignedCredential,
} from '../lib/rwa/credential';

// The rwa-eligibility gate rests on one constraint: the issuer signed this
// exact claim. Everything the circuit enforces feeds that signature, so the
// attacks worth testing are the ones where a holder takes a real credential
// and tries to improve it, or where someone tries to use a proof that was
// never meant for them.

const DIR = path.join(__dirname, '..', 'circuits', 'rwa-eligibility');
const WASM = path.join(DIR, 'circuit_js', 'circuit.wasm');
const ZKEY = path.join(DIR, 'circuit_test.zkey');
const VKEY = path.join(DIR, 'test_vkey.json');

const GERMANY = 276;
const UNITED_STATES = 840;
const JAPAN = 392;

const NOW = 1787000000;
const ISSUED_AT = NOW - 86_400;
const EXPIRES_AT = NOW + 31_536_000;

const HOLDER_SECRET = 0x5ec12345678n;
const POLICY = '42';
const NONCE = '999001';

let issuer: IssuerKeypair;
let allowlist: JurisdictionAllowlist;
let commitment: string;

beforeAll(async () => {
  issuer = await createIssuerKeypair(new Uint8Array(32).fill(7));
  allowlist = await buildJurisdictionAllowlist([GERMANY, JAPAN]);
  commitment = await subjectCommitment(HOLDER_SECRET);
}, 60000);

async function credentialFor(overrides: Partial<{
  tier: number; jurisdiction: number; issuedAt: number; expiresAt: number;
  signer: IssuerKeypair;
}> = {}): Promise<SignedCredential> {
  return issueCredential(overrides.signer ?? issuer, {
    subjectCommitment: commitment,
    accreditationTier: overrides.tier ?? ACCREDITATION_TIERS.QUALIFIED_PURCHASER,
    jurisdictionCode: overrides.jurisdiction ?? GERMANY,
    issuedAt: overrides.issuedAt ?? ISSUED_AT,
    expiresAt: overrides.expiresAt ?? EXPIRES_AT,
  });
}

async function prove(input: Record<string, unknown>) {
  const snarkjs = (await import('snarkjs')) as any;
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM, ZKEY);
  const vkey = JSON.parse(fs.readFileSync(VKEY, 'utf-8'));
  const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  return { valid, publicSignals, proof, vkey };
}

async function attempt(over: Record<string, unknown> = {}, credential?: SignedCredential) {
  const cred = credential ?? (await credentialFor());
  const base = buildCircuitInput({
    subjectSecret: HOLDER_SECRET,
    credential: cred,
    issuerPublicKey: issuer.publicKey,
    jurisdictionPath: allowlist.pathFor(cred.jurisdictionCode),
    jurisdictionRoot: allowlist.root,
    requiredTier: ACCREDITATION_TIERS.ACCREDITED,
    currentTime: NOW,
    policyId: POLICY,
    sessionNonce: NONCE,
  });
  return prove({ ...base, ...over });
}

describe('rwa-eligibility', () => {
  it('VALID: a qualified purchaser in an accepted country clears an accredited gate', async () => {
    const { valid, publicSignals } = await attempt();
    expect(valid).toBe(true);
    expect(publicSignals.length).toBeGreaterThan(0);
  }, 90000);

  it('REJECTS: a tier below what the offering requires', async () => {
    const cred = await credentialFor({ tier: ACCREDITATION_TIERS.KYC_CLEARED });
    await expect(attempt({}, cred)).rejects.toThrow();
  }, 90000);

  it('REJECTS: claiming a higher tier than the issuer signed', async () => {
    const cred = await credentialFor({ tier: ACCREDITATION_TIERS.KYC_CLEARED });
    await expect(
      attempt({ accreditationTier: String(ACCREDITATION_TIERS.QUALIFIED_PURCHASER) }, cred),
    ).rejects.toThrow();
  }, 90000);

  it('REJECTS: a country the venue does not serve', async () => {
    const cred = await credentialFor({ jurisdiction: UNITED_STATES });
    const base = buildCircuitInput({
      subjectSecret: HOLDER_SECRET,
      credential: cred,
      issuerPublicKey: issuer.publicKey,
      jurisdictionPath: allowlist.pathFor(GERMANY), // a path for someone else's country
      jurisdictionRoot: allowlist.root,
      requiredTier: ACCREDITATION_TIERS.ACCREDITED,
      currentTime: NOW,
      policyId: POLICY,
      sessionNonce: NONCE,
    });
    await expect(prove(base)).rejects.toThrow();
  }, 90000);

  it('REJECTS: an expired credential', async () => {
    const cred = await credentialFor({ issuedAt: NOW - 200, expiresAt: NOW - 100 });
    await expect(attempt({}, cred)).rejects.toThrow();
  }, 90000);

  it('REJECTS: a post-dated credential used before it starts', async () => {
    const cred = await credentialFor({ issuedAt: NOW + 86_400, expiresAt: NOW + 172_800 });
    await expect(attempt({}, cred)).rejects.toThrow();
  }, 90000);

  it('REJECTS: a credential signed by an issuer the venue does not trust', async () => {
    const rogue = await createIssuerKeypair(new Uint8Array(32).fill(9));
    const cred = await credentialFor({ signer: rogue });
    await expect(attempt({}, cred)).rejects.toThrow();
  }, 90000);

  it('REJECTS: a stolen credential without the holder secret', async () => {
    // Credentials are not bearer tokens. The signature covers a commitment,
    // and opening it needs the secret the holder never shared.
    await expect(attempt({ subjectSecret: '123456789' })).rejects.toThrow();
  }, 90000);

  it('binds the proof to the session nonce it was issued for', async () => {
    const { valid, publicSignals, proof, vkey } = await attempt();
    expect(valid).toBe(true);

    // Replaying the same proof under a different nonce must fail. This is the
    // check that catches sessionNonce being optimised out of the circuit.
    const nonceIndex = publicSignals.findIndex((s: string) => s === NONCE);
    expect(nonceIndex).toBeGreaterThanOrEqual(0);

    const snarkjs = (await import('snarkjs')) as any;
    const tampered = [...publicSignals];
    tampered[nonceIndex] = '999002';
    const replayed = await snarkjs.groth16.verify(vkey, tampered, proof);
    expect(replayed).toBe(false);
  }, 90000);

  it('nullifier is stable per offering and unlinkable across offerings', async () => {
    const a = await attempt({ policyId: '42' });
    const b = await attempt({ policyId: '42' });
    const c = await attempt({ policyId: '43' });
    const nullifierOf = (signals: string[]) => signals[0];
    expect(nullifierOf(a.publicSignals)).toBe(nullifierOf(b.publicSignals));
    expect(nullifierOf(a.publicSignals)).not.toBe(nullifierOf(c.publicSignals));
  }, 180000);
});

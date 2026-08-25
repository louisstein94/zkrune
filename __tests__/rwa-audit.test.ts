import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { randomBytes } from 'node:crypto';
import {
  ACCREDITATION_TIERS,
  buildCircuitInput,
  buildJurisdictionAllowlist,
  createIssuerKeypair,
  issueCredential,
  subjectCommitment,
  type IssuerKeypair,
  type JurisdictionAllowlist,
} from '../lib/rwa/credential';
import {
  admissionRecord,
  admissionsCommitment,
  auditOffering,
  policyFromRecord,
  verifyAdmission,
  type AdmissionRecord,
  type OfferingPolicy,
} from '../lib/rwa/audit';

// An audit answers a question the venue's own database cannot: was every
// admission backed by a credential meeting the policy the venue says it
// enforced? A proof that verifies is not enough on its own — a valid proof
// against a laxer bar is still a valid proof, so the policy carried in the
// public signals is what the audit actually checks.

const DIR = path.join(__dirname, '..', 'circuits', 'rwa-eligibility');
const WASM = path.join(DIR, 'circuit_js', 'circuit.wasm');
const ZKEY = path.join(DIR, 'circuit_test.zkey');
let vkey: unknown;

const GERMANY = 276;
const FRANCE = 250;
const NOW = 1787000000;
const POLICY_ID = '1001';

let issuer: IssuerKeypair;
let allowlist: JurisdictionAllowlist;
let statedPolicy: OfferingPolicy;

beforeAll(async () => {
  vkey = JSON.parse(fs.readFileSync(path.join(DIR, 'test_vkey.json'), 'utf-8'));
  issuer = await createIssuerKeypair(new Uint8Array(32).fill(11));
  allowlist = await buildJurisdictionAllowlist([GERMANY, FRANCE]);
  statedPolicy = {
    policyId: POLICY_ID,
    requiredTier: ACCREDITATION_TIERS.ACCREDITED,
    jurisdictionRoot: allowlist.root,
    issuerAx: issuer.publicKey.Ax,
    issuerAy: issuer.publicKey.Ay,
  };
}, 60000);

async function admit(opts: {
  tier?: number;
  requiredTier?: number;
  policyId?: string;
  signer?: IssuerKeypair;
} = {}): Promise<AdmissionRecord> {
  const secret = BigInt('0x' + randomBytes(31).toString('hex'));
  const signer = opts.signer ?? issuer;
  const credential = await issueCredential(signer, {
    subjectCommitment: await subjectCommitment(secret),
    accreditationTier: opts.tier ?? ACCREDITATION_TIERS.QUALIFIED_PURCHASER,
    jurisdictionCode: GERMANY,
    issuedAt: NOW - 60,
    expiresAt: NOW + 2_592_000,
  });
  const input = buildCircuitInput({
    subjectSecret: secret,
    credential,
    issuerPublicKey: signer.publicKey,
    jurisdictionPath: allowlist.pathFor(GERMANY),
    jurisdictionRoot: allowlist.root,
    requiredTier: opts.requiredTier ?? ACCREDITATION_TIERS.ACCREDITED,
    currentTime: NOW,
    policyId: opts.policyId ?? POLICY_ID,
    sessionNonce: String(BigInt('0x' + randomBytes(8).toString('hex'))),
  });
  const snarkjs = (await import('snarkjs')) as any;
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM, ZKEY);
  return admissionRecord(proof, publicSignals, NOW);
}

describe('rwa audit', () => {
  it('passes an offering where every admission met the stated policy', async () => {
    const records = [await admit(), await admit()];
    const result = await auditOffering(records, statedPolicy, vkey);

    expect(result.ok).toBe(true);
    expect(result.admissions).toBe(2);
    expect(result.passed).toBe(2);
    expect(result.uniqueInvestors).toBe(2);
  }, 180000);

  it('records the bar that was applied, not what the investor held', async () => {
    // Admitted a qualified purchaser against a policy asking for accredited.
    const record = await admit({
      tier: ACCREDITATION_TIERS.QUALIFIED_PURCHASER,
      requiredTier: ACCREDITATION_TIERS.ACCREDITED,
    });

    // The signals carry the venue's bar. The tier actually held is not among
    // them, so an auditor sees the policy was met without learning by how much.
    const signals = record.publicSignals;
    expect(signals).toHaveLength(8);
    expect(policyFromRecord(record).requiredTier).toBe(ACCREDITATION_TIERS.ACCREDITED);
    expect(signals).not.toContain(String(ACCREDITATION_TIERS.QUALIFIED_PURCHASER));

    // Nor does the investor's country appear anywhere in the record.
    expect(signals).not.toContain(String(GERMANY));
    expect(signals).not.toContain(String(FRANCE));
  }, 90000);

  it('catches a venue admitting below the bar it reports', async () => {
    // Admitted anyone KYC-cleared, then claims the offering required accredited.
    const lax = await admit({ requiredTier: ACCREDITATION_TIERS.KYC_CLEARED });
    const finding = await verifyAdmission(lax, statedPolicy, vkey);

    expect(finding.ok).toBe(false);
    expect(finding.reason).toContain('below the stated bar');
  }, 90000);

  it('catches a credential from an issuer outside the trust anchor', async () => {
    const rogue = await createIssuerKeypair(new Uint8Array(32).fill(13));
    const record = await admit({ signer: rogue });
    const finding = await verifyAdmission(record, statedPolicy, vkey);

    expect(finding.ok).toBe(false);
    expect(finding.reason).toContain('issuer outside');
  }, 90000);

  it('catches a record imported from another offering', async () => {
    const other = await admit({ policyId: '2002' });
    const finding = await verifyAdmission(other, statedPolicy, vkey);

    expect(finding.ok).toBe(false);
    expect(finding.reason).toContain('does not belong to offering');
  }, 90000);

  it('catches a tampered proof', async () => {
    const record = await admit();
    const tampered: AdmissionRecord = {
      ...record,
      publicSignals: [...record.publicSignals],
    };
    tampered.publicSignals[7] = '999999'; // session nonce
    const finding = await verifyAdmission(tampered, statedPolicy, vkey);

    expect(finding.ok).toBe(false);
    expect(finding.reason).toBe('proof did not verify');
  }, 90000);

  it('commits to admissions independently of order', async () => {
    const a = await admit();
    const b = await admit();
    const forwards = await admissionsCommitment([a, b]);
    const backwards = await admissionsCommitment([b, a]);
    expect(forwards).toBe(backwards);

    // Dropping a record has to change the commitment, or omission is free.
    const shrunk = await admissionsCommitment([a]);
    expect(shrunk).not.toBe(forwards);
  }, 180000);
});

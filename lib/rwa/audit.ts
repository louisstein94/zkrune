/**
 * Audit records for a private offering.
 *
 * A venue admits investors on the strength of a zero-knowledge proof and
 * learns nothing about them. That leaves a question a regulator will ask and
 * the venue cannot answer by pointing at its database: was every admission
 * actually backed by a credential meeting the stated policy?
 *
 * The proofs answer it. Each admission is recorded with the proof that granted
 * it, and anyone the venue authorises can re-verify the whole set. The auditor
 * learns that policy was enforced; nothing in the record identifies an
 * investor, so the public disclosure the ledger would otherwise force never
 * happens.
 *
 * Two properties are worth separating:
 *
 *   SOUNDNESS     every record in the set verifies, and the policy each proof
 *                 was checked against is the policy the venue claims it
 *                 enforced. This is what stops a venue admitting someone under
 *                 a laxer bar and reporting a stricter one.
 *
 *   COMPLETENESS  the set contains every admission. Proofs alone cannot show
 *                 this — a venue could simply omit a record. Publishing the
 *                 commitment returned by `admissionsCommitment` at the time of
 *                 admission is what makes a later omission detectable.
 */

import { buildPoseidon } from 'circomlibjs';

/** Public signal layout of the rwa-eligibility circuit. */
const SIGNAL = {
  nullifier: 0,
  issuerAx: 1,
  issuerAy: 2,
  currentTime: 3,
  requiredTier: 4,
  jurisdictionRoot: 5,
  policyId: 6,
  sessionNonce: 7,
} as const;

export const EXPECTED_SIGNAL_COUNT = 8;

export interface OfferingPolicy {
  policyId: string;
  requiredTier: number;
  jurisdictionRoot: string;
  issuerAx: string;
  issuerAy: string;
}

export interface AdmissionRecord {
  /** Identifies the admission within the offering. Reveals nothing about the investor. */
  nullifier: string;
  /** Unix seconds the proof was checked against. */
  verifiedAt: number;
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] };
  publicSignals: string[];
}

export interface AdmissionFinding {
  nullifier: string;
  ok: boolean;
  /** Populated when ok is false. */
  reason?: string;
}

export interface AuditResult {
  offering: string;
  admissions: number;
  passed: number;
  findings: AdmissionFinding[];
  /** Distinct investors. Lower than `admissions` means a nullifier repeated. */
  uniqueInvestors: number;
  ok: boolean;
}

let poseidonPromise: Promise<any> | null = null;
function getPoseidon() {
  poseidonPromise ??= buildPoseidon();
  return poseidonPromise;
}

/** Records an admission alongside the proof that granted it. */
export function admissionRecord(
  proof: AdmissionRecord['proof'],
  publicSignals: string[],
  verifiedAt: number = Math.floor(Date.now() / 1000),
): AdmissionRecord {
  if (publicSignals.length !== EXPECTED_SIGNAL_COUNT) {
    throw new Error(
      `expected ${EXPECTED_SIGNAL_COUNT} public signals, received ${publicSignals.length}`,
    );
  }
  return { nullifier: publicSignals[SIGNAL.nullifier], verifiedAt, proof, publicSignals };
}

/** Reads back the policy a proof was actually checked against. */
export function policyFromRecord(record: AdmissionRecord): OfferingPolicy {
  const s = record.publicSignals;
  return {
    policyId: s[SIGNAL.policyId],
    requiredTier: Number(s[SIGNAL.requiredTier]),
    jurisdictionRoot: s[SIGNAL.jurisdictionRoot],
    issuerAx: s[SIGNAL.issuerAx],
    issuerAy: s[SIGNAL.issuerAy],
  };
}

function policyMismatch(claimed: OfferingPolicy, actual: OfferingPolicy): string | null {
  if (claimed.policyId !== actual.policyId) {
    return `policy ${actual.policyId} does not belong to offering ${claimed.policyId}`;
  }
  if (actual.requiredTier < claimed.requiredTier) {
    return `admitted at tier ${actual.requiredTier}, below the stated bar of ${claimed.requiredTier}`;
  }
  if (actual.jurisdictionRoot !== claimed.jurisdictionRoot) {
    return 'checked against a different jurisdiction allowlist';
  }
  if (actual.issuerAx !== claimed.issuerAx || actual.issuerAy !== claimed.issuerAy) {
    return 'credential came from an issuer outside the stated trust anchor';
  }
  return null;
}

/**
 * Re-verifies one admission.
 *
 * The proof verifying is necessary but not sufficient: a valid proof against a
 * laxer policy is still a valid proof. The public signals carry the policy the
 * proof was checked against, so they are compared against what the venue says
 * it enforced.
 */
export async function verifyAdmission(
  record: AdmissionRecord,
  claimedPolicy: OfferingPolicy,
  vkey: unknown,
): Promise<AdmissionFinding> {
  const nullifier = record.nullifier;

  if (record.publicSignals.length !== EXPECTED_SIGNAL_COUNT) {
    return { nullifier, ok: false, reason: 'unexpected public signal count' };
  }
  if (record.publicSignals[SIGNAL.nullifier] !== nullifier) {
    return { nullifier, ok: false, reason: 'record nullifier does not match its proof' };
  }

  const mismatch = policyMismatch(claimedPolicy, policyFromRecord(record));
  if (mismatch) return { nullifier, ok: false, reason: mismatch };

  const snarkjs = await import('snarkjs');
  let verified = false;
  try {
    verified = await (snarkjs as any).groth16.verify(vkey, record.publicSignals, record.proof);
  } catch {
    return { nullifier, ok: false, reason: 'proof could not be checked' };
  }

  return verified
    ? { nullifier, ok: true }
    : { nullifier, ok: false, reason: 'proof did not verify' };
}

/** Re-verifies every admission in an offering. */
export async function auditOffering(
  records: AdmissionRecord[],
  claimedPolicy: OfferingPolicy,
  vkey: unknown,
): Promise<AuditResult> {
  const findings: AdmissionFinding[] = [];
  for (const record of records) {
    findings.push(await verifyAdmission(record, claimedPolicy, vkey));
  }
  const passed = findings.filter((f) => f.ok).length;
  return {
    offering: claimedPolicy.policyId,
    admissions: records.length,
    passed,
    findings,
    uniqueInvestors: new Set(records.map((r) => r.nullifier)).size,
    ok: passed === records.length && records.length > 0,
  };
}

/**
 * Commits to the admissions recorded so far.
 *
 * Publishing this as admissions happen is what turns the record from
 * "the proofs the venue chose to show" into a set it cannot quietly shrink.
 * Order-independent, so a venue cannot reshuffle its way to a different value.
 */
export async function admissionsCommitment(records: AdmissionRecord[]): Promise<string> {
  const poseidon = await getPoseidon();
  const F = poseidon.F;
  const sorted = [...new Set(records.map((r) => r.nullifier))].sort();
  let acc = 0n;
  for (const nullifier of sorted) {
    acc = F.toObject(poseidon([acc, BigInt(nullifier)]));
  }
  return acc.toString();
}

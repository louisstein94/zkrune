/**
 * Private offering eligibility, end to end.
 *
 * Three parties, none of whom learn what they shouldn't:
 *
 *   ISSUER  a transfer agent or KYC provider. Signs a claim about an investor
 *           and publishes only its public key. It never sees the investor's
 *           secret, so it cannot prove eligibility on their behalf.
 *
 *   VENUE   the offering. Publishes the countries it serves and the tier it
 *           requires, then verifies proofs. It learns that someone eligible
 *           arrived — not who, not from where, not how accredited.
 *
 *   HOLDER  the investor. Generates their own secret, receives a signed
 *           credential, and proves eligibility without disclosing any of it.
 *
 * Run:  npx tsx issue-and-prove.ts
 */

import { randomBytes } from 'node:crypto';
import * as snarkjs from 'snarkjs';
import { readFileSync } from 'node:fs';
import {
  ACCREDITATION_TIERS,
  buildCircuitInput,
  buildJurisdictionAllowlist,
  createIssuerKeypair,
  issueCredential,
  subjectCommitment,
} from '../../lib/rwa/credential';

const here = new URL('.', import.meta.url).pathname;
const WASM = here + '../../public/circuits/rwa-eligibility.wasm';
const ZKEY = here + '../../public/circuits/rwa-eligibility.zkey';
const VKEY = here + '../../public/circuits/rwa-eligibility_vkey.json';

async function main() {
  const GERMANY = 276;
  const FRANCE = 250;
  const now = Math.floor(Date.now() / 1000);

  // ── ISSUER ────────────────────────────────────────────────────────────
  // In production this key lives in an HSM and the public half is published
  // once. A venue configures it and never has to touch it again.
  const issuer = await createIssuerKeypair(randomBytes(32));
  console.log('issuer public key:', issuer.publicKey.Ax.slice(0, 16) + '…');

  // ── HOLDER ────────────────────────────────────────────────────────────
  // The secret is generated here and stays here. The issuer receives only the
  // commitment, which is what stops a breach of issuer records from producing
  // usable credentials.
  const subjectSecret = BigInt('0x' + randomBytes(31).toString('hex'));
  const commitment = await subjectCommitment(subjectSecret);

  // ── ISSUER signs a claim about that commitment ────────────────────────
  // Short validity is deliberate. Until a revocation mechanism ships, a short
  // window is the revocation story: a credential that stops being true stops
  // being usable within days rather than years.
  const credential = await issueCredential(issuer, {
    subjectCommitment: commitment,
    accreditationTier: ACCREDITATION_TIERS.QUALIFIED_PURCHASER,
    jurisdictionCode: GERMANY,
    issuedAt: now - 60,
    expiresAt: now + 30 * 86_400,
  });
  console.log('credential issued  : tier', credential.accreditationTier, 'jurisdiction', credential.jurisdictionCode);

  // ── VENUE publishes its policy ────────────────────────────────────────
  const allowlist = await buildJurisdictionAllowlist([GERMANY, FRANCE]);
  const policyId = '1001';
  const sessionNonce = String(BigInt('0x' + randomBytes(8).toString('hex')));
  console.log('venue policy       : tier >= ACCREDITED, serving DE and FR');

  // ── HOLDER proves eligibility ─────────────────────────────────────────
  const input = buildCircuitInput({
    subjectSecret,
    credential,
    issuerPublicKey: issuer.publicKey,
    jurisdictionPath: allowlist.pathFor(credential.jurisdictionCode),
    jurisdictionRoot: allowlist.root,
    requiredTier: ACCREDITATION_TIERS.ACCREDITED,
    currentTime: now,
    policyId,
    sessionNonce,
  });

  const started = Date.now();
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM, ZKEY);
  console.log(`proof generated    : ${Date.now() - started}ms`);

  // ── VENUE verifies ────────────────────────────────────────────────────
  const vkey = JSON.parse(readFileSync(VKEY, 'utf-8'));
  const ok = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  console.log('\nverification       :', ok ? 'ELIGIBLE' : 'REJECTED');
  console.log('nullifier          :', publicSignals[0].slice(0, 24) + '…');
  console.log('\nWhat the venue learned: an eligible investor arrived, and a');
  console.log('nullifier that stops them entering this offering twice.');
  console.log('What it did not learn : identity, country, or actual tier.');

  // ── The same holder cannot enter twice ────────────────────────────────
  const again = await snarkjs.groth16.fullProve(
    buildCircuitInput({
      subjectSecret,
      credential,
      issuerPublicKey: issuer.publicKey,
      jurisdictionPath: allowlist.pathFor(credential.jurisdictionCode),
      jurisdictionRoot: allowlist.root,
      requiredTier: ACCREDITATION_TIERS.ACCREDITED,
      currentTime: now,
      policyId,
      sessionNonce: String(BigInt(sessionNonce) + 1n),
    }),
    WASM,
    ZKEY,
  );
  console.log('\nsecond entry, fresh session, same investor:');
  console.log('  nullifier repeats:', again.publicSignals[0] === publicSignals[0]);
  console.log('  → the gate rejects a second entry without learning who was turned away');

  return ok;
}

main().then((ok) => process.exit(ok ? 0 : 1));

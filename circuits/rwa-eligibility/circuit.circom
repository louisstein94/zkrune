pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";
include "../../node_modules/circomlib/circuits/eddsaposeidon.circom";

//
// RwaEligibility(jurisdictionDepth)
//
// Proves that the holder is eligible to enter a regulated offering, without
// revealing who they are, where they live, or what their accreditation status
// actually is.
//
// The trust anchor is the *issuer's public key*, not a per-credential hash. A
// verifier configures one key — the transfer agent, KYC provider, or fund
// administrator it already relies on — and every credential that issuer ever
// signs is then verifiable against it. This is the difference between an
// eligibility gate an institution can deploy once and a gate that needs a new
// on-chain commitment for every investor.
//
// Five things are proven at the same time:
//
//   1. ATTESTATION  — the issuer signed this exact claim (EdDSA-Poseidon over
//                     the credential hash). Nothing about the claim can be
//                     edited without invalidating the signature.
//
//   2. OWNERSHIP    — the prover knows the secret behind the subject
//                     commitment the issuer signed. Credentials are not
//                     bearer tokens: a leaked credential is unusable.
//
//   3. ACCREDITATION— accreditationTier >= requiredTier. The actual tier stays
//                     private, so a qualified purchaser entering a merely
//                     accredited-investor offering does not disclose that they
//                     clear the higher bar.
//
//   4. JURISDICTION — the holder's country is in the allowlist committed to by
//                     jurisdictionRoot. The country itself is never revealed —
//                     only that it is one the offering accepts.
//
//   5. FRESHNESS    — issuedAt <= currentTime < expiresAt.
//
// Plus two binding properties that make the proof safe to transport:
//
//   NULLIFIER    — Poseidon(subjectCommitment, policyId), published. One
//                  investor yields exactly one nullifier per offering, so the
//                  gate can enforce one-entry-per-person and detect reuse,
//                  while the same investor stays unlinkable across offerings.
//
//   SESSION BIND — sessionNonce is fixed into the constraint system. A proof
//                  captured in flight cannot be replayed into another session
//                  or another verifier.
//
// zkRune verifies the issuer's attestation. It does not establish the
// underlying claim — determining that someone really is an accredited investor
// remains the issuer's responsibility.
//
template RwaEligibility(jurisdictionDepth) {

    // ── Private inputs: the credential ────────────────────────────────
    signal input subjectSecret;        // Holder-generated. The issuer never sees it.
    signal input accreditationTier;    // See ACCREDITATION_TIERS in lib/rwa/credential.ts
    signal input jurisdictionCode;     // ISO 3166-1 numeric
    signal input issuedAt;             // Unix seconds
    signal input expiresAt;            // Unix seconds

    // ── Private inputs: the issuer's EdDSA-Poseidon signature ─────────
    signal input issuerR8x;
    signal input issuerR8y;
    signal input issuerS;

    // ── Private inputs: jurisdiction allowlist membership ─────────────
    signal input jurisdictionPathElements[jurisdictionDepth];
    signal input jurisdictionPathIndices[jurisdictionDepth];

    // ── Public inputs ─────────────────────────────────────────────────
    signal input issuerAx;             // Issuer public key x — the trust anchor
    signal input issuerAy;             // Issuer public key y
    signal input currentTime;          // Verification timestamp
    signal input requiredTier;         // Minimum tier this offering demands
    signal input jurisdictionRoot;     // Merkle root of the accepted countries
    signal input policyId;             // Identifies the offering / ring
    signal input sessionNonce;         // Verifier-chosen, single-use

    // ── Public output ─────────────────────────────────────────────────
    //
    // Only the nullifier is published. There is deliberately no `isEligible`
    // signal: eligibility is enforced by the constraints below, so a proof
    // that verifies *is* an eligibility statement. Emitting a flag that is
    // constrained to 1 would add a public signal carrying no information, and
    // invites verifiers to branch on a value they should never see as 0.
    signal output nullifier;

    // ── Range discipline ──────────────────────────────────────────────
    //
    // The comparators below decompose their inputs into a fixed bit width and
    // are only sound when the inputs actually fit. Tiers and timestamps are
    // covered by the issuer's signature, so a malicious prover cannot choose
    // them — but requiredTier and currentTime come from the verifier, and a
    // misconfigured verifier must fail closed rather than silently produce a
    // comparison that wraps.
    component tierBits         = Num2Bits(8);
    component requiredTierBits = Num2Bits(8);
    component issuedAtBits     = Num2Bits(64);
    component expiresAtBits    = Num2Bits(64);
    component currentTimeBits  = Num2Bits(64);

    tierBits.in         <== accreditationTier;
    requiredTierBits.in <== requiredTier;
    issuedAtBits.in     <== issuedAt;
    expiresAtBits.in    <== expiresAt;
    currentTimeBits.in  <== currentTime;

    // ── Step 1: subject commitment ────────────────────────────────────
    //
    // The holder generates subjectSecret and sends only this commitment to the
    // issuer. The issuer signs a claim *about a commitment*, never about a
    // secret it holds, so the issuer cannot impersonate its own investors and
    // a breach of the issuer's records does not yield usable credentials.
    component subject = Poseidon(1);
    subject.inputs[0] <== subjectSecret;

    signal subjectCommitment;
    subjectCommitment <== subject.out;

    // ── Step 2: credential hash — exactly what the issuer signed ──────
    component credential = Poseidon(5);
    credential.inputs[0] <== subjectCommitment;
    credential.inputs[1] <== accreditationTier;
    credential.inputs[2] <== jurisdictionCode;
    credential.inputs[3] <== issuedAt;
    credential.inputs[4] <== expiresAt;

    // ── Step 3: the issuer signed it ──────────────────────────────────
    //
    // This is the constraint the whole gate rests on. Every private field
    // above feeds the message, so altering any one of them — inflating the
    // tier, swapping the country, extending the expiry — breaks the signature.
    component attestation = EdDSAPoseidonVerifier();
    attestation.enabled <== 1;
    attestation.Ax  <== issuerAx;
    attestation.Ay  <== issuerAy;
    attestation.R8x <== issuerR8x;
    attestation.R8y <== issuerR8y;
    attestation.S   <== issuerS;
    attestation.M   <== credential.out;

    // ── Step 4: accreditation threshold ───────────────────────────────
    component tierOk = GreaterEqThan(8);
    tierOk.in[0] <== accreditationTier;
    tierOk.in[1] <== requiredTier;
    tierOk.out === 1;

    // ── Step 5: validity window ───────────────────────────────────────
    component notExpired = GreaterThan(64);
    notExpired.in[0] <== expiresAt;
    notExpired.in[1] <== currentTime;
    notExpired.out === 1;

    // A post-dated credential must not grant access before it starts.
    component started = GreaterEqThan(64);
    started.in[0] <== currentTime;
    started.in[1] <== issuedAt;
    started.out === 1;

    // ── Step 6: jurisdiction is on the allowlist ──────────────────────
    //
    // The leaf is derived in-circuit from the signed jurisdictionCode, so a
    // path supplied for some other accepted country simply fails to reproduce
    // the root. The domain tag keeps a leaf from ever being reinterpreted as
    // an internal node.
    for (var i = 0; i < jurisdictionDepth; i++) {
        jurisdictionPathIndices[i] * (1 - jurisdictionPathIndices[i]) === 0;
    }

    component jurisdictionLeaf = Poseidon(2);
    jurisdictionLeaf.inputs[0] <== 1;   // JURISDICTION_LEAF_TAG
    jurisdictionLeaf.inputs[1] <== jurisdictionCode;

    component levelHasher[jurisdictionDepth];
    component muxL[jurisdictionDepth];
    component muxR[jurisdictionDepth];
    signal levelHash[jurisdictionDepth + 1];

    levelHash[0] <== jurisdictionLeaf.out;

    for (var i = 0; i < jurisdictionDepth; i++) {
        muxL[i] = Mux1();
        muxR[i] = Mux1();
        levelHasher[i] = Poseidon(2);

        // index 0 → current node is the left child; 1 → the right child.
        muxL[i].c[0] <== levelHash[i];
        muxL[i].c[1] <== jurisdictionPathElements[i];
        muxL[i].s    <== jurisdictionPathIndices[i];

        muxR[i].c[0] <== jurisdictionPathElements[i];
        muxR[i].c[1] <== levelHash[i];
        muxR[i].s    <== jurisdictionPathIndices[i];

        levelHasher[i].inputs[0] <== muxL[i].out;
        levelHasher[i].inputs[1] <== muxR[i].out;

        levelHash[i + 1] <== levelHasher[i].out;
    }

    levelHash[jurisdictionDepth] === jurisdictionRoot;

    // ── Step 7: nullifier ─────────────────────────────────────────────
    //
    // Keyed on the commitment rather than the raw secret: the value published
    // here is deterministic per (investor, offering), which is what lets a
    // gate enforce one entry per investor, and it reveals nothing that would
    // let two offerings correlate the same investor.
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== subjectCommitment;
    nullifierHasher.inputs[1] <== policyId;
    nullifier <== nullifierHasher.out;

    // ── Step 8: bind the proof to this session ────────────────────────
    //
    // sessionNonce is otherwise unused, and an unused public input is dropped
    // during compilation — which would silently remove the replay protection.
    // Squaring it forces the nonce into the constraint system, so a proof is
    // only ever valid for the nonce the verifier issued.
    signal sessionBinding;
    sessionBinding <== sessionNonce * sessionNonce;
}

// Public signals order (snarkjs publicSignals array):
//   [0] nullifier          (output)
//   [1] issuerAx
//   [2] issuerAy
//   [3] currentTime
//   [4] requiredTier
//   [5] jurisdictionRoot
//   [6] policyId
//   [7] sessionNonce
//
// Depth 10 → 1024 allowlist slots, which covers every ISO 3166-1 country with
// room for subdivision codes, at a cost of ten Poseidon(2) hashes.
component main {public [
    issuerAx,
    issuerAy,
    currentTime,
    requiredTier,
    jurisdictionRoot,
    policyId,
    sessionNonce
]} = RwaEligibility(10);

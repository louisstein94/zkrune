pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

//
// AccreditedInvestor(depth)
//
// Proves the holder carries an unexpired accreditation credential from an
// issuer, at or above the tier a venue requires, without revealing who the
// holder is or which tier they actually hold.
//
// The issuer (broker, transfer agent, KYC provider) builds a Merkle tree over
// the credentials it has issued and publishes only the root:
//
//   leaf = Poseidon(credentialSecret, accreditationTier, validUntil)
//
// Revocation is a root update: drop the leaf, publish the new root, and the
// revoked credential stops proving. Because the tier and expiry are hashed
// into the leaf, neither can be raised independently — changing either one
// changes the leaf and breaks the path.
//
// zkRune verifies the issuer's attestation. It does not establish
// accreditation itself; that remains the issuer's responsibility.
//
template AccreditedInvestor(depth) {

    // ── Private inputs ──────────────────────────────────────────────
    signal input credentialSecret;     // secret handed to the holder at issuance
    signal input accreditationTier;    // 1 = accredited, 2 = qualified purchaser
    signal input validUntil;           // expiry stamped into the leaf
    signal input pathElements[depth];
    signal input pathIndices[depth];

    // ── Public inputs ───────────────────────────────────────────────
    signal input issuerRoot;           // Merkle root the issuer published
    signal input minimumTier;          // tier this venue requires
    signal input currentTime;          // verification timestamp
    signal input contextId;            // scopes the nullifier to one venue/offering

    // ── Public outputs ──────────────────────────────────────────────
    signal output isEligible;          // always 1 when the proof is satisfiable
    signal output nullifier;           // unlinkable across contexts, stable within one

    // ── Range checks ────────────────────────────────────────────────
    // Comparators are only sound while their inputs stay inside the declared
    // bit width. Without these an out-of-range tier or timestamp could wrap
    // the field and satisfy a comparison it should fail.
    component tierBits    = Num2Bits(8);   tierBits.in    <== accreditationTier;
    component minTierBits = Num2Bits(8);   minTierBits.in <== minimumTier;
    component vuBits      = Num2Bits(64);  vuBits.in      <== validUntil;
    component ctBits      = Num2Bits(64);  ctBits.in      <== currentTime;

    // Path indices must be boolean, or the mux below is not a real selection.
    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;
    }

    // A zero secret would let anyone reconstruct the leaf.
    component secretNonZero = IsZero();
    secretNonZero.in <== credentialSecret;
    secretNonZero.out === 0;

    // ── Leaf: the credential exactly as the issuer committed to it ──
    component leafHasher = Poseidon(3);
    leafHasher.inputs[0] <== credentialSecret;
    leafHasher.inputs[1] <== accreditationTier;
    leafHasher.inputs[2] <== validUntil;

    // ── Merkle path back to the issuer's published root ─────────────
    component hashers[depth];
    component muxL[depth];
    component muxR[depth];
    signal levelHash[depth + 1];

    levelHash[0] <== leafHasher.out;

    for (var i = 0; i < depth; i++) {
        muxL[i] = Mux1();
        muxR[i] = Mux1();
        hashers[i] = Poseidon(2);

        muxL[i].c[0] <== levelHash[i];
        muxL[i].c[1] <== pathElements[i];
        muxL[i].s    <== pathIndices[i];

        muxR[i].c[0] <== pathElements[i];
        muxR[i].c[1] <== levelHash[i];
        muxR[i].s    <== pathIndices[i];

        hashers[i].inputs[0] <== muxL[i].out;
        hashers[i].inputs[1] <== muxR[i].out;

        levelHash[i + 1] <== hashers[i].out;
    }

    levelHash[depth] === issuerRoot;

    // ── Tier is at or above what the venue asks for ─────────────────
    component tierOk = GreaterEqThan(8);
    tierOk.in[0] <== accreditationTier;
    tierOk.in[1] <== minimumTier;
    tierOk.out === 1;

    // ── Credential has not expired ──────────────────────────────────
    component notExpired = GreaterThan(64);
    notExpired.in[0] <== validUntil;
    notExpired.in[1] <== currentTime;
    notExpired.out === 1;

    // ── Nullifier: same holder, same venue → same value ─────────────
    component nullHasher = Poseidon(2);
    nullHasher.inputs[0] <== credentialSecret;
    nullHasher.inputs[1] <== contextId;
    nullifier <== nullHasher.out;

    isEligible <== 1;
}

// Public signals order:
//   [0] isEligible  [1] nullifier
//   [2] issuerRoot  [3] minimumTier  [4] currentTime  [5] contextId
component main {public [issuerRoot, minimumTier, currentTime, contextId]} = AccreditedInvestor(20);

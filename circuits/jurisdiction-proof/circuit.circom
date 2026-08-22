pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

//
// JurisdictionProof(issuerDepth, listDepth)
//
// Proves the holder's attested jurisdiction is one a venue accepts, without
// revealing the holder or which jurisdiction they are in.
//
// Two published roots meet inside the circuit:
//
//   issuerRoot  — the issuer's tree of attested residencies
//                 leaf = Poseidon(credentialSecret, jurisdictionCode, validUntil)
//   allowedRoot — the venue's tree of jurisdictions it will serve
//                 leaf = Poseidon(jurisdictionCode)
//
// The same private jurisdictionCode has to open a leaf in both trees, which is
// what turns "I live somewhere" into "I live somewhere you accept" while
// disclosing neither the holder nor the country.
//
// Note this is an allow-list, not a deny-list. Proving a value is absent from
// a set needs a different construction, so venues express policy as the set of
// jurisdictions they serve rather than the ones they exclude.
//
template JurisdictionProof(issuerDepth, listDepth) {

    // ── Private inputs ──────────────────────────────────────────────
    signal input credentialSecret;
    signal input jurisdictionCode;             // e.g. ISO 3166-1 numeric
    signal input validUntil;
    signal input issuerPathElements[issuerDepth];
    signal input issuerPathIndices[issuerDepth];
    signal input listPathElements[listDepth];
    signal input listPathIndices[listDepth];

    // ── Public inputs ───────────────────────────────────────────────
    signal input issuerRoot;
    signal input allowedRoot;
    signal input currentTime;
    signal input contextId;

    // ── Public outputs ──────────────────────────────────────────────
    signal output isEligible;
    signal output nullifier;

    // ── Range checks ────────────────────────────────────────────────
    component codeBits = Num2Bits(16); codeBits.in <== jurisdictionCode;
    component vuBits   = Num2Bits(64); vuBits.in   <== validUntil;
    component ctBits   = Num2Bits(64); ctBits.in   <== currentTime;

    for (var i = 0; i < issuerDepth; i++) {
        issuerPathIndices[i] * (1 - issuerPathIndices[i]) === 0;
    }
    for (var j = 0; j < listDepth; j++) {
        listPathIndices[j] * (1 - listPathIndices[j]) === 0;
    }

    component secretNonZero = IsZero();
    secretNonZero.in <== credentialSecret;
    secretNonZero.out === 0;

    // ── Tree 1: the issuer attested this jurisdiction to this holder ─
    component issuerLeaf = Poseidon(3);
    issuerLeaf.inputs[0] <== credentialSecret;
    issuerLeaf.inputs[1] <== jurisdictionCode;
    issuerLeaf.inputs[2] <== validUntil;

    component iHash[issuerDepth];
    component iMuxL[issuerDepth];
    component iMuxR[issuerDepth];
    signal iLevel[issuerDepth + 1];
    iLevel[0] <== issuerLeaf.out;

    for (var i = 0; i < issuerDepth; i++) {
        iMuxL[i] = Mux1(); iMuxR[i] = Mux1(); iHash[i] = Poseidon(2);
        iMuxL[i].c[0] <== iLevel[i];
        iMuxL[i].c[1] <== issuerPathElements[i];
        iMuxL[i].s    <== issuerPathIndices[i];
        iMuxR[i].c[0] <== issuerPathElements[i];
        iMuxR[i].c[1] <== iLevel[i];
        iMuxR[i].s    <== issuerPathIndices[i];
        iHash[i].inputs[0] <== iMuxL[i].out;
        iHash[i].inputs[1] <== iMuxR[i].out;
        iLevel[i + 1] <== iHash[i].out;
    }
    iLevel[issuerDepth] === issuerRoot;

    // ── Tree 2: that same jurisdiction is one the venue serves ──────
    component listLeaf = Poseidon(1);
    listLeaf.inputs[0] <== jurisdictionCode;

    component lHash[listDepth];
    component lMuxL[listDepth];
    component lMuxR[listDepth];
    signal lLevel[listDepth + 1];
    lLevel[0] <== listLeaf.out;

    for (var j = 0; j < listDepth; j++) {
        lMuxL[j] = Mux1(); lMuxR[j] = Mux1(); lHash[j] = Poseidon(2);
        lMuxL[j].c[0] <== lLevel[j];
        lMuxL[j].c[1] <== listPathElements[j];
        lMuxL[j].s    <== listPathIndices[j];
        lMuxR[j].c[0] <== listPathElements[j];
        lMuxR[j].c[1] <== lLevel[j];
        lMuxR[j].s    <== listPathIndices[j];
        lHash[j].inputs[0] <== lMuxL[j].out;
        lHash[j].inputs[1] <== lMuxR[j].out;
        lLevel[j + 1] <== lHash[j].out;
    }
    lLevel[listDepth] === allowedRoot;

    // ── Attestation has not expired ─────────────────────────────────
    component notExpired = GreaterThan(64);
    notExpired.in[0] <== validUntil;
    notExpired.in[1] <== currentTime;
    notExpired.out === 1;

    component nullHasher = Poseidon(2);
    nullHasher.inputs[0] <== credentialSecret;
    nullHasher.inputs[1] <== contextId;
    nullifier <== nullHasher.out;

    isEligible <== 1;
}

// Public signals order:
//   [0] isEligible [1] nullifier
//   [2] issuerRoot [3] allowedRoot [4] currentTime [5] contextId
component main {public [issuerRoot, allowedRoot, currentTime, contextId]} = JurisdictionProof(20, 8);

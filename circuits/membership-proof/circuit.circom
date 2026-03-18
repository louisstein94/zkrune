pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

//
// MembershipProof(depth)
//
// Proves that a secret memberId is a leaf in a published Merkle tree,
// without revealing which member it is.
//
// The integrator builds a Merkle tree from their member list using the
// MembershipRegistry class in zkrune-sdk, publishes the root, and each
// member can independently prove inclusion.
//
//   leaf = Poseidon(memberId)
//   Merkle path walk → computedRoot
//   computedRoot === root  (hard constraint)
//
template MembershipProof(depth) {

    // ── Private inputs ──────────────────────────────────────────────
    signal input memberId;             // secret member identifier
    signal input pathElements[depth];  // sibling hashes along the Merkle path
    signal input pathIndices[depth];   // 0 = left child, 1 = right child

    // ── Public input ────────────────────────────────────────────────
    signal input root;                 // Merkle root published by the group issuer

    // ── Public output ───────────────────────────────────────────────
    signal output isMember;            // always 1 when proof is valid

    // ── Enforce pathIndices are boolean {0, 1} ──────────────────────
    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;
    }

    // ── Enforce memberId is non-zero ────────────────────────────────
    component nonZero = IsZero();
    nonZero.in <== memberId;
    nonZero.out === 0;

    // ── Step 1: leaf = Poseidon(memberId) ───────────────────────────
    component leafHasher = Poseidon(1);
    leafHasher.inputs[0] <== memberId;

    // ── Step 2: Walk Merkle path to recompute root ──────────────────
    component hashers[depth];
    component muxL[depth];
    component muxR[depth];
    signal levelHash[depth + 1];

    levelHash[0] <== leafHasher.out;

    for (var i = 0; i < depth; i++) {
        muxL[i] = Mux1();
        muxR[i] = Mux1();
        hashers[i] = Poseidon(2);

        // pathIndices[i] = 0 → current is left  → left=current, right=sibling
        // pathIndices[i] = 1 → current is right → left=sibling, right=current
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

    // ── Step 3: Computed root MUST equal the published root ─────────
    levelHash[depth] === root;

    // ── Output: proof is only satisfiable when member is in the tree ─
    isMember <== 1;
}

// Public signals order (snarkjs publicSignals array):
//   [0] isMember  (output, always 1)
//   [1] root      (public input)
component main {public [root]} = MembershipProof(16);

pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

//
// WhaleHolderProof(depth)
//
// Proves THREE things simultaneously:
//
//   1. MEMBERSHIP  — (address, balance) is a leaf in the published Merkle snapshot.
//                    → levelHash[depth] === root (hard constraint)
//
//   2. THRESHOLD   — balance >= minimumBalance (whale threshold).
//                    → hasMinimum output = 1
//
//   3. ANTI-REPLAY — A unique nullifier is produced from (address, nullifierSecret).
//                    The verifier (Telegram bot) stores used nullifiers so the same
//                    proof cannot be submitted twice, and the same address cannot
//                    grant access to multiple people.
//                    → nullifier = Poseidon(address, nullifierSecret) (public output)
//
// ─────────────────────────────────────────────────────────────────────────────
// Private inputs  (never appear in the proof — only their consequences do)
// Public inputs   (known to the verifier)
// Public outputs  (computed by the circuit — also known to the verifier)
// ─────────────────────────────────────────────────────────────────────────────
//
template WhaleHolderProof(depth) {

    // ── Private inputs ──────────────────────────────────────────────
    signal input address;              // Solana pubkey as field element (first 31 bytes)
    signal input balance;              // token balance in whole units (raw / 10^6)
    signal input pathElements[depth];  // sibling hashes along the Merkle path
    signal input pathIndices[depth];   // 0 = current node is left child, 1 = right child
    signal input nullifierSecret;      // random secret held by the prover; store to prevent
                                       // others from reusing this proof (save this locally!)

    // ── Public inputs ────────────────────────────────────────────────
    signal input root;                 // Merkle root published by zkRune snapshot
    signal input minimumBalance;       // whale threshold (10,000,000 zkRUNE = 1%)

    // ── Public outputs ────────────────────────────────────────────────
    signal output hasMinimum;          // 1 if balance >= minimumBalance
    signal output nullifier;           // Poseidon(address, nullifierSecret) — unique per proof

    // ── Enforce pathIndices are boolean {0, 1} ───────────────────────
    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;
    }

    // ── Step 1: Compute leaf = Poseidon(address, balance) ───────────
    component leafHasher = Poseidon(2);
    leafHasher.inputs[0] <== address;
    leafHasher.inputs[1] <== balance;

    // ── Step 2: Walk Merkle path to recompute root ───────────────────
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

    // ── Step 3: Computed root MUST equal the published snapshot root ──
    levelHash[depth] === root;

    // ── Step 4: Balance threshold ─────────────────────────────────────
    component cmp = GreaterEqThan(64);
    cmp.in[0] <== balance;
    cmp.in[1] <== minimumBalance;
    hasMinimum <== cmp.out;

    // ── Step 5: Nullifier = Poseidon(address, nullifierSecret) ────────
    // Public output → verifier stores it; resubmitting the same (or any)
    // proof with the same nullifier is rejected.
    // address is baked in → one nullifier per (address, secret) pair.
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== address;
    nullifierHasher.inputs[1] <== nullifierSecret;
    nullifier <== nullifierHasher.out;
}

// Public signals order (snarkjs publicSignals array):
//   [0] hasMinimum
//   [1] nullifier
//   [2] root          (public input)
//   [3] minimumBalance (public input)
component main {public [root, minimumBalance]} = WhaleHolderProof(20);

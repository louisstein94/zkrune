pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";
include "../../node_modules/circomlib/circuits/babyjub.circom";

//
// WhaleHolderProofV2(depth)
//
// v2 closes the Sybil hole in v1: v1 took `address` as a private witness with no
// ownership check, so anyone who knew a whale's public Solana address could
// generate a valid proof. v2 binds the proof to a BabyJubjub keypair that was
// registered out-of-band by signing the BJJ pubkey with the Solana wallet.
// The Solana address never enters this circuit; the bot never sees it either.
//
// Proves FOUR things simultaneously:
//
//   1. OWNERSHIP   — Prover knows the BJJ secret key whose pubkey is in the snapshot.
//                    → bjj_pk derived inside the circuit; only the holder of
//                      bjj_sk can produce a valid witness.
//
//   2. MEMBERSHIP  — (bjj_pk, balance) is a leaf in the published Merkle snapshot.
//                    → levelHash[depth] === root
//
//   3. THRESHOLD   — balance >= minimumBalance (whale threshold).
//                    → hasMinimum === 1
//
//   4. ANTI-REPLAY — Nullifier deterministic per (user, snapshot). Same user
//                    cannot claim twice on the same snapshot; new snapshot
//                    yields a new nullifier for the same user.
//                    → nullifier = Poseidon(bjj_sk, root)
//
template WhaleHolderProofV2(depth) {

    // ── Private inputs ──────────────────────────────────────────────
    signal input bjjSk;                // BabyJubjub secret key (field element)
    signal input balance;              // token balance (whole units, raw / 10^decimals)
    signal input pathElements[depth];  // sibling hashes along the Merkle path
    signal input pathIndices[depth];   // 0 = current is left child, 1 = right

    // ── Public inputs ────────────────────────────────────────────────
    signal input root;                 // Merkle root of the published snapshot
    signal input minimumBalance;       // whale threshold (e.g. 10_000_000)

    // ── Public outputs ────────────────────────────────────────────────
    signal output hasMinimum;          // 1 if balance >= minimumBalance
    signal output nullifier;           // unique per (bjj_sk, root)

    // ── Enforce pathIndices are boolean {0, 1} ───────────────────────
    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;
    }

    // ── Step 1: Derive bjj_pk = bjj_sk * G (BabyJubjub base) ─────────
    // BabyPbk does the scalar mult; we never expose bjj_pk publicly.
    component bjjPubkey = BabyPbk();
    bjjPubkey.in <== bjjSk;

    // ── Step 2: leaf = Poseidon(bjj_pk_x, bjj_pk_y, balance) ─────────
    component leafHasher = Poseidon(3);
    leafHasher.inputs[0] <== bjjPubkey.Ax;
    leafHasher.inputs[1] <== bjjPubkey.Ay;
    leafHasher.inputs[2] <== balance;

    // ── Step 3: Walk Merkle path to recompute root ───────────────────
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

    // ── Step 4: Computed root MUST equal the published snapshot root ──
    levelHash[depth] === root;

    // ── Step 5: Balance threshold ─────────────────────────────────────
    component cmp = GreaterEqThan(64);
    cmp.in[0] <== balance;
    cmp.in[1] <== minimumBalance;
    hasMinimum <== cmp.out;
    hasMinimum === 1;

    // ── Step 6: Nullifier = Poseidon(bjj_sk, root) ───────────────────
    // Bound to the snapshot root so the same user can re-prove on a fresh
    // snapshot but cannot double-claim the current one. The bot stores
    // used nullifiers and rejects duplicates.
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== bjjSk;
    nullifierHasher.inputs[1] <== root;
    nullifier <== nullifierHasher.out;
}

// Public signals order (matches v1 layout for bot compatibility):
//   [0] hasMinimum
//   [1] nullifier
//   [2] root           (public input)
//   [3] minimumBalance (public input)
component main {public [root, minimumBalance]} = WhaleHolderProofV2(20);

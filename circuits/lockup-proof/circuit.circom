pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";

//
// LockupProof(depth)
//
// Proves a position a transfer agent recorded has cleared its lock-up and
// still meets a minimum size, without revealing the holder or the amount.
//
// The transfer agent publishes a root over the positions it recorded:
//
//   leaf = Poseidon(credentialSecret, lockedAmount, unlockTime)
//
// Both the amount and the unlock date are hashed into the leaf, so a holder
// cannot inflate the position or bring the unlock date forward: either change
// produces a different leaf and the Merkle path stops resolving.
//
// A venue asks two things of a seller — that the restricted period is over and
// that the position is large enough to matter — and learns neither the size of
// the position nor whose it is.
//
template LockupProof(depth) {

    // ── Private inputs ──────────────────────────────────────────────
    signal input credentialSecret;
    signal input lockedAmount;         // position size the agent recorded
    signal input unlockTime;           // when the restriction lifts
    signal input pathElements[depth];
    signal input pathIndices[depth];

    // ── Public inputs ───────────────────────────────────────────────
    signal input issuerRoot;           // transfer agent's published root
    signal input minimumAmount;        // smallest position the venue accepts
    signal input currentTime;
    signal input contextId;

    // ── Public outputs ──────────────────────────────────────────────
    signal output isUnlocked;
    signal output nullifier;

    // ── Range checks ────────────────────────────────────────────────
    // 2^64 covers token amounts in base units well past any realistic supply,
    // and keeps both comparisons inside the width they are sound for.
    component amtBits = Num2Bits(64); amtBits.in <== lockedAmount;
    component minBits = Num2Bits(64); minBits.in <== minimumAmount;
    component utBits  = Num2Bits(64); utBits.in  <== unlockTime;
    component ctBits  = Num2Bits(64); ctBits.in  <== currentTime;

    for (var i = 0; i < depth; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;
    }

    component secretNonZero = IsZero();
    secretNonZero.in <== credentialSecret;
    secretNonZero.out === 0;

    // ── Leaf: the position exactly as the agent recorded it ─────────
    component leafHasher = Poseidon(3);
    leafHasher.inputs[0] <== credentialSecret;
    leafHasher.inputs[1] <== lockedAmount;
    leafHasher.inputs[2] <== unlockTime;

    component hashers[depth];
    component muxL[depth];
    component muxR[depth];
    signal levelHash[depth + 1];
    levelHash[0] <== leafHasher.out;

    for (var i = 0; i < depth; i++) {
        muxL[i] = Mux1(); muxR[i] = Mux1(); hashers[i] = Poseidon(2);
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

    // ── The restricted period has elapsed ───────────────────────────
    component unlocked = GreaterEqThan(64);
    unlocked.in[0] <== currentTime;
    unlocked.in[1] <== unlockTime;
    unlocked.out === 1;

    // ── The position still meets the minimum ────────────────────────
    component enough = GreaterEqThan(64);
    enough.in[0] <== lockedAmount;
    enough.in[1] <== minimumAmount;
    enough.out === 1;

    component nullHasher = Poseidon(2);
    nullHasher.inputs[0] <== credentialSecret;
    nullHasher.inputs[1] <== contextId;
    nullifier <== nullHasher.out;

    isUnlocked <== 1;
}

// Public signals order:
//   [0] isUnlocked [1] nullifier
//   [2] issuerRoot [3] minimumAmount [4] currentTime [5] contextId
component main {public [issuerRoot, minimumAmount, currentTime, contextId]} = LockupProof(20);

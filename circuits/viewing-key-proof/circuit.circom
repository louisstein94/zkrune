pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Kage Viewing Key Proof
//
// Proves that the caller knows the viewing key whose Poseidon hash is stored
// on-chain by the Kage protocol — without ever transmitting the key itself.
//
// Flow:
//   1. Kage stores Poseidon(viewingKey, salt) on Solana PDA at memory creation.
//   2. To grant/verify access, caller generates this proof locally.
//   3. Verifier checks the proof against the on-chain hash — key never leaves the device.
//
// Private inputs  : viewingKey, salt
// Public inputs   : viewingKeyHash (Poseidon hash stored on-chain)
// Public outputs  : isAuthorized (1 if key is valid, 0 otherwise)
//                   nullifier    (prevents replay attacks across sessions)

template ViewingKeyProof() {
    // Private inputs — never leave the prover's device
    signal input viewingKey;
    signal input salt;

    // Public input — the Poseidon hash recorded on Solana by Kage
    signal input viewingKeyHash;

    // Outputs
    signal output isAuthorized;
    signal output nullifier;

    // --- Step 1: Recompute Poseidon(viewingKey, salt) ---
    component hasher = Poseidon(2);
    hasher.inputs[0] <== viewingKey;
    hasher.inputs[1] <== salt;

    // --- Step 2: Assert recomputed hash == on-chain hash ---
    component hashCheck = IsEqual();
    hashCheck.in[0] <== hasher.out;
    hashCheck.in[1] <== viewingKeyHash;

    isAuthorized <== hashCheck.out;

    // Constraint: output must be boolean
    isAuthorized * (isAuthorized - 1) === 0;

    // --- Step 3: Derive a session nullifier ---
    // Poseidon(viewingKey, salt + 1) — unique per (key, salt) pair.
    // Kage stores used nullifiers to prevent replay attacks.
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== viewingKey;
    nullifierHasher.inputs[1] <== salt + 1;

    nullifier <== nullifierHasher.out;

    // --- Step 4: Viewing key must be non-zero ---
    component nonZeroCheck = IsZero();
    nonZeroCheck.in <== viewingKey;
    signal isNonZero;
    isNonZero <== 1 - nonZeroCheck.out;
    isNonZero === 1;
}

component main {public [viewingKeyHash]} = ViewingKeyProof();

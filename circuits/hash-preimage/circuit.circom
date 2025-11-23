pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Hash Preimage Proof
// Proves you know preimage X where hash(X) = Y without revealing X
template HashPreimage() {
    // Private inputs
    signal input preimage;            // The secret value
    signal input salt;                // Salt for additional security
    
    // Public inputs
    signal input expectedHash;        // The known hash value
    
    // Outputs
    signal output isValid;
    signal output commitmentHash;     // Additional commitment
    
    // Calculate hash of preimage
    component hasher = Poseidon(2);
    hasher.inputs[0] <== preimage;
    hasher.inputs[1] <== salt;
    
    // Check if hash matches expected
    component hashCheck = IsEqual();
    hashCheck.in[0] <== hasher.out;
    hashCheck.in[1] <== expectedHash;
    
    isValid <== hashCheck.out;
    
    // Create additional commitment for verification
    component commitmentHasher = Poseidon(1);
    commitmentHasher.inputs[0] <== preimage;
    commitmentHash <== commitmentHasher.out;
    
    // Constraint: output must be 0 or 1
    isValid * (isValid - 1) === 0;
}

component main {public [expectedHash]} = HashPreimage();


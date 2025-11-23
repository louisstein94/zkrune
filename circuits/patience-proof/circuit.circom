pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Patience Privacy Proof
// Proves you waited a certain time period without revealing exact timing
template PatienceProof() {
    // Private inputs
    signal input startTime;           // When you started (Unix timestamp)
    signal input endTime;             // When you ended (Unix timestamp)
    signal input secret;              // Secret for commitment
    
    // Public inputs
    signal input minimumWaitTime;     // Minimum time to wait (seconds)
    signal input commitmentHash;      // Public commitment hash
    
    // Outputs
    signal output isValid;
    signal output proofHash;
    
    // Calculate wait duration
    signal waitDuration;
    waitDuration <== endTime - startTime;
    
    // Check 1: Wait duration is at least minimum required
    component durationCheck = GreaterEqThan(64);
    durationCheck.in[0] <== waitDuration;
    durationCheck.in[1] <== minimumWaitTime;
    
    // Check 2: Verify commitment (proves you committed before waiting)
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== startTime;
    commitmentHasher.inputs[1] <== secret;
    
    component commitmentCheck = IsEqual();
    commitmentCheck.in[0] <== commitmentHasher.out;
    commitmentCheck.in[1] <== commitmentHash;
    
    // Check 3: Times are valid (endTime > startTime)
    component timeValidCheck = GreaterThan(64);
    timeValidCheck.in[0] <== endTime;
    timeValidCheck.in[1] <== startTime;
    
    // All checks must pass
    signal check1;
    signal check2;
    check1 <== durationCheck.out * commitmentCheck.out;
    check2 <== check1 * timeValidCheck.out;
    isValid <== check2;
    
    // Generate proof hash for verification
    component proofHasher = Poseidon(3);
    proofHasher.inputs[0] <== waitDuration;
    proofHasher.inputs[1] <== minimumWaitTime;
    proofHasher.inputs[2] <== secret;
    proofHash <== proofHasher.out;
    
    // Constraint: output must be 0 or 1
    isValid * (isValid - 1) === 0;
}

component main {public [minimumWaitTime, commitmentHash]} = PatienceProof();


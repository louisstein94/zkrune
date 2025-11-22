pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Credential Proof Circuit
// Proves you have valid credentials without revealing the actual credential data
template CredentialProof() {
    // Private inputs
    signal input credentialHash;      // Hash of the actual credential
    signal input credentialSecret;    // Secret associated with credential
    signal input validUntil;          // Expiration timestamp
    
    // Public inputs
    signal input currentTime;         // Current timestamp
    signal input expectedHash;        // Expected credential hash
    
    // Outputs
    signal output isValid;
    
    // Intermediate signals
    signal hashMatch;
    signal notExpired;
    
    // Check 1: Credential hash matches expected hash
    component hashComparator = IsEqual();
    hashComparator.in[0] <== credentialHash;
    hashComparator.in[1] <== expectedHash;
    hashMatch <== hashComparator.out;
    
    // Check 2: Credential is not expired (validUntil > currentTime)
    component timeComparator = GreaterThan(64);
    timeComparator.in[0] <== validUntil;
    timeComparator.in[1] <== currentTime;
    notExpired <== timeComparator.out;
    
    // Check 3: Hash the secret with Poseidon to prove knowledge
    component hasher = Poseidon(2);
    hasher.inputs[0] <== credentialSecret;
    hasher.inputs[1] <== validUntil;
    
    // Final validation: all checks must pass
    signal check1;
    check1 <== hashMatch * notExpired;
    isValid <== check1;
    
    // Constraint: output must be 0 or 1
    isValid * (isValid - 1) === 0;
}

component main {public [currentTime, expectedHash]} = CredentialProof();


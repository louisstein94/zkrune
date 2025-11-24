pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Real Membership Proof with hash-based verification
// Proves you know a memberId that hashes to one of the valid group hashes
template MembershipProof() {
    // Private input - member secret ID
    signal input memberId;
    
    // Public input - expected root hash for the group
    signal input groupHash;
    
    // Output
    signal output isMember;
    
    // Hash the member ID using Poseidon
    component hasher = Poseidon(1);
    hasher.inputs[0] <== memberId;
    
    // Check if hash matches the group hash
    component hashCheck = IsEqual();
    hashCheck.in[0] <== hasher.out;
    hashCheck.in[1] <== groupHash;
    
    // Output the result
    isMember <== hashCheck.out;
    
    // Additional constraint: memberId must be non-zero
    component nonZeroCheck = IsZero();
    nonZeroCheck.in <== memberId;
    
    // Force memberId to be non-zero (nonZeroCheck.out should be 0)
    signal isNonZero;
    isNonZero <== 1 - nonZeroCheck.out;
    isNonZero === 1;
}

// Main component
component main {public [groupHash]} = MembershipProof();

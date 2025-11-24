pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Real Private Voting with Poseidon hash commitment
template PrivateVoting() {
    // Private inputs
    signal input voterId;
    signal input voteChoice; // 0, 1, 2, or 3
    
    // Public input
    signal input pollId;
    
    // Output - vote commitment
    signal output voteCommitment;
    
    // Validate vote choice is in valid range (0-3)
    component choiceCheck = LessThan(8);
    choiceCheck.in[0] <== voteChoice;
    choiceCheck.in[1] <== 4; // Max 4 options (0, 1, 2, 3)
    choiceCheck.out === 1;
    
    // Create commitment using Poseidon hash
    component hasher = Poseidon(3);
    hasher.inputs[0] <== voterId;
    hasher.inputs[1] <== voteChoice;
    hasher.inputs[2] <== pollId;
    
    // Output the hash commitment
    voteCommitment <== hasher.out;
    
    // Additional constraint: voterId must be non-zero
    component voterIdCheck = IsZero();
    voterIdCheck.in <== voterId;
    
    // Force voterId to be non-zero
    signal isValidVoter;
    isValidVoter <== 1 - voterIdCheck.out;
    isValidVoter === 1;
}

// Main component
component main {public [pollId]} = PrivateVoting();

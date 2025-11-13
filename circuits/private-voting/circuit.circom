pragma circom 2.0.0;

// Ultra-minimal Private Voting (optimized for speed)
template PrivateVoting() {
    // Private inputs
    signal input voterId;
    signal input voteChoice; // 0, 1, 2
    
    // Public input
    signal input pollId;
    
    // Output - vote commitment
    signal output voteCommitment;
    
    // Simple commitment (real would use Poseidon hash)
    signal temp;
    temp <== voterId + voteChoice;
    
    voteCommitment <== temp + pollId;
}

component main {public [pollId]} = PrivateVoting();


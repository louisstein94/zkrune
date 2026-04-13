pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Quadratic Voting Circuit
// Vote weight = sqrt(tokens) to prevent whale dominance
template QuadraticVoting() {
    // Private inputs
    signal input voterId;           // Voter's secret ID
    signal input tokenBalance;      // Number of tokens owned (private)
    signal input voteChoice;        // Vote option (0, 1, 2, etc.)
    signal input sqrtVal;           // Prover computes floor(sqrt(tokenBalance)) off-chain

    // Public inputs
    signal input pollId;            // Poll identifier
    signal input minTokens;         // Minimum tokens required to vote

    // Outputs
    signal output voteCommitment;   // Hash commitment of vote
    signal output voteWeight;       // Calculated vote weight (sqrt)
    signal output canVote;          // Eligibility flag

    // Check voter has minimum tokens
    component eligibilityCheck = GreaterEqThan(64);
    eligibilityCheck.in[0] <== tokenBalance;
    eligibilityCheck.in[1] <== minTokens;
    canVote <== eligibilityCheck.out;

    // Range check: tokenBalance must be < 1,000,000 (prevents field overflow)
    component tokenRangeCheck = LessThan(64);
    tokenRangeCheck.in[0] <== tokenBalance;
    tokenRangeCheck.in[1] <== 1000000;
    tokenRangeCheck.out === 1;

    // Quadratic vote weight via verified square root
    // Constraint: sqrtVal^2 <= tokenBalance
    signal sqSquared;
    sqSquared <== sqrtVal * sqrtVal;
    component lowerBound = LessEqThan(64);
    lowerBound.in[0] <== sqSquared;
    lowerBound.in[1] <== tokenBalance;
    lowerBound.out === 1;

    // Constraint: tokenBalance < (sqrtVal + 1)^2
    signal sqrtValPlusOne;
    sqrtValPlusOne <== sqrtVal + 1;
    signal upperSq;
    upperSq <== sqrtValPlusOne * sqrtValPlusOne;
    component upperBound = LessThan(64);
    upperBound.in[0] <== tokenBalance;
    upperBound.in[1] <== upperSq;
    upperBound.out === 1;

    // Vote weight = floor(sqrt(tokenBalance)), capped at 1000 (sqrt of max 1M)
    component weightCapCheck = LessEqThan(64);
    weightCapCheck.in[0] <== sqrtVal;
    weightCapCheck.in[1] <== 1000;
    weightCapCheck.out === 1;

    voteWeight <== sqrtVal;
    
    // Create vote commitment using Poseidon hash
    component hasher = Poseidon(4);
    hasher.inputs[0] <== voterId;
    hasher.inputs[1] <== voteChoice;
    hasher.inputs[2] <== pollId;
    hasher.inputs[3] <== tokenBalance;
    
    voteCommitment <== hasher.out;
    
    // Validate vote choice is in range (0-9)
    component choiceCheck = LessThan(8);
    choiceCheck.in[0] <== voteChoice;
    choiceCheck.in[1] <== 10;
    choiceCheck.out === 1;
    
    // Ensure voterId is non-zero
    component voterCheck = IsZero();
    voterCheck.in <== voterId;
    signal validVoter;
    validVoter <== 1 - voterCheck.out;
    validVoter === 1;
}

component main {public [pollId, minTokens]} = QuadraticVoting();


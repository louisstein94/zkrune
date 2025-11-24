pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Anonymous Reputation Score Proof
// Prove your reputation score exceeds threshold without revealing identity
template AnonymousReputation() {
    // Private inputs
    signal input userId;            // User's secret identifier
    signal input reputationScore;   // Actual reputation score (kept private)
    signal input userNonce;         // Random nonce for privacy
    
    // Public inputs
    signal input thresholdScore;    // Minimum required score
    signal input platformId;        // Platform/system identifier
    
    // Outputs
    signal output userCommitment;   // Anonymous user commitment
    signal output meetsThreshold;   // Boolean: score >= threshold
    signal output scoreCategory;    // Categorical score level (0-4)
    
    // Check if reputation meets threshold
    component thresholdCheck = GreaterEqThan(64);
    thresholdCheck.in[0] <== reputationScore;
    thresholdCheck.in[1] <== thresholdScore;
    meetsThreshold <== thresholdCheck.out;
    
    // Calculate score category (0-4) based on ranges
    // Use comparison circuits instead of division for quadratic compatibility
    component cat0 = LessThan(64);
    cat0.in[0] <== reputationScore;
    cat0.in[1] <== 200; // Category 0: 0-199
    
    component cat1 = LessThan(64);
    cat1.in[0] <== reputationScore;
    cat1.in[1] <== 400; // Category 1: 200-399
    
    component cat2 = LessThan(64);
    cat2.in[0] <== reputationScore;
    cat2.in[1] <== 600; // Category 2: 400-599
    
    component cat3 = LessThan(64);
    cat3.in[0] <== reputationScore;
    cat3.in[1] <== 800; // Category 3: 600-799
    
    // Calculate category: count how many thresholds we've passed
    signal cat0_val;
    signal cat1_val;
    signal cat2_val;
    signal cat3_val;
    
    cat0_val <== cat0.out;
    cat1_val <== (1 - cat0.out) * cat1.out;
    cat2_val <== (1 - cat1.out) * cat2.out;
    cat3_val <== (1 - cat2.out) * cat3.out;
    
    // Sum to get category (0-4)
    scoreCategory <== (1 - cat0.out) + (1 - cat1.out) + (1 - cat2.out) + (1 - cat3.out);
    
    // Create anonymous user commitment
    component hasher = Poseidon(4);
    hasher.inputs[0] <== userId;
    hasher.inputs[1] <== userNonce;
    hasher.inputs[2] <== platformId;
    hasher.inputs[3] <== reputationScore;
    
    userCommitment <== hasher.out;
    
    // Validate reputation score is reasonable (0-1000)
    component scoreValidMin = GreaterEqThan(64);
    scoreValidMin.in[0] <== reputationScore;
    scoreValidMin.in[1] <== 0;
    
    component scoreValidMax = LessEqThan(64);
    scoreValidMax.in[0] <== reputationScore;
    scoreValidMax.in[1] <== 1000;
    
    // Both checks must pass
    signal scoreValid;
    scoreValid <== scoreValidMin.out * scoreValidMax.out;
    scoreValid === 1;
    
    // Ensure userId is non-zero
    component userCheck = IsZero();
    userCheck.in <== userId;
    signal validUser;
    validUser <== 1 - userCheck.out;
    validUser === 1;
}

component main {public [thresholdScore, platformId]} = AnonymousReputation();


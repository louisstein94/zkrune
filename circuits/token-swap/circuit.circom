pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";

// Token Swap Circuit
// Proves you have sufficient tokens for a swap without revealing exact balance
template TokenSwap() {
    // Private inputs
    signal input tokenABalance;       // Your balance of Token A
    signal input tokenBBalance;       // Your balance of Token B (if needed)
    signal input swapSecret;          // Secret to authorize swap
    
    // Public inputs
    signal input requiredTokenA;      // Required amount of Token A
    signal input swapRate;            // Exchange rate (scaled by 1000)
    signal input minReceive;          // Minimum Token B to receive
    
    // Outputs
    signal output canSwap;            // 1 if swap is valid, 0 otherwise
    signal output commitmentHash;     // Commitment to the swap
    
    // Intermediate signals
    signal hasSufficientA;
    signal expectedReceive;
    signal meetsMinimum;
    
    // Check 1: Has sufficient Token A
    component balanceCheck = GreaterEqThan(64);
    balanceCheck.in[0] <== tokenABalance;
    balanceCheck.in[1] <== requiredTokenA;
    hasSufficientA <== balanceCheck.out;
    
    // Check 2: Calculate expected receive amount
    // expectedReceive = (requiredTokenA * swapRate) / 1000
    // Note: We validate this relationship rather than computing division
    signal product;
    product <== requiredTokenA * swapRate;
    // Verify: product >= minReceive * 1000
    expectedReceive <== product;
    
    // Check 3: Meets minimum receive requirement
    // product (requiredTokenA * swapRate) >= minReceive * 1000
    signal minScaled;
    minScaled <== minReceive * 1000;
    
    component minCheck = GreaterEqThan(64);
    minCheck.in[0] <== product;
    minCheck.in[1] <== minScaled;
    meetsMinimum <== minCheck.out;
    
    // Final validation
    canSwap <== hasSufficientA * meetsMinimum;
    
    // Create commitment hash
    component commitment = Poseidon(3);
    commitment.inputs[0] <== tokenABalance;
    commitment.inputs[1] <== swapSecret;
    commitment.inputs[2] <== requiredTokenA;
    commitmentHash <== commitment.out;
    
    // Constraints
    canSwap * (canSwap - 1) === 0;
}

component main {public [requiredTokenA, swapRate, minReceive]} = TokenSwap();


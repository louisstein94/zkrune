pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

// Real Range Proof with proper constraints
template RangeProof() {
    // Private input - actual value
    signal input value;
    
    // Public inputs - range
    signal input minRange;
    signal input maxRange;
    
    // Output
    signal output inRange;
    
    // Check value >= minRange
    component minCheck = GreaterEqThan(64);
    minCheck.in[0] <== value;
    minCheck.in[1] <== minRange;
    
    // Check value <= maxRange
    component maxCheck = LessEqThan(64);
    maxCheck.in[0] <== value;
    maxCheck.in[1] <== maxRange;
    
    // Both checks must pass
    signal bothChecks;
    bothChecks <== minCheck.out * maxCheck.out;
    
    // Output the result (1 if both pass, 0 otherwise)
    inRange <== bothChecks;
    
    // Additional sanity check: minRange <= maxRange
    component rangeValidCheck = LessEqThan(64);
    rangeValidCheck.in[0] <== minRange;
    rangeValidCheck.in[1] <== maxRange;
    rangeValidCheck.out === 1;
}

// Main component
component main {public [minRange, maxRange]} = RangeProof();

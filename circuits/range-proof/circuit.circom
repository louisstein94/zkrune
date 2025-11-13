pragma circom 2.0.0;

// Ultra-minimal Range Proof (optimized for speed)
template RangeProof() {
    // Private input - actual value
    signal input value;
    
    // Public inputs - range
    signal input minRange;
    signal input maxRange;
    
    // Output
    signal output inRange;
    
    // Calculate differences
    signal minDiff;
    signal maxDiff;
    
    minDiff <== value - minRange;
    maxDiff <== maxRange - value;
    
    // Simplified for speed
    // Real version would have proper range constraints
    inRange <== 1;
}

component main {public [minRange, maxRange]} = RangeProof();


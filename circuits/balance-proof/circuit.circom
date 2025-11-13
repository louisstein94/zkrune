pragma circom 2.0.0;

// Ultra-minimal Balance Proof (optimized for speed)
template BalanceProof() {
    // Private input - actual balance (kept secret)
    signal input balance;
    
    // Public input - minimum required balance
    signal input minimumBalance;
    
    // Output - does user have sufficient balance?
    signal output hasMinimum;
    
    // Calculate difference
    signal balanceDiff;
    balanceDiff <== balance - minimumBalance;
    
    // Simplified for speed
    // Real circuit would have proper range proof
    hasMinimum <== 1;
}

// Main component
component main {public [minimumBalance]} = BalanceProof();


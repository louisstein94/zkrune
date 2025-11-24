pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

// Real Balance Proof with proper comparison
template BalanceProof() {
    // Private input - actual balance (kept secret)
    signal input balance;
    
    // Public input - minimum required balance
    signal input minimumBalance;
    
    // Output - does user have sufficient balance?
    signal output hasMinimum;
    
    // Real comparison: balance >= minimumBalance
    component balanceCheck = GreaterEqThan(64);
    balanceCheck.in[0] <== balance;
    balanceCheck.in[1] <== minimumBalance;
    
    // Output the actual comparison result
    hasMinimum <== balanceCheck.out;
    
    // Additional constraint: balance must be non-negative
    component nonNegativeCheck = LessThan(64);
    nonNegativeCheck.in[0] <== balance;
    nonNegativeCheck.in[1] <== 2**63; // Max safe value
    
    // Ensure balance is reasonable
    nonNegativeCheck.out === 1;
}

// Main component
component main {public [minimumBalance]} = BalanceProof();


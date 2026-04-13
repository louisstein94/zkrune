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
    // Enforce: proof is only satisfiable when balance meets the minimum
    hasMinimum === 1;
    
    // Range check: balance must fit in 53 bits (prevents field overflow attacks)
    component balanceRange = LessThan(64);
    balanceRange.in[0] <== balance;
    balanceRange.in[1] <== 9007199254740992; // 2^53
    balanceRange.out === 1;

    // Range check: minimumBalance must also be in valid range
    component minBalanceRange = LessThan(64);
    minBalanceRange.in[0] <== minimumBalance;
    minBalanceRange.in[1] <== 9007199254740992; // 2^53
    minBalanceRange.out === 1;
}

// Main component
component main {public [minimumBalance]} = BalanceProof();


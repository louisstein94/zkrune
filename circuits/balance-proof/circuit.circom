pragma circom 2.0.0;

// Reuse comparators
template GreaterEqThan(n) {
    signal input in[2];
    signal output out;

    component lt = LessThan(n);
    lt.in[0] <== in[0];
    lt.in[1] <== in[1];
    
    out <== 1 - lt.out;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component n2b = Num2Bits(n+1);
    n2b.in <== in[0] + (1<<n) - in[1];

    out <== 1 - n2b.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

// Balance Proof Circuit
template BalanceProof() {
    // Private input - actual balance (kept secret)
    signal input balance;
    
    // Public input - minimum required balance
    signal input minimumBalance;
    
    // Output - does user have sufficient balance?
    signal output hasMinimum;
    
    // Check if balance >= minimumBalance
    component gte = GreaterEqThan(64);
    gte.in[0] <== balance;
    gte.in[1] <== minimumBalance;
    
    hasMinimum <== gte.out;
}

// Main component
component main {public [minimumBalance]} = BalanceProof();


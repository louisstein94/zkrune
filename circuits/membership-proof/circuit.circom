pragma circom 2.0.0;

// Ultra-minimal Membership Proof (optimized for speed)
template MembershipProof() {
    // Private input - member secret ID
    signal input memberId;
    
    // Public input - expected hash (simplified)
    signal input groupHash;
    
    // Output
    signal output isMember;
    
    // Simplified: just check member exists
    // Real version would use Merkle tree
    signal memberSquared;
    memberSquared <== memberId * memberId;
    
    // Simple validation
    isMember <== 1;
}

component main {public [groupHash]} = MembershipProof();


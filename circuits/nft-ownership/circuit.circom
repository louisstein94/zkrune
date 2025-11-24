pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// NFT Ownership Proof Circuit
// Prove you own an NFT from a collection without revealing which one
template NFTOwnership() {
    // Private inputs
    signal input nftTokenId;        // Specific NFT token ID (kept secret)
    signal input ownerSecret;       // Owner's secret key
    
    // Public inputs
    signal input collectionRoot;    // Merkle root or collection hash
    signal input minTokenId;        // Collection range start
    signal input maxTokenId;        // Collection range end
    
    // Outputs
    signal output ownershipProof;   // Proof of ownership
    signal output isValid;          // Validity flag
    
    // Check NFT is within collection range
    component minCheck = GreaterEqThan(64);
    minCheck.in[0] <== nftTokenId;
    minCheck.in[1] <== minTokenId;
    
    component maxCheck = LessEqThan(64);
    maxCheck.in[0] <== nftTokenId;
    maxCheck.in[1] <== maxTokenId;
    
    // Both range checks must pass
    signal inRange;
    inRange <== minCheck.out * maxCheck.out;
    
    // Create ownership proof using Poseidon hash
    component ownerHasher = Poseidon(2);
    ownerHasher.inputs[0] <== nftTokenId;
    ownerHasher.inputs[1] <== ownerSecret;
    
    // Verify ownership proof matches collection
    component collectionHasher = Poseidon(1);
    collectionHasher.inputs[0] <== ownerHasher.out;
    
    ownershipProof <== ownerHasher.out;
    
    // Check if proof is valid for collection
    component validityCheck = IsEqual();
    validityCheck.in[0] <== collectionHasher.out;
    validityCheck.in[1] <== collectionRoot;
    
    // Valid if in range AND proof matches
    isValid <== inRange * validityCheck.out;
    
    // Ensure non-zero inputs
    component secretCheck = IsZero();
    secretCheck.in <== ownerSecret;
    signal validSecret;
    validSecret <== 1 - secretCheck.out;
    validSecret === 1;
    
    component tokenCheck = IsZero();
    tokenCheck.in <== nftTokenId;
    signal validToken;
    validToken <== 1 - tokenCheck.out;
    validToken === 1;
}

component main {public [collectionRoot, minTokenId, maxTokenId]} = NFTOwnership();


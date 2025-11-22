pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/eddsaposeidon.circom";

// Signature Verification Circuit
// Verifies a signature without revealing the private key
template SignatureVerification() {
    // Private inputs
    signal input privateKey;          // Private key (kept secret)
    signal input message;             // Message that was signed
    signal input nonce;               // Random nonce for signature
    
    // Public inputs  
    signal input publicKeyX;          // Public key X coordinate
    signal input publicKeyY;          // Public key Y coordinate
    signal input expectedMessage;     // Expected message hash
    
    // Outputs
    signal output isValidSignature;
    signal output messageHash;
    
    // Hash the message
    component messageHasher = Poseidon(2);
    messageHasher.inputs[0] <== message;
    messageHasher.inputs[1] <== nonce;
    messageHash <== messageHasher.out;
    
    // Check message matches expected
    component messageCheck = IsEqual();
    messageCheck.in[0] <== messageHash;
    messageCheck.in[1] <== expectedMessage;
    
    // Verify signature (simplified - in production use EdDSA)
    // Hash private key to derive public key
    component pubKeyHasher = Poseidon(1);
    pubKeyHasher.inputs[0] <== privateKey;
    
    // Check derived public key matches provided public key
    component pubKeyCheck = IsEqual();
    pubKeyCheck.in[0] <== pubKeyHasher.out;
    pubKeyCheck.in[1] <== publicKeyX;
    
    // Both checks must pass
    isValidSignature <== messageCheck.out * pubKeyCheck.out;
    
    // Constraint
    isValidSignature * (isValidSignature - 1) === 0;
}

component main {public [publicKeyX, publicKeyY, expectedMessage]} = SignatureVerification();


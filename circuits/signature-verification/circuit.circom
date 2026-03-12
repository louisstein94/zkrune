pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/eddsaposeidon.circom";

// Signature Verification Circuit
// Uses real EdDSA-Poseidon signature verification (circomlib standard).
//
// The signer produces (R8x, R8y, S) off-circuit with the circomlib
// eddsa.js helper and provides them as private inputs.
// Only the public key (Ax, Ay) and the message M are public.
//
// Security properties:
//  - privateKey is never an input; the circuit never sees it
//  - EdDSAPoseidonVerifier enforces the group equation in-circuit
//  - proof is only satisfiable if the signer holds the private key
//    corresponding to (Ax, Ay)

template SignatureVerification() {
    // Private inputs — signature components
    signal input R8x;   // R8 point x-coordinate (from eddsa.sign)
    signal input R8y;   // R8 point y-coordinate (from eddsa.sign)
    signal input S;     // Scalar component (from eddsa.sign)

    // Public inputs
    signal input Ax;    // Signer public key x
    signal input Ay;    // Signer public key y
    signal input M;     // Message (field element)

    // EdDSA-Poseidon verifier from circomlib
    // Internally checks: 8·S·B == 8·R8 + 8·hash(R8,A,M)·A
    component verifier = EdDSAPoseidonVerifier();
    verifier.enabled <== 1;  // always enforce
    verifier.Ax      <== Ax;
    verifier.Ay      <== Ay;
    verifier.R8x     <== R8x;
    verifier.R8y     <== R8y;
    verifier.S       <== S;
    verifier.M       <== M;
}

// Ax, Ay, M are public; R8x, R8y, S remain private
component main {public [Ax, Ay, M]} = SignatureVerification();


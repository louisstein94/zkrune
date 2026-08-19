pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Credential Proof Circuit
//
// Proves the prover holds a credential that an issuer attested to, without
// revealing the credential, and that the credential has not expired.
//
// The issuer publishes expectedHash = Poseidon(credentialSecret, validUntil)
// when it issues the credential. Only a party that knows the preimage of that
// commitment can satisfy the circuit, so the proof binds to a real issuance.
//
// zkRune verifies the issuer's attestation. It does not establish the
// underlying claim — that is the issuer's responsibility.
template CredentialProof() {
    // Private inputs — the credential itself, never revealed
    signal input credentialSecret;    // Secret handed to the holder at issuance
    signal input validUntil;          // Expiry stamped into the commitment

    // Public inputs
    signal input currentTime;         // Verification timestamp
    signal input expectedHash;        // Commitment the issuer published

    signal output isValid;

    // Bind the proof to the issued credential.
    //
    // This constraint is what makes the circuit sound. Without it the prover
    // could pick any private inputs and still satisfy the expiry check, so
    // eligibility was provable with no credential at all. Because validUntil
    // is an input to the commitment, it cannot be inflated independently
    // either — changing it changes the hash and breaks this equality.
    component commitment = Poseidon(2);
    commitment.inputs[0] <== credentialSecret;
    commitment.inputs[1] <== validUntil;
    commitment.out === expectedHash;

    // The credential must not have expired.
    component notExpired = GreaterThan(64);
    notExpired.in[0] <== validUntil;
    notExpired.in[1] <== currentTime;

    isValid <== notExpired.out;

    isValid * (isValid - 1) === 0;
    // Proof is only valid when the credential is attested and unexpired.
    isValid === 1;
}

component main {public [currentTime, expectedHash]} = CredentialProof();

#!/bin/bash

# Generate proving keys for new circuits only
set -e

echo "🔑 Generating proving keys for new circuits..."

# Check if Powers of Tau exists
if [ ! -f "circuits/powersOfTau28_hez_final_10.ptau" ]; then
    echo "📥 Downloading Powers of Tau..."
    curl -o circuits/powersOfTau28_hez_final_10.ptau \
        https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

# Credential Proof Keys
echo ""
echo "🔑 Credential Proof..."
snarkjs groth16 setup \
    circuits/credential-proof/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/credential-proof/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/credential-proof/circuit_0000.zkey \
    circuits/credential-proof/circuit_final.zkey \
    --name="zkRune" -v -e="credential_proof_$(date +%s)"

snarkjs zkey export verificationkey \
    circuits/credential-proof/circuit_final.zkey \
    circuits/credential-proof/verification_key.json

echo "✓ Credential Proof keys generated"

# Token Swap Keys
echo ""
echo "🔑 Token Swap..."
snarkjs groth16 setup \
    circuits/token-swap/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/token-swap/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/token-swap/circuit_0000.zkey \
    circuits/token-swap/circuit_final.zkey \
    --name="zkRune" -v -e="token_swap_$(date +%s)"

snarkjs zkey export verificationkey \
    circuits/token-swap/circuit_final.zkey \
    circuits/token-swap/verification_key.json

echo "✓ Token Swap keys generated"

# Signature Verification Keys
echo ""
echo "🔑 Signature Verification..."
snarkjs groth16 setup \
    circuits/signature-verification/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/signature-verification/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/signature-verification/circuit_0000.zkey \
    circuits/signature-verification/circuit_final.zkey \
    --name="zkRune" -v -e="signature_verification_$(date +%s)"

snarkjs zkey export verificationkey \
    circuits/signature-verification/circuit_final.zkey \
    circuits/signature-verification/verification_key.json

echo "✓ Signature Verification keys generated"

# Copy to public
echo ""
echo "📦 Copying to public/circuits/..."
mkdir -p public/circuits

cp circuits/credential-proof/circuit_final.zkey public/circuits/credential-proof.zkey
cp circuits/credential-proof/verification_key.json public/circuits/credential-proof_vkey.json

cp circuits/token-swap/circuit_final.zkey public/circuits/token-swap.zkey
cp circuits/token-swap/verification_key.json public/circuits/token-swap_vkey.json

cp circuits/signature-verification/circuit_final.zkey public/circuits/signature-verification.zkey
cp circuits/signature-verification/verification_key.json public/circuits/signature-verification_vkey.json

echo ""
echo "✅ All keys generated and copied!"
echo "🎉 New circuits are ready for use!"


#!/bin/bash

# Generate proving keys for final 2 circuits
set -e

echo "🔑 Generating proving keys for final circuits..."

# Patience Proof Keys
echo ""
echo "🔑 Patience Proof..."
snarkjs groth16 setup \
    circuits/patience-proof/circuit.r1cs \
    circuits/powersOfTau28_hez_final_12.ptau \
    circuits/patience-proof/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/patience-proof/circuit_0000.zkey \
    circuits/patience-proof/circuit_final.zkey \
    --name="zkRune" -v -e="patience_proof_$(date +%s)"

snarkjs zkey export verificationkey \
    circuits/patience-proof/circuit_final.zkey \
    circuits/patience-proof/verification_key.json

echo "✓ Patience Proof keys generated"

# Hash Preimage Keys
echo ""
echo "🔑 Hash Preimage..."
snarkjs groth16 setup \
    circuits/hash-preimage/circuit.r1cs \
    circuits/powersOfTau28_hez_final_12.ptau \
    circuits/hash-preimage/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/hash-preimage/circuit_0000.zkey \
    circuits/hash-preimage/circuit_final.zkey \
    --name="zkRune" -v -e="hash_preimage_$(date +%s)"

snarkjs zkey export verificationkey \
    circuits/hash-preimage/circuit_final.zkey \
    circuits/hash-preimage/verification_key.json

echo "✓ Hash Preimage keys generated"

# Copy to public
echo ""
echo "📦 Copying to public/circuits/..."
mkdir -p public/circuits

cp circuits/patience-proof/circuit_js/circuit.wasm public/circuits/patience-proof.wasm
cp circuits/patience-proof/circuit_final.zkey public/circuits/patience-proof.zkey
cp circuits/patience-proof/verification_key.json public/circuits/patience-proof_vkey.json

cp circuits/hash-preimage/circuit_js/circuit.wasm public/circuits/hash-preimage.wasm
cp circuits/hash-preimage/circuit_final.zkey public/circuits/hash-preimage.zkey
cp circuits/hash-preimage/verification_key.json public/circuits/hash-preimage_vkey.json

echo ""
echo "✅ Final circuits ready!"
echo "🎉 Total: 10/10 ZK circuits!"


#!/bin/bash

# zkRune Circuit Compilation Script
# This script compiles Circom circuits to WASM and generates proving keys

set -e

echo "🔮 zkRune Circuit Compiler"
echo "=========================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "❌ Circom not found!"
    echo "Install with: cargo install --git https://github.com/iden3/circom.git"
    exit 1
fi

# Check if snarkjs is installed
if ! command -v snarkjs &> /dev/null; then
    echo "ℹ️  Installing snarkjs globally..."
    npm install -g snarkjs
fi

# Create output directory
mkdir -p public/circuits

# Compile Age Verification
echo ""
echo "${BLUE}📝 Compiling Age Verification circuit...${NC}"
circom circuits/age-verification/circuit.circom \
    -l node_modules \
    --r1cs --wasm --sym \
    --output circuits/age-verification/

echo "${GREEN}✓ Age Verification compiled${NC}"

# Compile Balance Proof
echo ""
echo "${BLUE}📝 Compiling Balance Proof circuit...${NC}"
circom circuits/balance-proof/circuit.circom \
    -l node_modules \
    --r1cs --wasm --sym \
    --output circuits/balance-proof/

echo "${GREEN}✓ Balance Proof compiled${NC}"

# Compile Credential Proof
echo ""
echo "${BLUE}📝 Compiling Credential Proof circuit...${NC}"
circom circuits/credential-proof/circuit.circom \
    -l node_modules \
    --r1cs --wasm --sym \
    --output circuits/credential-proof/

echo "${GREEN}✓ Credential Proof compiled${NC}"

# Compile Token Swap
echo ""
echo "${BLUE}📝 Compiling Token Swap circuit...${NC}"
circom circuits/token-swap/circuit.circom \
    -l node_modules \
    --r1cs --wasm --sym \
    --output circuits/token-swap/

echo "${GREEN}✓ Token Swap compiled${NC}"

# Compile Signature Verification
echo ""
echo "${BLUE}📝 Compiling Signature Verification circuit...${NC}"
circom circuits/signature-verification/circuit.circom \
    -l node_modules \
    --r1cs --wasm --sym \
    --output circuits/signature-verification/

echo "${GREEN}✓ Signature Verification compiled${NC}"

# Generate proving and verification keys (using powers of tau)
echo ""
echo "${BLUE}🔑 Generating proving keys...${NC}"

# Download Powers of Tau if not exists
if [ ! -f "circuits/powersOfTau28_hez_final_10.ptau" ]; then
    echo "📥 Downloading Powers of Tau ceremony file..."
    curl -o circuits/powersOfTau28_hez_final_10.ptau \
        https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

# Age Verification Keys
snarkjs groth16 setup \
    circuits/age-verification/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/age-verification/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/age-verification/circuit_0000.zkey \
    circuits/age-verification/circuit_final.zkey \
    --name="zkRune" -v -e="random_entropy_text_for_age_verification_$(date)"

snarkjs zkey export verificationkey \
    circuits/age-verification/circuit_final.zkey \
    circuits/age-verification/verification_key.json

echo "${GREEN}✓ Age Verification keys generated${NC}"

# Balance Proof Keys
snarkjs groth16 setup \
    circuits/balance-proof/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/balance-proof/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/balance-proof/circuit_0000.zkey \
    circuits/balance-proof/circuit_final.zkey \
    --name="zkRune" -v -e="random_entropy_text_for_balance_proof_$(date)"

snarkjs zkey export verificationkey \
    circuits/balance-proof/circuit_final.zkey \
    circuits/balance-proof/verification_key.json

echo "${GREEN}✓ Balance Proof keys generated${NC}"

# Credential Proof Keys
snarkjs groth16 setup \
    circuits/credential-proof/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/credential-proof/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/credential-proof/circuit_0000.zkey \
    circuits/credential-proof/circuit_final.zkey \
    --name="zkRune" -v -e="random_entropy_text_for_credential_proof_$(date)"

snarkjs zkey export verificationkey \
    circuits/credential-proof/circuit_final.zkey \
    circuits/credential-proof/verification_key.json

echo "${GREEN}✓ Credential Proof keys generated${NC}"

# Token Swap Keys
snarkjs groth16 setup \
    circuits/token-swap/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/token-swap/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/token-swap/circuit_0000.zkey \
    circuits/token-swap/circuit_final.zkey \
    --name="zkRune" -v -e="random_entropy_text_for_token_swap_$(date)"

snarkjs zkey export verificationkey \
    circuits/token-swap/circuit_final.zkey \
    circuits/token-swap/verification_key.json

echo "${GREEN}✓ Token Swap keys generated${NC}"

# Signature Verification Keys
snarkjs groth16 setup \
    circuits/signature-verification/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/signature-verification/circuit_0000.zkey

snarkjs zkey contribute \
    circuits/signature-verification/circuit_0000.zkey \
    circuits/signature-verification/circuit_final.zkey \
    --name="zkRune" -v -e="random_entropy_text_for_signature_verification_$(date)"

snarkjs zkey export verificationkey \
    circuits/signature-verification/circuit_final.zkey \
    circuits/signature-verification/verification_key.json

echo "${GREEN}✓ Signature Verification keys generated${NC}"

# Copy WASM files to public directory
echo ""
echo "${BLUE}📦 Copying WASM files to public...${NC}"
cp circuits/age-verification/circuit_js/circuit.wasm public/circuits/age-verification.wasm
cp circuits/age-verification/circuit_final.zkey public/circuits/age-verification.zkey
cp circuits/age-verification/verification_key.json public/circuits/age-verification_vkey.json

cp circuits/balance-proof/circuit_js/circuit.wasm public/circuits/balance-proof.wasm
cp circuits/balance-proof/circuit_final.zkey public/circuits/balance-proof.zkey
cp circuits/balance-proof/verification_key.json public/circuits/balance-proof_vkey.json

cp circuits/credential-proof/circuit_js/circuit.wasm public/circuits/credential-proof.wasm
cp circuits/credential-proof/circuit_final.zkey public/circuits/credential-proof.zkey
cp circuits/credential-proof/verification_key.json public/circuits/credential-proof_vkey.json

cp circuits/token-swap/circuit_js/circuit.wasm public/circuits/token-swap.wasm
cp circuits/token-swap/circuit_final.zkey public/circuits/token-swap.zkey
cp circuits/token-swap/verification_key.json public/circuits/token-swap_vkey.json

cp circuits/signature-verification/circuit_js/circuit.wasm public/circuits/signature-verification.wasm
cp circuits/signature-verification/circuit_final.zkey public/circuits/signature-verification.zkey
cp circuits/signature-verification/verification_key.json public/circuits/signature-verification_vkey.json

echo "${GREEN}✓ Files copied to public/circuits${NC}"

echo ""
echo "${GREEN}🎉 All circuits compiled successfully!${NC}"
echo "Files ready in public/circuits/"


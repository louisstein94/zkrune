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

# Copy WASM files to public directory
echo ""
echo "${BLUE}📦 Copying WASM files to public...${NC}"
cp circuits/age-verification/circuit_js/circuit.wasm public/circuits/age-verification.wasm
cp circuits/age-verification/circuit_final.zkey public/circuits/age-verification.zkey
cp circuits/age-verification/verification_key.json public/circuits/age-verification_vkey.json

cp circuits/balance-proof/circuit_js/circuit.wasm public/circuits/balance-proof.wasm
cp circuits/balance-proof/circuit_final.zkey public/circuits/balance-proof.zkey
cp circuits/balance-proof/verification_key.json public/circuits/balance-proof_vkey.json

echo "${GREEN}✓ Files copied to public/circuits${NC}"

echo ""
echo "${GREEN}🎉 All circuits compiled successfully!${NC}"
echo "Files ready in public/circuits/"


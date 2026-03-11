#!/bin/bash
# Compile whale-holder.circom and run Groth16 trusted setup
# Uses the existing powersOfTau28_hez_final_14.ptau from ceremony/
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "${BLUE}zkRune — Whale Holder Circuit Compiler${NC}"
echo "========================================"

# Check dependencies
if ! command -v circom &> /dev/null; then
  echo "circom not found. Install: cargo install --git https://github.com/iden3/circom.git"
  exit 1
fi
if ! command -v snarkjs &> /dev/null; then
  npm install -g snarkjs
fi

PTAU="ceremony/powersOfTau28_hez_final_14.ptau"
CIRCUIT_DIR="circuits/whale-holder"
OUT_DIR="circuits/whale-holder"
PUBLIC_DIR="public/circuits"

mkdir -p "$OUT_DIR" "$PUBLIC_DIR"

echo ""
echo "${BLUE}Step 1: Compile circuit${NC}"
circom "$CIRCUIT_DIR/circuit.circom" \
  -l node_modules \
  --r1cs --wasm --sym \
  --output "$OUT_DIR/"
echo "${GREEN}✓ Compiled${NC}"

WASM_FILE="$OUT_DIR/circuit_js/circuit.wasm"
R1CS_FILE="$OUT_DIR/circuit.r1cs"

echo ""
echo "${BLUE}Step 2: Print constraint count${NC}"
snarkjs r1cs info "$R1CS_FILE"

echo ""
echo "${BLUE}Step 3: Groth16 setup (phase 1 — powers of tau)${NC}"
snarkjs groth16 setup "$R1CS_FILE" "$PTAU" "$OUT_DIR/circuit_0000.zkey"
echo "${GREEN}✓ Setup done${NC}"

echo ""
echo "${BLUE}Step 4: Contribute randomness (phase 2)${NC}"
snarkjs zkey contribute \
  "$OUT_DIR/circuit_0000.zkey" \
  "$OUT_DIR/circuit_final.zkey" \
  --name="zkRune whale-holder" \
  -e="$(head -c 64 /dev/urandom | base64)"
echo "${GREEN}✓ Contribution done${NC}"

echo ""
echo "${BLUE}Step 5: Export verification key${NC}"
snarkjs zkey export verificationkey \
  "$OUT_DIR/circuit_final.zkey" \
  "$OUT_DIR/verification_key.json"
echo "${GREEN}✓ Verification key exported${NC}"

echo ""
echo "${BLUE}Step 6: Copy to public/circuits/${NC}"
cp "$WASM_FILE"                       "$PUBLIC_DIR/whale-holder.wasm"
cp "$OUT_DIR/circuit_final.zkey"      "$PUBLIC_DIR/whale-holder.zkey"
cp "$OUT_DIR/verification_key.json"   "$PUBLIC_DIR/whale-holder_vkey.json"
echo "${GREEN}✓ Files copied to public/circuits/${NC}"

echo ""
echo "${YELLOW}Next step: generate the holder snapshot${NC}"
echo "  npx ts-node --project tsconfig.json scripts/snapshot-holders.ts"
echo ""
echo "${GREEN}Done!${NC}"

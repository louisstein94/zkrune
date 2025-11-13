# ⚡ zkRune Quick Compile Guide

## ✅ Prerequisites (Already Done!)

```
✓ Circom: 2.2.3
✓ snarkjs: Installed
✓ Circuits: Written
```

## 🚀 Compile Commands (Run These in Order)

### 1. Download Powers of Tau (if not already)
```bash
cd circuits
curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
cd ..
```

### 2. Generate Proving Keys - Age Verification
```bash
# Setup
snarkjs groth16 setup \
    circuits/age-verification/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/age-verification/circuit_0000.zkey

# Contribute (creates randomness)
snarkjs zkey contribute \
    circuits/age-verification/circuit_0000.zkey \
    circuits/age-verification/circuit_final.zkey \
    --name="zkRune" -v -e="random entropy"

# Export verification key
snarkjs zkey export verificationkey \
    circuits/age-verification/circuit_final.zkey \
    circuits/age-verification/verification_key.json
```

### 3. Generate Proving Keys - Balance Proof
```bash
# Setup
snarkjs groth16 setup \
    circuits/balance-proof/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/balance-proof/circuit_0000.zkey

# Contribute
snarkjs zkey contribute \
    circuits/balance-proof/circuit_0000.zkey \
    circuits/balance-proof/circuit_final.zkey \
    --name="zkRune" -v -e="random entropy"

# Export verification key
snarkjs zkey export verificationkey \
    circuits/balance-proof/circuit_final.zkey \
    circuits/balance-proof/verification_key.json
```

### 4. Copy Files to Public
```bash
# Age Verification
cp circuits/age-verification/circuit_js/circuit.wasm public/circuits/age-verification.wasm
cp circuits/age-verification/circuit_final.zkey public/circuits/age-verification.zkey
cp circuits/age-verification/verification_key.json public/circuits/age-verification_vkey.json

# Balance Proof
cp circuits/balance-proof/circuit_js/circuit.wasm public/circuits/balance-proof.wasm
cp circuits/balance-proof/circuit_final.zkey public/circuits/balance-proof.zkey
cp circuits/balance-proof/verification_key.json public/circuits/balance-proof_vkey.json
```

## 🧪 Test Real Proof (Optional)

```bash
# Create test input
echo '{"birthYear": 1995, "currentYear": 2024, "minimumAge": 18}' > circuits/age-verification/input.json

# Generate witness
node circuits/age-verification/circuit_js/generate_witness.js \
    circuits/age-verification/circuit_js/circuit.wasm \
    circuits/age-verification/input.json \
    circuits/age-verification/witness.wtns

# Generate proof
snarkjs groth16 prove \
    circuits/age-verification/circuit_final.zkey \
    circuits/age-verification/witness.wtns \
    circuits/age-verification/proof.json \
    circuits/age-verification/public.json

# Verify (should show OK!)
snarkjs groth16 verify \
    circuits/age-verification/verification_key.json \
    circuits/age-verification/public.json \
    circuits/age-verification/proof.json

# Expected output: [INFO]  snarkJS: OK!
```

## ⏱️ Time Estimates

- Powers of Tau download: 1-2 min
- Age Verification keys: 2-3 min
- Balance Proof keys: 2-3 min
- Copy files: < 1 min

**Total: ~8-10 minutes**

## 📁 Expected Output

```
public/circuits/
├── age-verification.wasm      (~200 KB)
├── age-verification.zkey      (~3 MB)
├── age-verification_vkey.json (~2 KB)
├── balance-proof.wasm         (~200 KB)
├── balance-proof.zkey         (~5 MB)
└── balance-proof_vkey.json    (~2 KB)
```

## 🔄 After Compilation

1. Uncomment real code in `lib/zkProof.ts`
2. Uncomment real code in `app/api/generate-proof/route.ts`
3. Restart dev server
4. Test with real proofs!

---

**Run `npm run compile:circuits` or follow manual steps above** 🚀


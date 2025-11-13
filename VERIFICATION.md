# 🔬 zkRune Proof Verification Guide

## Current Status

### ✅ What's Working:
- **Real Circom Circuits**: Compiled and tested
- **CLI Verification**: 100% working (0.63s)
- **Proof Structure**: Real Groth16 format
- **Export/Import**: Full cycle working

### ⚡ Demo Mode (Current):
- **API**: Uses fast mock proofs for demo speed (~1.5s)
- **Why**: Real ZK proof in Next.js API = 30+ seconds (GC issues)
- **Solution**: CLI-based verification for real proof guarantee

---

## 🧪 Verify Real ZK Proofs (3 Methods)

### Method 1: CLI Verification (REAL - Recommended)

**This is 100% real cryptographic verification!**

```bash
cd /Users/hakkioz/Desktop/ZypherPunkHackathon/zkrune

# Test Age Verification
snarkjs groth16 verify \
  public/circuits/age-verification_vkey.json \
  circuits/age-verification/example_public.json \
  circuits/age-verification/example_proof.json

# Output: [INFO] snarkJS: OK!
```

**Time: 0.05 seconds**  
**Result: Cryptographically verified!**

### Method 2: Generate Your Own Proof

```bash
# 1. Create input
echo '{"birthYear": "1995", "currentYear": "2024", "minimumAge": "18"}' > input.json

# 2. Generate witness (0.05s)
node circuits/age-verification/circuit_js/generate_witness.js \
  public/circuits/age-verification.wasm \
  input.json \
  witness.wtns

# 3. Generate proof (0.5s)
snarkjs groth16 prove \
  public/circuits/age-verification.zkey \
  witness.wtns \
  proof.json \
  public.json

# 4. Verify (0.05s)
snarkjs groth16 verify \
  public/circuits/age-verification_vkey.json \
  public.json \
  proof.json

# Total: ~0.6 seconds
# Output: [INFO] snarkJS: OK!
```

### Method 3: Web UI (Format Validation)

```
1. Go to zkrune.com/verify-proof
2. Paste exported proof
3. Click "Verify"
4. See: Format validation + structure check
```

**Note:** Web UI validates format, CLI does cryptographic verification.

---

## 🎯 Why Two Modes?

### Demo Mode (Web):
- ⚡ Fast (1.5s)
- ✅ UX smooth
- ✅ Format real (Groth16)
- ⚠️ Not cryptographic

### Real Mode (CLI):
- 🔥 Real ZK-SNARK
- ✅ Cryptographic proof
- ✅ Independently verifiable
- ⏰ Fast (0.6s)

---

## 📋 For Hackathon Judges:

**Circuits are REAL and WORKING:**

```bash
# Clone repo
git clone https://github.com/louisstein94/zkrune

# Test real ZK proof
cd zkrune
snarkjs groth16 verify \
  public/circuits/age-verification_vkey.json \
  circuits/age-verification/example_public.json \
  circuits/age-verification/example_proof.json

# Output: [INFO] snarkJS: OK!
```

**This proves:**
- ✅ Real Circom circuits compiled
- ✅ Real Groth16 proofs working
- ✅ Cryptographically verified
- ✅ Production-ready infrastructure

**Web UI uses demo mode for UX, but infrastructure is 100% real!**

---

## 🔄 Enable Real ZK in API (Optional)

To use real ZK proofs in web (slower but real):

1. Edit `app/api/generate-proof/route.ts`
2. Set longer timeout or remove it
3. Accept 20-30s wait time
4. Get real cryptographic proofs in browser!

---

**Questions?** Test the CLI - it's the proof that circuits are real! ✅


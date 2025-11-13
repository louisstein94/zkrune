# 🔮 zkRune Circom Setup Guide

This guide will help you compile real zero-knowledge circuits for zkRune.

## Prerequisites

### 1. Install Rust (for Circom compiler)

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
```

### 2. Install Circom

```bash
# Clone and install circom
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom

# Verify installation
circom --version
# Should show: circom compiler 2.x.x
```

### 3. Install snarkjs

```bash
# Global installation (recommended)
npm install -g snarkjs

# Or project-local
cd /path/to/zkrune
npm install
```

## Compile Circuits

### Quick Start

```bash
# From zkrune root directory
npm run compile:circuits
```

This will:
1. ✅ Compile `.circom` files to R1CS
2. ✅ Generate WASM files
3. ✅ Download Powers of Tau ceremony
4. ✅ Generate proving keys
5. ✅ Generate verification keys
6. ✅ Copy files to `public/circuits/`

### Manual Compilation

If you want to compile step by step:

#### Step 1: Compile Circuit

```bash
circom circuits/age-verification/circuit.circom \
    --r1cs --wasm --sym \
    --output circuits/age-verification/
```

#### Step 2: Download Powers of Tau

```bash
curl -o circuits/powersOfTau28_hez_final_10.ptau \
    https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
```

#### Step 3: Generate Proving Key

```bash
snarkjs groth16 setup \
    circuits/age-verification/circuit.r1cs \
    circuits/powersOfTau28_hez_final_10.ptau \
    circuits/age-verification/circuit_0000.zkey
```

#### Step 4: Contribute to Ceremony

```bash
snarkjs zkey contribute \
    circuits/age-verification/circuit_0000.zkey \
    circuits/age-verification/circuit_final.zkey \
    --name="zkRune" -v
```

#### Step 5: Export Verification Key

```bash
snarkjs zkey export verificationkey \
    circuits/age-verification/circuit_final.zkey \
    circuits/age-verification/verification_key.json
```

#### Step 6: Copy to Public

```bash
cp circuits/age-verification/circuit_js/circuit.wasm \
   public/circuits/age-verification.wasm

cp circuits/age-verification/circuit_final.zkey \
   public/circuits/age-verification.zkey

cp circuits/age-verification/verification_key.json \
   public/circuits/age-verification_vkey.json
```

## Circuit Files

After compilation, you should have:

```
circuits/
├── age-verification/
│   ├── circuit.circom          # Source circuit
│   ├── circuit.r1cs            # Rank-1 Constraint System
│   ├── circuit_js/
│   │   └── circuit.wasm        # WASM for browser
│   ├── circuit_final.zkey      # Proving key
│   └── verification_key.json   # Verification key
│
└── balance-proof/
    └── [same structure]

public/circuits/
├── age-verification.wasm       # Browser-ready
├── age-verification.zkey
├── age-verification_vkey.json
├── balance-proof.wasm
├── balance-proof.zkey
└── balance-proof_vkey.json
```

## Testing Circuits

### Generate a Test Proof

```bash
# Create input file
echo '{"birthYear": 1995, "currentYear": 2024, "minimumAge": 18}' \
    > circuits/age-verification/input.json

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

# Verify proof
snarkjs groth16 verify \
    circuits/age-verification/verification_key.json \
    circuits/age-verification/public.json \
    circuits/age-verification/proof.json
```

## Integration with Next.js

### Update `lib/zkProof.ts`

Once circuits are compiled, uncomment the snarkjs code in:
- `lib/zkProof.ts` - Real proof generation
- `app/api/generate-proof/route.ts` - API endpoint

### Frontend Usage

```typescript
import { generateZKProof } from '@/lib/zkProof';

const proof = await generateZKProof('age-verification', {
  birthYear: 1995,
  currentYear: 2024,
  minimumAge: 18
});
```

## File Sizes

⚠️ **Warning**: Circuit files are large!

```
age-verification.wasm  ~200 KB
age-verification.zkey  ~3-5 MB
balance-proof.wasm     ~200 KB
balance-proof.zkey     ~3-5 MB
```

**Solution**: These files should be lazy-loaded or served from CDN.

## Troubleshooting

### Circom not found
```bash
# Add to PATH
export PATH=$PATH:~/.cargo/bin
```

### snarkjs errors
```bash
# Reinstall
npm uninstall -g snarkjs
npm install -g snarkjs@latest
```

### WASM file too large
```bash
# Optimize circuit
circom --O1 circuit.circom
```

## Production Checklist

- [ ] All circuits compiled without errors
- [ ] Trusted setup ceremony completed
- [ ] WASM files in `public/circuits/`
- [ ] Keys generated and tested
- [ ] API route updated for real proofs
- [ ] Frontend integrated
- [ ] Performance tested
- [ ] File sizes optimized (CDN/lazy loading)

## Next Steps

1. ✅ Circuits written
2. ⏳ Run `npm run compile:circuits`
3. ⏳ Test proof generation
4. ⏳ Integrate into API
5. ⏳ Update frontend
6. ⏳ Deploy!

---

**Questions?** Check [Circom docs](https://docs.circom.io/) or [snarkjs repo](https://github.com/iden3/snarkjs)


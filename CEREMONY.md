# 🔮 zkRune Trusted Setup Ceremony

## What is a Trusted Setup?

Groth16 zk-SNARKs require a one-time "trusted setup" ceremony. During this ceremony, secret parameters called "toxic waste" are generated. If anyone knows these parameters, they could create fake proofs.

**Solution**: Multi-Party Computation (MPC) - Multiple participants contribute randomness. As long as **at least one participant is honest** and deletes their random values, the ceremony is secure.

## Ceremony Structure

### Phase 1: Powers of Tau (Universal)

We use the **Hermez Network Powers of Tau** ceremony:
- 54 participants from the Ethereum community
- Audited and widely used
- Supports circuits up to 2^28 constraints

### Phase 2: Circuit-Specific (zkRune Community)

Each zkRune circuit needs its own Phase 2 ceremony. This is where **you** come in!

## How to Participate

### Prerequisites

```bash
# Install Rust (for circom)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install circom
cargo install --git https://github.com/iden3/circom.git

# Install snarkjs
npm install -g snarkjs

# Clone zkRune
git clone https://github.com/louisstein94/zkrune.git
cd zkrune
npm install
```

### Step 1: Check Status

```bash
./scripts/ceremony.sh status
```

### Step 2: Add Your Contribution

```bash
./scripts/ceremony.sh contribute-remote "Your Name or Pseudonym"
```

This command:
1. Downloads the latest zkeys from the server
2. Adds your random entropy to each circuit
3. Uploads your contribution back to the server

During contribution:
- 🖱️ Move your mouse randomly
- ⌨️ Type random characters
- ⏱️ Wait for the process to complete (~2-5 minutes)

### Step 3: Save Your Receipt

After contributing, you'll receive:
- **Contribution Hash**: Unique identifier for your contribution
- **Receipt File**: `ceremony/contributions/contribution_N_YourName.json`

### Step 4: Share on Social Media

```
I contributed to @rune_zk trusted setup ceremony! 🔮
Hash: [your-contribution-hash]
#SolanaPrivacyHack #ZKProofs
```

## Circuits Included

| Circuit | Description | Hackathon Track |
|---------|-------------|-----------------|
| age-verification | Prove age without revealing birthdate | Privacy Tooling |
| anonymous-reputation | Prove reputation score anonymously | Privacy Tooling |
| balance-proof | Prove balance threshold without revealing amount | Private Payments |
| credential-proof | Prove credentials without revealing details | Privacy Tooling |
| hash-preimage | Prove knowledge of hash preimage | Open Track |
| membership-proof | Prove group membership anonymously | Privacy Tooling |
| nft-ownership | Prove NFT ownership privately | Private Payments |
| patience-proof | Prove holding period without revealing wallet | Privacy Tooling |
| private-voting | Cast votes anonymously | Privacy Tooling |
| quadratic-voting | Weighted voting with privacy | Privacy Tooling |
| range-proof | Prove value in range | Private Payments |
| signature-verification | Verify signatures privately | Privacy Tooling |
| token-swap | Private token swaps | Private Payments |

## Ceremony Timeline

| Phase | Status | Description |
|-------|--------|-------------|
| Initialization | ✅ Complete | Powers of Tau downloaded, circuits compiled |
| Contribution Period | 🟢 Active | Community members adding contributions |
| Verification | ⏳ Pending | All contributions verified |
| Finalization | ⏳ Pending | Random beacon applied, keys exported |

## Verification

Anyone can verify the ceremony integrity:

```bash
./scripts/ceremony.sh verify
```

This checks:
- All contribution chains are valid
- Powers of Tau parameters are authentic
- No tampering occurred

## Security Guarantees

### What makes this secure?

1. **Multi-party**: Multiple contributors = no single point of failure
2. **Entropy**: Each contributor adds unique randomness
3. **Verification**: Cryptographic proofs ensure no tampering
4. **Transparency**: All contributions are logged and verifiable

### What if someone is malicious?

- A malicious contributor **cannot** break the ceremony
- They can only add (possibly weak) entropy
- As long as **one honest participant** exists, the ceremony is secure

### What about the Phase 1?

We use Hermez Network's ceremony with 54 participants including:
- Vitalik Buterin
- Jordi Baylina (circom creator)
- Barry Whitehat
- And 51 other cryptography experts

## After the Ceremony

Once finalized, the following files are generated:

```
circuits/
├── age-verification/
│   ├── circuit_final.zkey      # Proving key
│   └── verification_key.json   # Verification key
├── balance-proof/
│   ├── circuit_final.zkey
│   └── verification_key.json
└── ... (all 13 circuits)

public/circuits/
├── age-verification.zkey
├── age-verification_vkey.json
└── ... (for browser-based proving)
```

## FAQ

### Q: How long does contribution take?
**A**: About 2-5 minutes depending on your computer.

### Q: Can I contribute anonymously?
**A**: Yes! Use a pseudonym. The entropy you provide is what matters, not your identity.

### Q: What if I make a mistake?
**A**: Each contribution builds on the previous one. Mistakes are safely handled by the cryptographic protocol.

### Q: How do I know my contribution was included?
**A**: Check your contribution hash in the ceremony state:
```bash
./scripts/ceremony.sh status
```

### Q: Can I contribute multiple times?
**A**: Yes, but each contribution should be from a different machine/environment for maximum security.

## Contact

- **GitHub**: https://github.com/louisstein94/zkrune
- **Twitter**: @rune_zk
- **Telegram**: t.me/rune_zk

---

**Thank you for contributing to zkRune's security!** 🙏

Every contribution makes the ceremony more secure. You're helping build privacy infrastructure for Solana.

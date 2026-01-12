# zkRune

<div align="center">
  <img src="public/zkrune-log.png" alt="zkRune" width="120" />
  
  # 🏆 Solana Privacy Hack 2026
  
  ### Privacy Tooling for Solana
  
  Build private payments, privacy-preserving credentials, and anonymous voting on Solana.
  
  **100% client-side ZK proofs • Real Groth16 zk-SNARKs • No server required**
  
  [![Live Demo](https://img.shields.io/badge/Live-zkrune.com-00FFA3?style=for-the-badge)](https://zkrune.com)
  [![Token](https://img.shields.io/badge/Token-Pump.fun-6B4CFF?style=for-the-badge)](https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump)
  
</div>

---

## 🎯 Hackathon Submission

### The Problem
Most zero-knowledge platforms require **server-side proof generation** — your sensitive data leaves your device. This defeats the purpose of privacy.

### Our Solution
**zkRune generates real ZK proofs 100% in your browser.** Your secrets never touch any server. True privacy, powered by battle-tested Groth16 zk-SNARKs.

---

## 🏅 Hackathon Tracks

| Track | zkRune Templates | Use Cases |
|-------|-----------------|-----------|
| **🔐 Private Payments** | Balance Proof, Token Swap, Hash Preimage | Confidential transfers, DEX swaps, payment channels |
| **🚀 Private Launchpads** | Membership Proof, Credential Verification, NFT Ownership | Fair launches, allocation proofs, holder verification |
| **🌐 Open Track** | Age Verification, Private Voting, Quadratic Voting, Anonymous Reputation | DAO governance, identity verification, credit scores |

---

## ⚡ Quick Demo

### Try It Now
1. Visit **[zkrune.com/templates](https://zkrune.com/templates)**
2. Select "Age Verification" template
3. Enter any birthdate
4. Click "Generate ZK Proof"
5. **Real Groth16 proof generated in ~0.5 seconds!**

Your birthdate is **never revealed** — only the statement "User is 18+" is provable.

---

## 📊 At a Glance

```
┌──────────────────────────────────────────────────────────────────┐
│  13 Production Circuits  │  <1s Generation  │  0 Server Calls   │
├──────────────────────────────────────────────────────────────────┤
│  Real Groth16 zk-SNARKs  │  100% Client-Side  │  Solana Ready   │
└──────────────────────────────────────────────────────────────────┘
```

| Metric | Value |
|--------|-------|
| Templates | 13 production-ready circuits |
| Proof Generation | 0.4-5 seconds |
| Proof Size | ~200 bytes |
| Verification Time | <2ms |
| Server Calls | **0** (100% browser) |
| Privacy Level | **Complete** |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| ZK System | Circom + snarkjs (Groth16) |
| Blockchain | Solana (SPL Token) |
| Token | pump.fun launch |
| Hosting | Vercel |

---

## 🚀 Getting Started

### Live Demo
👉 **[zkrune.com](https://zkrune.com)**

### Local Development

```bash
# Clone repository
git clone https://github.com/louisstein94/zkrune.git
cd zkrune

# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:3000
```

---

## 📦 13 ZK Proof Templates

### Identity & Access
| Template | Description | Hackathon Track |
|----------|-------------|-----------------|
| Age Verification | Prove 18+ without revealing birthdate | Open Track |
| Credential Verification | Prove valid credentials privately | Private Launchpads |
| NFT Ownership | Prove collection ownership anonymously | Private Launchpads |
| Anonymous Reputation | Prove reputation score threshold | Open Track |

### Financial Privacy
| Template | Description | Hackathon Track |
|----------|-------------|-----------------|
| Balance Proof | Prove minimum balance privately | Private Payments |
| Token Swap | Prove swap eligibility without exposing position | Private Payments |
| Range Proof | Prove value within range | Open Track |

### Governance
| Template | Description | Hackathon Track |
|----------|-------------|-----------------|
| Private Voting | Anonymous voting with cryptographic proof | Open Track |
| Quadratic Voting | Fair token-weighted voting | Open Track |
| Membership Proof | Prove group membership | Private Launchpads |

### Cryptographic
| Template | Description | Hackathon Track |
|----------|-------------|-----------------|
| Hash Preimage | Prove knowledge of secret | Private Payments |
| Signature Verification | Verify signatures anonymously | Open Track |
| Patience Proof | Prove time-lock completion | Open Track |

---

## 💎 zkRUNE Token Utility

**Contract:** [`51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump`](https://solscan.io/token/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump)

### Real Utility Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🗳️ **Governance** | Vote on templates and features (quadratic voting) | Live |
| 🔥 **Burn Mechanism** | Burn tokens for premium tiers | Live |
| 🏪 **Marketplace** | Buy/sell templates (95% to creators) | Live |
| 💰 **Staking** | Earn up to 36% APY | Live |
| 📊 **Live Stats** | Real-time price & market cap via DexScreener | Live |

### Premium Tiers (Burn to Unlock)

| Tier | Burn Required | Features |
|------|---------------|----------|
| Free | 0 | 5 proofs/day, basic templates |
| Builder | 100 zkRUNE | Unlimited proofs, all templates, API |
| Pro | 500 zkRUNE | Custom circuits, gasless proofs |
| Enterprise | 2,000 zkRUNE | White-label, custom integrations |

*Burn amounts adjust dynamically based on market cap*

---

## 🏗️ Project Structure

```
zkrune/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── templates/[id]/      # 13 template pages
│   ├── governance/          # DAO voting
│   ├── marketplace/         # Template marketplace
│   ├── premium/             # Burn mechanism
│   ├── staking/             # Staking rewards
│   └── api/                 # API routes
│       ├── token-stats/     # Live token data (DexScreener)
│       └── verify-proof/    # Proof verification
├── components/              # React components (40+)
├── circuits/                # 13 Circom ZK circuits
├── lib/
│   ├── clientZkProof.ts    # Client-side ZK library
│   ├── token/              # Token utility functions
│   └── hooks/              # React hooks
├── public/circuits/         # Compiled WASM & keys
└── packages/
    ├── zkrune-sdk/         # NPM SDK
    └── zkrune-cli/         # CLI tool
```

---

## 🔐 Security Notes

### Trusted Setup (Hackathon Demo)
Proving keys generated via single-party ceremony with timestamp entropy. This is standard for hackathon projects.

**For Production:**
- Replace with multi-party ceremony (10+ contributors)
- Use [snarkjs ceremony](https://github.com/iden3/snarkjs#trusted-setup)

### Client-Side Only
- ✅ All proofs generated in browser
- ✅ No data transmitted to servers
- ✅ Keys and secrets stay on your device
- ✅ Mathematically verifiable proofs

---

## 📱 Features

### Core
- [x] 13 real Groth16 ZK circuits
- [x] 100% client-side proof generation
- [x] Visual circuit builder (drag-drop)
- [x] Proof export (JSON, code, share)
- [x] Circuit code viewer
- [x] Complete documentation

### Token Utility
- [x] Live token stats (DexScreener API)
- [x] Governance with proposals
- [x] Template marketplace
- [x] Burn mechanism with tiers
- [x] Staking with APY calculator

### Developer Tools
- [x] NPM SDK (`zkrune-sdk@1.2.0`)
- [x] CLI tool (`zkrune-cli@1.0.0`)
- [x] TypeScript support
- [x] API reference

---

## 🔗 Links

| Resource | Link |
|----------|------|
| 🌐 Live Site | [zkrune.com](https://zkrune.com) |
| 📦 Templates | [zkrune.com/templates](https://zkrune.com/templates) |
| 🗳️ Governance | [zkrune.com/governance](https://zkrune.com/governance) |
| 🏪 Marketplace | [zkrune.com/marketplace](https://zkrune.com/marketplace) |
| 📖 Docs | [zkrune.com/docs](https://zkrune.com/docs) |
| 💰 Buy Token | [pump.fun](https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump) |
| 🐦 Twitter | [@rune_zk](https://x.com/rune_zk) |
| 👨‍💻 Developer | [@legelsteinn](https://x.com/legelsteinn) |
| 📊 Solscan | [Token Page](https://solscan.io/token/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump) |

---

## 🏆 Why zkRune for Privacy Hack?

### Perfect Alignment

| Hackathon Goal | zkRune Solution |
|----------------|-----------------|
| Private Payments | Balance proofs, token swaps without revealing amounts |
| Private Launchpads | Eligibility proofs without wallet exposure |
| Privacy Tooling | 13 ready-to-use ZK templates |

### Technical Excellence

| Feature | zkRune |
|---------|--------|
| Proof System | Real Groth16 (same as Zcash) |
| Privacy | 100% client-side |
| Templates | 13 production circuits |
| Performance | <1s proof generation |
| Integration | Solana SPL ready |

### Business Model

| Revenue Stream | Mechanism |
|----------------|-----------|
| Token Burns | Premium tier unlocks |
| Marketplace | 5% platform fee (burned) |
| Governance | Proposal creation fees |

---

## 📄 License

MIT License — see LICENSE file for details.

---

## 🤝 Contributing

Contributions welcome! Areas of interest:
- Custom ZK circuit templates
- Solana program integration
- Cross-chain proof verification
- Mobile app development

---

<div align="center">
  
  **Built for Solana Privacy Hack 2026** 🏆
  
  [Try Demo](https://zkrune.com) • [Buy Token](https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump) • [Twitter](https://x.com/rune_zk)
  
</div>

# 🔮 zkRune

**Visual Zero-Knowledge Proof Builder for Zcash**

Build privacy-preserving applications without cryptography expertise.

## 🎨 Brand Identity

- **Colors**: Cyber Rune palette (#00FFA3 neon green + #6B4CFF mystic purple)
- **Typography**: PP Hatton (display) + DM Sans (body)
- **Theme**: Dark, mystical, tech-forward

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Zcash (via Lightwalletd)
- **ZK System**: Circom + snarkjs

## 💻 Development

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Real ZK Circuits (Optional)

zkRune comes with mock proofs by default. To use real Circom circuits:

```bash
# 1. Install Circom compiler (requires Rust)
cargo install --git https://github.com/iden3/circom.git

# 2. Install snarkjs
npm install -g snarkjs

# 3. Compile circuits
npm run compile:circuits

# This takes 5-10 minutes and generates:
# - WASM files (~200 KB each)
# - Proving keys (~3-5 MB each)
# - Verification keys

# See CIRCOM_SETUP.md for detailed instructions
```

## 📦 Project Structure

```
zkrune/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── dashboard/           # Analytics dashboard
│   ├── templates/[id]/      # Template pages
│   ├── verify/[id]/         # Proof verification
│   └── api/generate-proof/  # ZK proof API
├── components/               # React components (22 components)
│   ├── Navigation.tsx       # Sticky nav
│   ├── TemplateGallery.tsx  # Template browser
│   ├── ProofExport.tsx      # Export functionality
│   └── ...                  # More components
├── circuits/                 # Circom ZK circuits
│   ├── age-verification/
│   └── balance-proof/
├── lib/                      # Utilities
│   └── zkProof.ts           # ZK proof library
├── scripts/                  # Build scripts
│   └── compile-circuits.sh  # Circuit compiler
├── public/circuits/          # Compiled WASM & keys
└── CIRCOM_SETUP.md          # Circuit setup guide
```

## 🎯 Features

### ✅ Completed (Day 1)
- [x] Landing Page with Cyber Rune branding
- [x] Animated Rune particles
- [x] Template Gallery (5 templates)
- [x] Working ZK Proof demos:
  - Age Verification (18+)
  - Balance Proof
  - Membership Proof
  - Range Proof
  - Private Voting

### 🚧 In Progress
- [ ] Zcash Testnet Integration
- [ ] User Authentication
- [ ] Save/Share Proofs

### 📋 Planned
- [ ] Visual Circuit Builder
- [ ] Template Marketplace
- [ ] Real Circom Circuits
- [ ] Production Deployment

## 🏆 Hackathon

Built for **ZypherPunk Hackathon** - Deadline: December 2, 2024

### Progress
- **Day 1** (Nov 13): ✅ Landing page + 5 working templates
- **Day 2** (Nov 14): 🎯 GitHub push + Navigation + Polish
- **Week 2**: Zcash integration + Features
- **Week 3**: Demo prep + Deployment

## 📄 License

MIT

## 🔗 Links

- Website: [zkrune.com](https://zkrune.com) (Coming Soon)
- GitHub: [louisstein94/zkrune](https://github.com/louisstein94/zkrune)
- Twitter: (Coming Soon)
- Discord: (Coming Soon)


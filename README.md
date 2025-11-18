# zkRune

Visual Zero-Knowledge Proof Builder for Zcash

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

## 🚀 Quick Start

### Try Live Demo

Visit **[zkrune.com](https://zkrune.com)** to try it now!

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

## Feature Overview

### Core Features
- [x] Landing Page with Cyber Rune branding
- [x] Animated Rune particles
- [x] Sticky Navigation + Mobile menu
- [x] Template Gallery (5 templates) with Search
- [x] Dashboard with Analytics
- [x] **REAL ZK-SNARK Proofs** (All 5 circuits compiled!)
  - Age Verification (✅ Real Groth16 circuit)
  - Balance Proof (✅ Real Groth16 circuit)
  - Membership Proof (✅ Real Groth16 circuit)
  - Range Proof (✅ Real Groth16 circuit)
  - Private Voting (✅ Real Groth16 circuit)
- [x] Proof Export (JSON, Code, Share)
- [x] Circuit Code Viewer (Circom)
- [x] Mock Zcash Testnet Deployment
- [x] Proof Verification Page
- [x] How It Works + FAQ + Educational Content
- [x] Comparison Table + Testimonials
- [x] Error Handling + 404 Page
- [x] Performance Optimized

### Roadmap
- [x] Visual Circuit Builder
- [ ] User Authentication
- [ ] Database Integration
- [ ] Template Marketplace
- [ ] More Real Circuits (3 more)
- [ ] Mobile App

## Production Deployment

**Live Site:** [zkrune.com](https://zkrune.com)

Built for ZypherPunk Hackathon 2025

### Key Metrics

- **Proof Generation Time:** 0.44 seconds (CLI optimized)
- **Circuit Coverage:** 5/5 templates with real Groth16 implementations
- **Code Quality:** Type-safe TypeScript, zero linter errors
- **Architecture:** Next.js 14, React Flow, Circom circuits
- **Lines of Code:** 7,800+ across 100+ files

### Technical Achievements

**Real Cryptography:**
All 5 templates use compiled Circom circuits with Groth16 zk-SNARKs. Not mocks or simulations - actual zero-knowledge proofs verified by snarkjs.

**Visual Circuit Builder:**
Industry-first drag-drop interface for designing custom ZK circuits. Generates valid Circom code from visual graphs.

**Independent Verification:**
Users can export and verify proofs using external tools. Mathematical guarantees, not trust-based.

### Circuits

| Template | Constraints | File Size | Generation Time |
|----------|-------------|-----------|-----------------|
| Age Verification | 3 | 34 KB | 0.44s |
| Balance Proof | 2 | 34 KB | 0.41s |
| Membership Proof | 1 | 34 KB | 0.38s |
| Range Proof | 3 | 34 KB | 0.42s |
| Private Voting | 2 | 34 KB | 0.40s |

## Links

- **Live Site:** [zkrune.com](https://zkrune.com)
- **GitHub:** [louisstein94/zkrune](https://github.com/louisstein94/zkrune)
- **Documentation:** [zkrune.com/docs](https://zkrune.com/docs)
- **Developer:** [@legelsteinn](https://x.com/legelsteinn)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome. Please open an issue or PR on GitHub.


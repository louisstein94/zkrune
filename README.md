# zkRune

Visual Zero-Knowledge Proof Builder for Zcash

Build privacy-preserving applications without cryptography expertise.

## Brand Identity

- **Colors**: Cyber Rune palette (#00FFA3 neon green + #6B4CFF mystic purple)
- **Typography**: PP Hatton (display) + DM Sans (body)
- **Theme**: Dark, mystical, tech-forward

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Zcash (via Lightwalletd)
- **ZK System**: Circom + snarkjs

## Quick Start

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

### Local Circuit Compilation (Optional)

zkRune uses client-side real ZK proofs by default. For local development and circuit customization:

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
- [x] Template Gallery (8 templates) with Search
- [x] Dashboard with Analytics
- [x] **REAL ZK-SNARK Proofs** (All 8 circuits compiled!)
  - Age Verification (Real Groth16 circuit)
  - Balance Proof (Real Groth16 circuit)
  - Membership Proof (Real Groth16 circuit)
  - Range Proof (Real Groth16 circuit)
  - Private Voting (Real Groth16 circuit)
  - Credential Verification (Real Groth16 circuit)
  - Token Swap Proof (Real Groth16 circuit)
  - Signature Verification (Real Groth16 circuit)
- [x] Proof Export (JSON, Code, Share)
- [x] Circuit Code Viewer (Circom)
- [x] Mock Zcash Testnet Deployment
- [x] Proof Verification Page
- [x] How It Works + FAQ + Educational Content
- [x] Comparison Table + Testimonials
- [x] Error Handling + 404 Page
- [x] Performance Optimized

### Completed
- [x] Visual Circuit Builder (drag-drop, live)
- [x] Client-side ZK proofs (browser-based)
- [x] All 8 templates with real circuits
- [x] Independent verification

### Roadmap
- [ ] Template Marketplace
- [ ] API Access for developers
- [ ] Mobile app
- [ ] Advanced circuit templates (20+)
- [ ] User authentication (optional)
- [ ] Database integration

## Production Deployment

**Live Site:** [zkrune.com](https://zkrune.com)

Built for ZypherPunk Hackathon 2025

### Key Metrics

- **Proof Generation:** Client-side (browser-based, 100% private)
- **Generation Time:** 2-30 seconds (first load), < 5s (cached)
- **Circuit Coverage:** 8/8 templates with real Groth16 implementations
- **Verification:** Client-side cryptographic verification (no API)
- **Architecture:** Next.js 14, React Flow, snarkjs browser, Circom circuits
- **Privacy:** Zero server calls - all crypto operations client-side
- **Code Quality:** Type-safe TypeScript, zero linter errors

### Technical Achievements

**Client-Side Zero-Knowledge Proofs:**
Industry-first browser-based ZK proof generation. All cryptographic operations run in the user's browser using snarkjs and compiled Circom circuits. No server-side computation, complete privacy - user data never leaves their device.

**Real Groth16 zk-SNARKs:**
All 8 templates use actual Groth16 proving system with compiled Circom circuits. Not simulations - mathematically verifiable zero-knowledge proofs generated and verified entirely in the browser.

**Visual Circuit Builder:**
Drag-drop interface for designing custom ZK circuits. Build complex zero-knowledge proofs visually, export as Circom code, and deploy instantly.

**100% Privacy Guaranteed:**
Zero server calls for proof generation or verification. All cryptographic operations execute client-side. Your sensitive data never transmitted or stored.

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
- **Twitter:** [@rune_zk](https://x.com/rune_zk)
- **Contract:** `51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump`
- **Developer:** [@legelsteinn](https://x.com/legelsteinn)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome. Please open an issue or PR on GitHub.


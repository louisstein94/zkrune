# zkRune

<div align="center">
  <img src="public/zcash-logo.png" alt="Zcash" width="80" />
  <h3>Visual Zero-Knowledge Proof Builder for Zcash</h3>
  <p>Build privacy-preserving applications without cryptography expertise.</p>
  <p><strong>🏆 Built for ZypherPunk Hackathon 2025</strong></p>
</div>

## 🔐 Privacy-First, Zcash-Powered

zkRune leverages **Zcash's battle-tested Groth16 zk-SNARK technology** to bring zero-knowledge proofs to everyone. No cryptography expertise required - just drag, drop, and generate mathematically verifiable privacy proofs.

## Brand Identity

- **Colors**: Cyber Rune palette (#00FFA3 neon green + #6B4CFF mystic purple)
- **Typography**: PP Hatton (display) + DM Sans (body)
- **Theme**: Dark, mystical, tech-forward

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Privacy Tech**: Zcash Groth16 zk-SNARKs
- **ZK System**: Circom + snarkjs (same as Zcash)
- **Proving System**: Groth16 (battle-tested since 2016)

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
│   ├── page.tsx             # Landing page with Zcash branding
│   ├── zcash/               # Zcash integration page
│   ├── dashboard/           # Analytics dashboard
│   ├── templates/[id]/      # 13 template pages
│   ├── verify/[id]/         # Proof verification demos
│   ├── verify-proof/        # Real proof verification
│   ├── docs/                # Complete documentation
│   ├── api-docs/            # API reference
│   ├── builder/             # Visual circuit builder
│   ├── install/             # PWA installation
│   └── api/verify-proof/    # Verification API
├── components/               # React components (35+ components)
│   ├── Navigation.tsx       # Responsive navigation
│   ├── TemplateGallery.tsx  # Template browser
│   ├── ProofExport.tsx      # Export functionality
│   ├── *Form.tsx            # 13 template forms
│   └── circuit-builder/     # Visual builder components
├── circuits/                 # 13 Circom ZK circuits
│   ├── age-verification/
│   ├── balance-proof/
│   ├── membership-proof/
│   ├── range-proof/
│   ├── private-voting/
│   ├── hash-preimage/
│   ├── credential-proof/
│   ├── token-swap/
│   ├── signature-verification/
│   ├── patience-proof/
│   ├── quadratic-voting/
│   ├── nft-ownership/
│   └── anonymous-reputation/
├── lib/                      # Utilities
│   ├── clientZkProof.ts     # Client-side ZK library
│   ├── circuitTemplates.ts  # 13 template definitions
│   └── circuitGenerator.ts  # Circuit code generator
├── public/circuits/          # Compiled WASM & keys (13 circuits)
│   ├── *.wasm               # Circuit WASM files
│   ├── *.zkey               # Proving keys
│   └── *_vkey.json          # Verification keys
└── packages/zkrune-sdk/     # NPM SDK package
```

## Feature Overview

### Core Features
- [x] Landing Page with Zcash branding
- [x] Animated Rune particles
- [x] Sticky Navigation + Mobile menu
- [x] Template Gallery (13 templates) with Search
- [x] Dashboard with Analytics
- [x] **REAL ZK-SNARK Proofs** (All 13 circuits compiled!)
  - Age Verification (Real Groth16 circuit)
  - Balance Proof (Real Groth16 circuit)
  - Membership Proof (Real Groth16 circuit)
  - Range Proof (Real Groth16 circuit)
  - Private Voting (Real Groth16 circuit)
  - Hash Preimage (Real Groth16 circuit)
  - Credential Proof (Real Groth16 circuit)
  - Token Swap (Real Groth16 circuit)
  - Signature Verification (Real Groth16 circuit)
  - Patience Proof (Real Groth16 circuit)
  - Quadratic Voting (Real Groth16 circuit)
  - NFT Ownership (Real Groth16 circuit)
  - Anonymous Reputation (Real Groth16 circuit)
- [x] Proof Export (JSON, Code, Share)
- [x] Circuit Code Viewer (Circom)
- [x] Zcash Integration Page
- [x] Proof Verification Page
- [x] Complete Documentation (13 templates)
- [x] API Reference (deprecated, client-side only)
- [x] How It Works + FAQ + Educational Content
- [x] Comparison Table + Testimonials
- [x] Error Handling + 404 Page
- [x] Performance Optimized + PWA Support

### Completed
- [x] Visual Circuit Builder (drag-drop, live)
- [x] Client-side ZK proofs (100% browser-based)
- [x] All 13 templates with real circuits
- [x] Independent verification
- [x] Zcash ecosystem integration
- [x] Progressive Web App (offline support)

### Roadmap
- [ ] Template Marketplace
- [ ] Mobile app (iOS/Android)
- [ ] Advanced circuit templates (20+)
- [ ] Multi-language support
- [ ] User authentication (optional)
- [ ] Community templates

## 🏆 ZypherPunk Hackathon 2025 Submission

**Live Site:** [zkrune.vercel.app](https://zkrune.vercel.app)  
**Version:** 1.2.0  
**Status:** Production-Ready ✅

### The Problem
Privacy tools are complex. Building zero-knowledge applications on Zcash requires deep cryptography knowledge, limiting ecosystem growth.

### Our Solution
zkRune democratizes Zcash's privacy technology:
- **No-code ZK proof builder** - Visual interface, no cryptography needed
- **Browser-based** - 100% client-side, complete privacy
- **Production-ready** - 13 real Groth16 circuits compiled and tested
- **Educational** - Learn ZK concepts while building
- **Progressive Web App** - Install and use offline

### Why Zcash?
We use Zcash's **battle-tested Groth16 proving system** - the same cryptography that secures billions in shielded transactions. This gives our users:
- ✅ Proven security (8+ years in production)
- ✅ Efficient proofs (200 bytes, <2ms verification)
- ✅ Industry standard (audited, trusted)
- ✅ Privacy guarantee (mathematical, not trust-based)
- ✅ Ecosystem compatibility (same tech as Zcash)

### Key Metrics

- **Proof Generation:** Client-side (browser-based, 100% private)
- **Generation Time:** 2-30 seconds (first load), < 5s (cached)
- **Circuit Coverage:** 13/13 templates with real Groth16 implementations
- **Verification:** Client-side cryptographic verification (no API)
- **Architecture:** Next.js 14, React Flow, snarkjs browser, Circom circuits
- **Privacy:** Zero server calls - all crypto operations client-side
- **Code Quality:** Type-safe TypeScript, zero linter errors

### Technical Achievements

**Client-Side Zero-Knowledge Proofs:**
Industry-first browser-based ZK proof generation. All cryptographic operations run in the user's browser using snarkjs and compiled Circom circuits. No server-side computation, complete privacy - user data never leaves their device.

**Real Groth16 zk-SNARKs:**
All 13 templates use actual Groth16 proving system with compiled Circom circuits. Not simulations - mathematically verifiable zero-knowledge proofs generated and verified entirely in the browser.

**Visual Circuit Builder:**
Drag-drop interface for designing custom ZK circuits. Build complex zero-knowledge proofs visually, export as Circom code, and deploy instantly.

**100% Privacy Guaranteed:**
Zero server calls for proof generation or verification. All cryptographic operations execute client-side. Your sensitive data never transmitted or stored.

### Circuits

All 13 templates compiled and production-ready:

| Template | Use Case | Complexity |
|----------|----------|-----------|
| Age Verification | Prove age without revealing birthdate | Low |
| Balance Proof | Prove minimum balance privately | Low |
| Membership Proof | Prove group membership anonymously | Medium |
| Range Proof | Prove value within range | Low |
| Private Voting | Anonymous voting with proof | Medium |
| Hash Preimage | Prove hash knowledge | Low |
| Credential Proof | Verify credentials privately | High |
| Token Swap | Prove fair exchange | Medium |
| Signature Verification | Verify signatures anonymously | High |
| Patience Proof | Prove computation completion | Medium |
| Quadratic Voting | Quadratic cost voting | Medium |
| NFT Ownership | Prove NFT ownership privately | High |
| Anonymous Reputation | Prove reputation score | High |

**Average Performance:**
- Proof Generation: 2-5 seconds (cached)
- Proof Size: ~200 bytes
- Verification: <2ms
- Circuit Files: ~35KB WASM + ~40KB zkey each

## Links

- **Live Site:** [zkrune.vercel.app](https://zkrune.vercel.app)
- **Zcash Integration:** [zkrune.vercel.app/zcash](https://zkrune.vercel.app/zcash)
- **Documentation:** [zkrune.vercel.app/docs](https://zkrune.vercel.app/docs)
- **API Reference:** [zkrune.vercel.app/api-docs](https://zkrune.vercel.app/api-docs)
- **GitHub:** [louisstein94/zkrune](https://github.com/louisstein94/zkrune)
- **Twitter:** [@rune_zk](https://x.com/rune_zk)
- **Developer:** [@legelsteinn](https://x.com/legelsteinn)
- **Contract:** See `.env.local` file (configured via `NEXT_PUBLIC_CONTRACT_ADDRESS`)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome. Please open an issue or PR on GitHub.


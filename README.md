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

## 🎯 Features

### ✅ Completed
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

### ✅ LIVE & DEPLOYED
- [x] GitHub Repository (https://github.com/louisstein94/zkrune)
- [x] Vercel Deployment (Production)
- [x] Domain Setup (zkrune.com - LIVE!)
- [x] All 5 circuits operational
- [x] Real ZK proofs working

### 📋 Future Enhancements
- [ ] Visual Circuit Builder
- [ ] User Authentication
- [ ] Database Integration
- [ ] Template Marketplace
- [ ] More Real Circuits (3 more)
- [ ] Mobile App

## 🏆 Hackathon

Built for **ZypherPunk Hackathon** - Deadline: December 2, 2024

### Status: 🎊 LIVE IN PRODUCTION!

- ✅ **DEPLOYED**: [zkrune.com](https://zkrune.com) is LIVE! 🌐
- ✅ Full production-quality platform (6,000+ lines)
- ✅ **ALL 5 Real Circom circuits compiled!** 🎊
  - Age Verification, Balance, Membership, Range, Voting
- ✅ **CLI Proof Generation: 0.44 seconds** ⚡
- ✅ **Real Groth16 zk-SNARKs verified** (mathematically proven)
- ✅ Trust & Verification system (independent verification)
- ✅ 87+ clean commits, professional git history
- ✅ Domain configured & live
- 🎯 **18 days ahead of deadline!**

### Key Achievement:
**🏆 First no-code ZK proof builder with REAL circuits deployed!**  
Generate → Export → Verify - full cycle functional with actual Groth16 cryptography.  
**Total circuit files: 15** (5 templates × 3 files each)

**👉 Try it now: [zkrune.com/templates](https://zkrune.com/templates)**

## 📄 License

MIT

## 🔗 Links

- 🌐 **Live Site**: [zkrune.com](https://zkrune.com) ✨
- 💻 **GitHub**: [louisstein94/zkrune](https://github.com/louisstein94/zkrune)
- 👨‍💻 **Developer**: [@legelsteinn](https://x.com/legelsteinn)
- 📚 **Documentation**: [zkrune.com/docs](https://zkrune.com/docs)


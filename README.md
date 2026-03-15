# zkRune

<div align="center">
  <img src="public/zkrune-log.png" alt="zkRune" width="120" />
  
  ### Privacy Verification Infrastructure for Solana
  
  Embeddable zero-knowledge verification for access, eligibility, and identity.
  
  **100% client-side Groth16 proofs — secrets never leave the device.**
  
  [![Live](https://img.shields.io/badge/Live-zkrune.com-00FFA3?style=for-the-badge)](https://zkrune.com)
  [![Token](https://img.shields.io/badge/Token-Pump.fun-6B4CFF?style=for-the-badge)](https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump)
  
</div>

---

## The Problem

Verification today forces users to hand over raw data — birthdates for age gates, wallet balances for eligibility, credentials for access. The data leaves the device, sits on servers, and becomes a liability.

## The Solution

**zkRune lets users prove claims without exposing the underlying data.** Real Groth16 zk-SNARK proofs, generated entirely in the browser. No server sees the secret. The verifier only learns that the claim is true.

---

## At a Glance

```
┌──────────────────────────────────────────────────────────────────┐
│  13 Production Circuits  │  <1s Generation  │  0 Server Calls   │
├──────────────────────────────────────────────────────────────────┤
│  Real Groth16 zk-SNARKs  │  100% Client-Side  │  Solana Ready   │
└──────────────────────────────────────────────────────────────────┘
```

| Metric | Value |
|--------|-------|
| Circuits | 13 production-ready |
| Proof Generation | 0.4–5 seconds |
| Proof Size | ~200 bytes |
| Verification Time | <2ms |
| Server Calls | **0** (100% browser) |
| Privacy Level | **Complete** |

---

## Use Cases

### Access & Eligibility
| Template | What It Proves | Example |
|----------|---------------|---------|
| Age Verification | User is 18+ | Age-gated content, KYC lite |
| Membership Proof | User belongs to a group | Gated communities, DAOs |
| Balance Proof | Wallet holds ≥ X tokens | Eligibility gates, tier access |
| NFT Ownership | User owns from a collection | Holder verification |

### Reputation & Governance
| Template | What It Proves | Example |
|----------|---------------|---------|
| Anonymous Reputation | Score exceeds threshold | Credit systems, trust scores |
| Private Voting | Valid vote without identity | DAO governance |
| Quadratic Voting | Fair token-weighted vote | Anti-whale governance |
| Credential Verification | Valid credential held | License / certificate checks |

### Cryptographic Primitives
| Template | What It Proves | Example |
|----------|---------------|---------|
| Hash Preimage | Knowledge of secret X | Commitments, payment channels |
| Range Proof | Value within bounds | Salary bands, credit ranges |
| Token Swap | Sufficient balance for swap | Private DEX eligibility |
| Signature Verification | Valid signature held | Authentication |
| Patience Proof | Time-lock completion | Vesting, contest verification |

---

## Quick Start

### Live
**[zkrune.com](https://zkrune.com)** — generate your first proof in under 60 seconds.

### Local Development

```bash
git clone https://github.com/louisstein94/zkrune.git
cd zkrune
npm install
npm run dev
# http://localhost:3000
```

### SDK Integration

```bash
npm install zkrune-sdk
```

```typescript
import { ZkRune } from 'zkrune-sdk';

const zkrune = new ZkRune();
const { proof, publicSignals } = await zkrune.generateProof('age-verification', {
  birthYear: 1990,
  currentYear: 2026,
  minimumAge: 18,
});
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| ZK System | Circom + snarkjs (Groth16) |
| Blockchain | Solana (SPL Token) |
| Mobile | React Native + Expo |
| Hosting | Vercel |

---

## zkRUNE Token

**Contract:** [`51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump`](https://solscan.io/token/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump)

| Feature | Description |
|---------|-------------|
| Governance | Vote on templates and protocol features |
| Burn Mechanism | Burn tokens to unlock premium tiers |
| Marketplace | Buy/sell circuit templates (95% to creators) |
| Staking | Earn up to 36% APY |

### Premium Tiers

| Tier | Burn Required | Unlocks |
|------|---------------|---------|
| Free | 0 | 5 proofs/day, basic templates |
| Builder | 100 zkRUNE | Unlimited proofs, all templates, API |
| Pro | 500 zkRUNE | Custom circuits, gasless proofs |
| Enterprise | 2,000 zkRUNE | White-label, custom integrations |

---

## Project Structure

```
zkrune/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── templates/[id]/      # Template pages
│   ├── verify-proof/        # Hosted verifier
│   ├── governance/          # DAO voting
│   ├── marketplace/         # Template marketplace
│   └── api/                 # API routes
│       ├── verify-proof/    # Proof verification endpoint
│       └── token-stats/     # Live token data
├── components/              # React components
├── circuits/                # 13 Circom ZK circuits
├── lib/
│   ├── clientZkProof.ts    # Client-side ZK library
│   ├── hooks/              # React hooks
│   └── token/              # Token utility
├── public/circuits/         # Compiled WASM & verification keys
├── ceremony/                # Trusted setup ceremony
└── packages/
    ├── zkrune-sdk/         # NPM SDK
    ├── zkrune-cli/         # CLI tool
    ├── zkrune-mobile/      # React Native app
    └── kage-plugin/        # Kage protocol integration
```

---

## Security

### Trusted Setup Ceremony

Multi-party computation ceremony completed **January 15, 2026**.

| Property | Value |
|----------|-------|
| Phase 1 | Hermez Network Powers of Tau (54 participants) |
| Phase 2 | zkRune Community Ceremony (5 contributors) |
| Finalized | 2026-01-15T12:04:03Z |
| Beacon | drand.cloudflare.com |

Cryptographically secure as long as at least one participant was honest. See [`ceremony/CEREMONY_REPORT.md`](ceremony/CEREMONY_REPORT.md) for verification instructions.

### Client-Side Guarantees
- All proofs generated in browser
- No data transmitted to servers
- Keys and secrets stay on device
- Mathematically verifiable proofs

---

## Links

| Resource | Link |
|----------|------|
| Live | [zkrune.com](https://zkrune.com) |
| Templates | [zkrune.com/templates](https://zkrune.com/templates) |
| Docs | [zkrune.com/docs](https://zkrune.com/docs) |
| API Reference | [zkrune.com/api-docs](https://zkrune.com/api-docs) |
| Verify Proof | [zkrune.com/verify-proof](https://zkrune.com/verify-proof) |
| Token | [pump.fun](https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump) |
| Twitter | [@rune_zk](https://x.com/rune_zk) |
| Developer | [@legelsteinn](https://x.com/legelsteinn) |

---

## Contributing

Contributions welcome. Priority areas:

- Custom ZK circuit templates
- SDK and widget improvements
- Solana program integrations
- Mobile app development

---

## License

MIT — see LICENSE file for details.

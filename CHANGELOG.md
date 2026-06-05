# Changelog

All notable, user-visible changes to zkRune. The web mirror lives at
[zkrune.com/changelog](https://zkrune.com/changelog).

Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
versions are dated rather than semver-tagged because zkRune ships
continuously rather than in semver-cadenced releases.

## [2026-06-06]

### Added
- **`/enterprise/us-privacy`** — seventh enterprise vertical funnel covering US state comprehensive privacy laws (California CPRA, Colorado CPA + AI Act, Texas TDPSA, Virginia VCDPA, Connecticut CTDPA, Utah UCPA) plus the federal sectoral baseline (HIPAA, COPPA, GLBA + Safeguards Rule, FCRA). One ZK primitive set, every regime.
- **`/enterprise/ai-agents`** — sixth enterprise vertical: *Proof of Agent* framework for the agentic web. Four pillars (authority, provenance, constraint, human-in-loop) mapped to existing circuits with zero new circuit work to ship v1. Three-layer comparison vs World ID (proof-of-human) and Reclaim Protocol (zkTLS) — explicit non-competition, positioning above both.
- **`/trust` audit & certification roadmap** — five-row phased roadmap with state badges (engaged / planned / demand-gated): Q3–Q4 2026 security audit (engaged) · 2027 H1 SOC 2 Type I · 2027 H2 ISO/IEC 27001 · 2028 H1 SOC 2 Type II · 2028 HITRUST CSF (demand-gated). Honest framing: targets, not promises.
- `lib/regulations.ts` — three new entries: CCPA / CPRA (Data Protection · US-State · binding), Colorado AI Act SB 24-205 (AI Governance · US-State · binding 1 Feb 2026), EU AI Act Article 50 (AI Governance · transparency for AI-generated content · binding 2 Aug 2026). All with `goesDeeper` cross-links.
- `Jurisdiction` union extended with `"US"` and `"US-State"` for geographic extensibility.

### Changed
- `/trust` page `NOT_DONE` SOC 2 / ISO 27001 entry rewritten from *"not pursued"* to *"not yet certified — phased roadmap below"*. Closes the positioning gap surfaced by Reclaim Protocol's SOC 2 + ISO 27001 + GDPR certified incumbent posture (3M+ verifications shipped).
- `/enterprise` and `/enterprise/eudi-wallet` hero footers now cross-link to Proof of Agent; `/enterprise/ai-agents` cross-links to `/enterprise/us-privacy` for Colorado AI Act overlap.

## [2026-06-03]

### Added
- **`/enterprise/age-gating`** — combined funnel for EU DSA Art. 28 + UK Online Safety Act + US state age-verification laws (TX HB 1181, LA HB 142, UT, MS, VA + pipeline). Same widget, three jurisdictions, no government-ID retention.
- **`/enterprise/dora`** — financial operational resilience funnel for DORA Regulation (EU) 2022/2554 + adjacent NIS2 Directive coverage. Cryptographic incident proofs, vendor attestations, TLPT records — tamper-evident without exposing customer or operational PII.
- **`/enterprise/mica`** — CASP-focused vertical for MiCA Regulation (EU) 2023/1114 + Transfer of Funds Regulation 2023/1113 + 6AMLD enhanced due diligence. Proof of reserves, travel-rule attestations, beneficial-ownership selective disclosure.
- `lib/regulations.ts` `goesDeeper` cross-links wired: DSA Art. 28 + UK OSA → `/enterprise/age-gating`; DORA + NIS2 → `/enterprise/dora`; MiCA → `/enterprise/mica`.

### Changed
- **DRY refactor for mainnet verifier display.** Extracted `lib/verifiers.ts` as the single source of truth for the three mainnet verifier contract addresses (Base, Solana, Sui) and `components/MainnetVerifiersGrid.tsx` as the reusable 3-column grid with customisable eyebrow / heading / body / sectionId props. `/trust`, `/enterprise/eudi-wallet`, `/enterprise/mica`, `/enterprise/age-gating`, `/enterprise/dora`, `/enterprise/ai-agents`, `/enterprise/us-privacy` all consume the shared component. `/enterprise` (Article 12 page) retains its custom row layout but now imports `MAINNET_VERIFIERS` data from the same source.

## [2026-05-27]

### Added
- **OpenAPI 3.1 specification** for `POST /api/verify-proof` published at [`/openapi.yaml`](https://zkrune.com/openapi.yaml). Import directly into Postman, generate clients with `openapi-generator-cli` / `oazapfts` / `orval`, or lint integrations in your editor.
- `/docs/api` now opens with an OpenAPI specification block linking the YAML, Postman-import instructions, and client-generation references.
- **`/enterprise/eudi-wallet`** — second enterprise vertical: open-source ZK selective disclosure for EUDI Wallet implementers, attestation issuers, and relying parties. ARF-aligned mapping table; explicitly positioned as the cryptographic primitive layer rather than a wallet itself.
- **`/regulations`** — typed compliance matrix mapping ten major EU + UK regulations (EUDI Wallet, AI Act Art. 12, DSA Art. 28, UK OSA, MiCA, 6AMLD, DORA, PSD2 SCA, NIS2, GDPR Art. 5(1)(c)) to circuits and integration paths. Category-grouped cards with status badges; the universal one-link outreach asset.
- **`/changelog`** page and `CHANGELOG.md` — date-versioned release log, mirrored.
- **`examples/`** directory at repo root: `age-gate-widget/` (single-file HTML widget integration) and `server-verify-node/` (zero-dependency Node `http` proxy + test client). `examples/README.md` indexes them.
- `lib/circuits.ts` — canonical `CIRCUIT_IDS` array + `CircuitId` type union + `isCircuitId` runtime guard. Single source of truth replacing the per-file duplication.
- `lib/regulations.ts` — typed data model (`RegulationStatus`, `RegulationCategory`, `Jurisdiction`, `IntegrationPath`, `Regulation`) and ten data entries. Helpers: `getRegulationsByCategory`, `STATUS_LABELS`, `CATEGORY_BLURBS`.
- `components/EnterpriseHeader.tsx` — shared header for `/enterprise/*` verticals with `subtitle`, `navItems`, `cta`, `homeHref` props. `/enterprise` (AI Act) refactored to use it.

### Changed
- `/docs/{index,widget,api}` MDX surfaces now link the runnable `examples/` at the top of each page.
- Per-bot Dockerfile reliability fixes and regenerated lockfile to unblock Railway deploys.

## [2026-05-26]

### Added
- **`/trust`** — public trust & security disclosure page. Four foundations (multi-party trusted setup, mainnet verifiers, published trust model, MIT open source), mainnet verifier contract addresses on Solana / Ethereum (Base) / Sui, security posture summary, and an honest "what we have not proven yet" section (no 3rd-party audit until Q3–Q4 2026, no SOC 2, formal verification pending).
- **`/about`** — founder-led story page. Solo founder transparency, shipped artefacts, four operating principles, and the four buyer categories we are actively looking for (pilots, compliance teams, grant partners, acquisition).
- **Live in-browser demo** on the landing page: visitors can now generate a real Groth16 age proof in their browser and watch it verified against `/api/verify-proof`. Replaces the previous animated mock.
- Documentation site migrated from a single-page tab layout to a full **Fumadocs** stack: real sidebar navigation, full-text search, deep-linkable URLs, and syntax-highlighted code (`/docs`, `/docs/sdk`, `/docs/widget`, `/docs/api`, `/docs/circuits`, `/docs/trust-model`).

### Changed
- **Site repositioning to B2B verification infrastructure first.** Hero copy refocused on "Privacy-preserving verification for any app". CTA buttons updated to "Start building →" + "View on GitHub ↗". Token-utility section removed from the landing; the `/governance`, `/staking`, `/marketplace`, `/premium` routes remain accessible from the footer "Token" column.
- Navigation reduced to four primary entries: Templates · Enterprise · Trust · Docs.
- Tone consistency sweep across `FAQ`, `TrustBadges`, `CTAShowcase`, and footer copy — replaced defensive phrasing ("real cryptography, not simulations") with assertive technical specifics ("Groth16 ZK-SNARKs over BN128"). FAQ pricing question added; token Q&A removed from FAQ.
- SEO metadata refreshed: title, description, OpenGraph, Twitter cards, and keywords now lead with compliance/age-gating/regulation rather than DeFi/Web3 framing.

### Fixed
- `.gitignore` and `.vercelignore` patterns anchored to the repo root (`/docs/`, `/business/`, `/circuits/`, `/ceremony/`) so that `app/docs/`, `content/docs/`, `public/circuits/`, and `app/ceremony/` ship correctly in deployments. Previously, bare `docs/` patterns silently stripped the Fumadocs route and MDX content from production builds.

## [2026-05-25]

### Changed
- UX polish across the verification flow.

### Added
- Wallet-signed ownership messages bound to Telegram identities for `whale-holder` proofs, with replay protection on the bot side.

## [2026-05-22 – 2026-05-23]

### Added
- `@zkrune/x402-verify` package: endpoint-level zkRune eligibility gate for x402 services, with Hono / Express / Fetch adapters and on-chain verifier wiring.
- Smoke-test harness extended with fetch / Express / Hono adapter coverage, retry logic for on-chain checks, and policy validation tests.

## [2026-04-30 – 2026-05-01]

### Added
- `rpd-whale-web` reusable verifier component extracted from the WhaleChat experience, parameterised by a `WhaleTokenConfig` (multi-token support).
- Bot launch retry logic hardened (up to 8 attempts, capped backoff, structured logging).

## [2026-04-27 – 2026-04-28]

### Added
- Categorised `/integrations` directory with browser & wallet integrations split from agent-economy items.
- Brave browser integration reference page.
- Xona client-side demo: generates a Groth16 proof and verifies it against the Base on-chain verifier (read-only, no gas).

## [2026-04-22]

### Added
- **`/enterprise`** — focused EU AI Act Article 12 compliance pitch. Maps Article 12(4)(a)–(d) sub-requirements to zkRune's cryptographic primitives, lists mainnet verifier addresses, and includes the comparison table vs. SIEM / AI observability / in-house alternatives. Countdown badge to the 2 August 2026 binding date.
- Token stats now merged with default values to prevent null fields from breaking hydration.

## [2026-04-16 – 2026-04-17]

### Added
- **Multi-chain verifier support.** On-chain Groth16 verifiers deployed and wired into the proof export UI on Solana (mainnet), Ethereum L2 (Base, mainnet), and Sui (mainnet). Each chain has its own read-only verifier component supporting wallet-free verification.
- Anchor-based Solana e2e tests + Playwright browser tests integrated into CI.
- Ceremony admin-gated REST API documented; community participation goes through the CLI flow, admin synchronisation uses bearer-token endpoints.

### Changed
- Server-side security posture hardened over a multi-week sweep:
  - **CSP**: nonce-based, `strict-dynamic`, `unsafe-inline` removed from `script-src`.
  - **Rate limiting**: 100 req/min global, 30/min on `/api/rpc`, 5–10/min on AI endpoints, capped in-memory store with oldest-first eviction.
  - **Input validation**: every public API field has explicit Zod length / shape bounds. `vk_alphabeta_12` is a typed tensor (was `z.array(z.any())`).
  - **Replay protection**: wallet-signed actions bind action + wallet + canonical fields + timestamp; verified signatures are recorded and replays rejected.
  - **Auth**: API routes switched to service-role Supabase access, with restrictive RLS on writes. Ceremony admin routes require a bearer `CEREMONY_ADMIN_TOKEN` and fail closed when unset.

### Fixed
- EVM verifier curve validation; Sui `u8` overflow guard; Solana verifier + staking program input bounds.

## [2026-04-13]

### Added
- Sui Groth16 verifier Move package + Sui-side fixture generators and devInspect verification scripts.
- Circuit-level enforcement of boolean outputs and Poseidon hash validity.
- Square-root-based weighting for quadratic voting circuit.
- End-to-end circuit fixture regression tests.

## [2026-04-01]

### Added
- **Trust level system** — every circuit now classified as `production`, `self-asserted`, or `experimental`, surfaced in the proof export UI.
- Server-side RPC proxy at `/api/rpc` with method whitelist + body cap, fixing CSP issues and enabling per-IP rate limiting.
- `security.txt` and pinned dependencies for verifiable build reproducibility.
- Solana verifier Anchor IDL bundled into the client SDK; transaction timeout handling in the verify UI.

---

For the full commit history, see [github.com/louisstein94/zkrune/commits/main](https://github.com/louisstein94/zkrune/commits/main).

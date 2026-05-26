# Changelog

All notable, user-visible changes to zkRune. The web mirror lives at
[zkrune.com/changelog](https://zkrune.com/changelog).

Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
versions are dated rather than semver-tagged because zkRune ships
continuously rather than in semver-cadenced releases.

## [Unreleased]

### Added
- `examples/age-gate-widget/` — single-file HTML example demonstrating the script-tag widget for an age-gated landing page.
- `examples/server-verify-node/` — zero-dependency Node `http` proxy plus test client, demonstrating the server-side verify pattern.
- `examples/README.md` — index of integration examples with adaptation guidance.
- `/changelog` page (this file).

### Changed
- `/docs/{index,widget,api}` MDX surfaces now link the new runnable examples at the top of each page.

## [2026-05-27]

### Added
- **OpenAPI 3.1 specification** for `POST /api/verify-proof` published at [`/openapi.yaml`](https://zkrune.com/openapi.yaml). Import directly into Postman, generate clients with `openapi-generator-cli` / `oazapfts` / `orval`, or lint integrations in your editor.
- `/docs/api` now opens with an OpenAPI specification block linking the YAML, Postman-import instructions, and client-generation references.
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

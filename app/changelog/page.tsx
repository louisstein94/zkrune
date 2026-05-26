import type { Metadata } from "next";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Changelog — zkRune",
  description:
    "Notable user-visible changes to zkRune. Continuously shipped privacy verification infrastructure.",
  alternates: { canonical: "https://zkrune.com/changelog" },
  openGraph: {
    title: "Changelog — zkRune",
    description:
      "Continuously shipped privacy verification infrastructure. Versioned by date.",
    url: "https://zkrune.com/changelog",
    siteName: "zkRune",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog — zkRune",
    description:
      "Continuously shipped privacy verification infrastructure. Versioned by date.",
    images: ["/og-image.png"],
  },
};

type Section = { kind: "added" | "changed" | "fixed"; items: string[] };
type Release = {
  date: string;
  unreleased?: boolean;
  sections: Section[];
};

const RELEASES: Release[] = [
  {
    date: "Unreleased",
    unreleased: true,
    sections: [
      {
        kind: "added",
        items: [
          "`examples/age-gate-widget/` — single-file HTML example demonstrating the script-tag widget for an age-gated landing page.",
          "`examples/server-verify-node/` — zero-dependency Node `http` proxy plus test client, demonstrating the server-side verify pattern.",
          "`examples/README.md` — index of integration examples with adaptation guidance.",
          "`/changelog` page (this file).",
        ],
      },
      {
        kind: "changed",
        items: [
          "`/docs/{index,widget,api}` MDX surfaces now link the new runnable examples at the top of each page.",
        ],
      },
    ],
  },
  {
    date: "2026-05-27",
    sections: [
      {
        kind: "added",
        items: [
          "**OpenAPI 3.1 specification** for `POST /api/verify-proof` published at [`/openapi.yaml`](/openapi.yaml). Import directly into Postman, generate clients with `openapi-generator-cli` / `oazapfts` / `orval`, or lint integrations in your editor.",
          "`/docs/api` now opens with an OpenAPI specification block linking the YAML, Postman-import instructions, and client-generation references.",
          "Per-bot Dockerfile reliability fixes and regenerated lockfile to unblock Railway deploys.",
        ],
      },
    ],
  },
  {
    date: "2026-05-26",
    sections: [
      {
        kind: "added",
        items: [
          "**`/trust`** — public trust & security disclosure page. Four foundations (multi-party trusted setup, mainnet verifiers, published trust model, MIT open source), mainnet verifier contract addresses on Solana / Ethereum (Base) / Sui, security posture summary, and an honest \"what we have not proven yet\" section (no 3rd-party audit until Q3–Q4 2026, no SOC 2, formal verification pending).",
          "**`/about`** — founder-led story page. Solo founder transparency, shipped artefacts, four operating principles, and the four buyer categories we are actively looking for (pilots, compliance teams, grant partners, acquisition).",
          "**Live in-browser demo** on the landing page: visitors can now generate a real Groth16 age proof in their browser and watch it verified against `/api/verify-proof`. Replaces the previous animated mock.",
          "Documentation site migrated from a single-page tab layout to a full **Fumadocs** stack: real sidebar navigation, full-text search, deep-linkable URLs, and syntax-highlighted code (`/docs`, `/docs/sdk`, `/docs/widget`, `/docs/api`, `/docs/circuits`, `/docs/trust-model`).",
        ],
      },
      {
        kind: "changed",
        items: [
          "**Site repositioning to B2B verification infrastructure first.** Hero copy refocused on \"Privacy-preserving verification for any app\". CTA buttons updated to \"Start building →\" + \"View on GitHub ↗\". Token-utility section removed from the landing; the `/governance`, `/staking`, `/marketplace`, `/premium` routes remain accessible from the footer \"Token\" column.",
          "Navigation reduced to four primary entries: Templates · Enterprise · Trust · Docs.",
          "Tone consistency sweep across FAQ, TrustBadges, CTAShowcase, and footer copy — replaced defensive phrasing (\"real cryptography, not simulations\") with assertive technical specifics (\"Groth16 ZK-SNARKs over BN128\"). FAQ pricing question added; token Q&A removed from FAQ.",
          "SEO metadata refreshed: title, description, OpenGraph, Twitter cards, and keywords now lead with compliance/age-gating/regulation rather than DeFi/Web3 framing.",
        ],
      },
      {
        kind: "fixed",
        items: [
          "`.gitignore` and `.vercelignore` patterns anchored to the repo root (`/docs/`, `/business/`, `/circuits/`, `/ceremony/`) so that `app/docs/`, `content/docs/`, `public/circuits/`, and `app/ceremony/` ship correctly in deployments. Previously, bare `docs/` patterns silently stripped the Fumadocs route and MDX content from production builds.",
        ],
      },
    ],
  },
  {
    date: "2026-05-25",
    sections: [
      {
        kind: "added",
        items: [
          "Wallet-signed ownership messages bound to Telegram identities for `whale-holder` proofs, with replay protection on the bot side.",
        ],
      },
      {
        kind: "changed",
        items: ["UX polish across the verification flow."],
      },
    ],
  },
  {
    date: "2026-05-22 – 2026-05-23",
    sections: [
      {
        kind: "added",
        items: [
          "`@zkrune/x402-verify` package: endpoint-level zkRune eligibility gate for x402 services, with Hono / Express / Fetch adapters and on-chain verifier wiring.",
          "Smoke-test harness extended with fetch / Express / Hono adapter coverage, retry logic for on-chain checks, and policy validation tests.",
        ],
      },
    ],
  },
  {
    date: "2026-04-30 – 2026-05-01",
    sections: [
      {
        kind: "added",
        items: [
          "`rpd-whale-web` reusable verifier component extracted from the WhaleChat experience, parameterised by a `WhaleTokenConfig` (multi-token support).",
          "Bot launch retry logic hardened (up to 8 attempts, capped backoff, structured logging).",
        ],
      },
    ],
  },
  {
    date: "2026-04-27 – 2026-04-28",
    sections: [
      {
        kind: "added",
        items: [
          "Categorised `/integrations` directory with browser & wallet integrations split from agent-economy items.",
          "Brave browser integration reference page.",
          "Xona client-side demo: generates a Groth16 proof and verifies it against the Base on-chain verifier (read-only, no gas).",
        ],
      },
    ],
  },
  {
    date: "2026-04-22",
    sections: [
      {
        kind: "added",
        items: [
          "**`/enterprise`** — focused EU AI Act Article 12 compliance pitch. Maps Article 12(4)(a)–(d) sub-requirements to zkRune's cryptographic primitives, lists mainnet verifier addresses, and includes the comparison table vs. SIEM / AI observability / in-house alternatives. Countdown badge to the 2 August 2026 binding date.",
          "Token stats now merged with default values to prevent null fields from breaking hydration.",
        ],
      },
    ],
  },
  {
    date: "2026-04-16 – 2026-04-17",
    sections: [
      {
        kind: "added",
        items: [
          "**Multi-chain verifier support.** On-chain Groth16 verifiers deployed and wired into the proof export UI on Solana (mainnet), Ethereum L2 (Base, mainnet), and Sui (mainnet). Each chain has its own read-only verifier component supporting wallet-free verification.",
          "Anchor-based Solana e2e tests + Playwright browser tests integrated into CI.",
          "Ceremony admin-gated REST API documented; community participation goes through the CLI flow, admin synchronisation uses bearer-token endpoints.",
        ],
      },
      {
        kind: "changed",
        items: [
          "Multi-week server-side security posture sweep: nonce-based CSP with `strict-dynamic`, per-route rate limiting (100 req/min global, 30/min on `/api/rpc`, 5–10/min on AI endpoints), Zod input bounds on every public API field, wallet-signed action replay protection, Supabase service-role access with restrictive RLS, and bearer-token-gated ceremony admin routes.",
        ],
      },
      {
        kind: "fixed",
        items: [
          "EVM verifier curve validation; Sui `u8` overflow guard; Solana verifier + staking program input bounds.",
        ],
      },
    ],
  },
  {
    date: "2026-04-13",
    sections: [
      {
        kind: "added",
        items: [
          "Sui Groth16 verifier Move package + Sui-side fixture generators and devInspect verification scripts.",
          "Circuit-level enforcement of boolean outputs and Poseidon hash validity.",
          "Square-root-based weighting for the quadratic voting circuit.",
          "End-to-end circuit fixture regression tests.",
        ],
      },
    ],
  },
  {
    date: "2026-04-01",
    sections: [
      {
        kind: "added",
        items: [
          "**Trust level system** — every circuit now classified as `production`, `self-asserted`, or `experimental`, surfaced in the proof export UI.",
          "Server-side RPC proxy at `/api/rpc` with method whitelist + body cap, fixing CSP issues and enabling per-IP rate limiting.",
          "`security.txt` and pinned dependencies for verifiable build reproducibility.",
          "Solana verifier Anchor IDL bundled into the client SDK; transaction timeout handling in the verify UI.",
        ],
      },
    ],
  },
];

const sectionMeta = {
  added: { label: "Added", color: "text-zk-secondary", dot: "bg-zk-secondary" },
  changed: { label: "Changed", color: "text-zk-accent", dot: "bg-zk-accent" },
  fixed: { label: "Fixed", color: "text-zk-primary", dot: "bg-zk-primary" },
} as const;

// Minimal inline-markdown renderer for the bullet content. We only
// support what the changelog actually uses: bold (**...**), inline
// code (`...`), and links ([text](url)). Anything else passes through
// as plain text.
function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Pattern order matters — links first to avoid capturing their text
  // as bold/code.
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index));
    if (m[1] !== undefined && m[2] !== undefined) {
      const href = m[2];
      const isExternal = href.startsWith("http");
      tokens.push(
        <a
          key={`l${key}`}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] !== undefined) {
      tokens.push(
        <strong key={`b${key}`} className="text-white font-semibold">
          {m[3]}
        </strong>,
      );
    } else if (m[4] !== undefined) {
      tokens.push(
        <code
          key={`c${key}`}
          className="px-1.5 py-0.5 bg-zk-darker/80 rounded text-zk-primary font-mono text-[0.85em]"
        >
          {m[4]}
        </code>,
      );
    }
    last = m.index + m[0].length;
    key += 1;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

export default function ChangelogPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <Navigation />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[700px] overflow-hidden pointer-events-none">
        <div className="absolute top-28 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-primary/10 blur-[120px]" />
        <div className="absolute top-56 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-accent/8 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-12 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
              Changelog
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
            What we shipped, <span className="text-zk-primary">when</span>.
          </h1>
          <p className="text-lg text-zk-gray max-w-3xl leading-relaxed">
            Notable user-visible changes. Versioned by date rather than semver
            because zkRune ships continuously. Mirror of{" "}
            <a
              href="https://github.com/louisstein94/zkrune/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
            >
              CHANGELOG.md
            </a>{" "}
            on GitHub.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pb-20 max-w-4xl mx-auto">
        <div className="space-y-10">
          {RELEASES.map((release) => (
            <article
              key={release.date}
              className={`relative pl-6 md:pl-10 border-l ${
                release.unreleased
                  ? "border-zk-secondary/40"
                  : "border-white/10"
              }`}
            >
              <span
                className={`absolute -left-[7px] top-2 w-3 h-3 rounded-full border-2 border-zk-darker ${
                  release.unreleased ? "bg-zk-secondary animate-pulse" : "bg-zk-primary"
                }`}
              />
              <header className="mb-5">
                <h2 className="font-hatton text-2xl md:text-3xl text-white">
                  {release.date}
                </h2>
                {release.unreleased && (
                  <p className="text-xs text-zk-secondary uppercase tracking-wider mt-1">
                    Work in flight — not yet pushed to production
                  </p>
                )}
              </header>
              <div className="space-y-5">
                {release.sections.map((section) => {
                  const meta = sectionMeta[section.kind];
                  return (
                    <div key={section.kind}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <h3
                          className={`text-xs font-bold uppercase tracking-[0.2em] ${meta.color}`}
                        >
                          {meta.label}
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {section.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-sm md:text-base text-zk-gray leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.65em] before:w-2 before:h-px before:bg-zk-gray/40"
                          >
                            {renderInline(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-zk-gray">
            Full commit history at{" "}
            <a
              href="https://github.com/louisstein94/zkrune/commits/main"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
            >
              github.com/louisstein94/zkrune
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

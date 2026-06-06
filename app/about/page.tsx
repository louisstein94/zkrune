import type { Metadata } from "next";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "About — zkRune",
  description:
    "Who built zkRune, what we have shipped, how we work, and what we are looking for.",
  alternates: { canonical: "https://zkrune.com/about" },
  openGraph: {
    title: "About — zkRune",
    description:
      "Founder-led privacy verification infrastructure. Mainnet on Solana, Ethereum, Sui, and Base. 14 production circuits. Open source.",
    url: "https://zkrune.com/about",
    siteName: "zkRune",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — zkRune",
    description:
      "Founder-led, shipped to mainnet. 14 production ZK circuits. Open source.",
    images: ["/og-image.png"],
  },
};

const SHIPPED = [
  "14 production Groth16 circuits, with multi-party trusted setup artefacts published",
  "Mainnet verifier contracts on Solana, Ethereum (Base L2), and Sui",
  "Client-side proving in WASM — proofs generated in 0.4–5 seconds on commodity hardware",
  "Open-source TypeScript SDK (zkrune-sdk) and embeddable widget (zkrune-widget)",
  "Hosted verification API and dynamic-content docs at /docs",
  "Android proving runtime (signed APK) and PWA install path",
  "Published trust model classifying every circuit by production / self-asserted / experimental",
];

const PRINCIPLES = [
  {
    title: "Open by default",
    body: "Source, circuits, ceremony artefacts, and the trust model are all public. If a buyer or auditor wants to verify a claim on this site, the code is one click away.",
  },
  {
    title: "Honest about boundaries",
    body: "Every circuit is labelled with its trust level. The /trust page lists what we have proved and what we have not. No hand-waving, no \"trust us\".",
  },
  {
    title: "Ship to mainnet, not testnet",
    body: "Three mainnet verifiers carry real users today. We don't write blog posts about cryptography we haven't deployed.",
  },
  {
    title: "Privacy by architecture",
    body: "Private inputs never leave the user's device. The hosted verifier sees proofs and public signals only. PII retention is structurally impossible, not just policy.",
  },
];

const SERVES: { label: string; href: string; body: string }[] = [
  {
    label: "EU AI Act — Article 12",
    href: "/enterprise",
    body: "High-risk AI vendors facing the 2 August 2026 record-keeping mandate.",
  },
  {
    label: "Proof of Agent",
    href: "/enterprise/ai-agents",
    body: "AI agent platforms, enterprise AI ops, governance vendors. Authority · Agent Passport · Constraint · Human-in-loop.",
  },
  {
    label: "EUDI Wallet — eIDAS 2.0",
    href: "/enterprise/eudi-wallet",
    body: "Wallet implementers, attestation issuers, relying parties. ARF-aligned selective disclosure.",
  },
  {
    label: "MiCA + Travel Rule",
    href: "/enterprise/mica",
    body: "Crypto-asset service providers, ART/EMT issuers, AML technology integrators.",
  },
  {
    label: "Age-gating",
    href: "/enterprise/age-gating",
    body: "Dating, social, adult, gambling platforms in scope of DSA Art. 28 + UK OSA + US state laws.",
  },
  {
    label: "DORA + NIS2",
    href: "/enterprise/dora",
    body: "Financial entities, ICT third-party providers, NIS2-adjacent critical infrastructure.",
  },
  {
    label: "US Privacy + Sectoral",
    href: "/enterprise/us-privacy",
    body: "Multi-state SaaS, AI vendors under Colorado AI Act, HIPAA / COPPA / GLBA / FCRA-regulated operators.",
  },
];

const LOOKING_FOR = [
  {
    label: "Pilot integrators",
    body: "Web2 or web3 apps with an age-gating, membership, KYC-lite, eligibility-verification, or agent-attestation problem. We work hands-on with the first integrations.",
  },
  {
    label: "Enterprise compliance teams",
    body: "DPOs, compliance leads, and engineering teams in scope of any of the seven regimes above. See /regulations for the full matrix and /enterprise/* for per-vertical landings.",
  },
  {
    label: "Grant partners",
    body: "NLnet, Solana Foundation, EU NGI, and privacy-aligned grant programmes. Outputs are released under permissive open-source licences.",
  },
  {
    label: "Acquisition conversations",
    body: "Strategic acquirers in the privacy-compliance, identity-proofing, or developer-tooling space. Reach out via email.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <Navigation />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[700px] overflow-hidden pointer-events-none">
        <div className="absolute top-28 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-primary/10 blur-[120px]" />
        <div className="absolute top-56 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-accent/8 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-16 max-w-5xl mx-auto">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
              About zkRune
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white max-w-4xl">
            Built by one engineer.<br />
            <span className="text-zk-primary">Shipped to mainnet.</span>
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            zkRune is privacy-preserving verification infrastructure. We make it
            cheap and safe for any app to verify users without becoming a data
            target. This page is the short story behind it.
          </p>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-14 bg-zk-dark/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 md:gap-12 items-start">
          <div className="md:col-span-1">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Founder
            </span>
            <h2 className="font-hatton text-3xl text-white mt-2">Louis</h2>
            <p className="text-sm text-zk-gray mt-2">
              Sole founder &amp; lead developer
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <a
                href="https://x.com/legelsteinn"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-white/10 rounded-full text-zk-gray hover:border-zk-primary/40 hover:text-white transition-colors"
              >
                @legelsteinn
              </a>
              <a
                href="https://github.com/louisstein94"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-white/10 rounded-full text-zk-gray hover:border-zk-primary/40 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <p className="text-zk-gray leading-relaxed">
              zkRune is a one-person operation. The full stack — circuits, SDK,
              widget, hosted verifier, Android proving runtime, and the
              three mainnet verifier deployments — was built end-to-end by Louis.
              Background spans applied cryptography (Groth16, BN254,
              Powers-of-Tau), Rust on-chain programming, and TypeScript / WASM
              toolchains.
            </p>
            <p className="text-zk-gray leading-relaxed">
              Being a solo team is a constraint we name openly. It is also how
              the project moved from zero to three mainnet verifiers and 14
              circuits in a few quarters without a stand-up, a steering
              committee, or a token-distribution rationalisation. Grant funding
              and pilot integrations extend that runway. Acquisition
              conversations are welcome.
            </p>
          </div>
        </div>
      </section>

      {/* SHIPPED */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              What we have shipped
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Concrete artefacts, not roadmaps.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              Everything below is live today. Roadmap items live on the{" "}
              <a href="/roadmap" className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2">
                roadmap page
              </a>{" "}
              and are labelled accordingly.
            </p>
          </div>
          <ul className="space-y-3">
            {SHIPPED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-zk-dark/30"
              >
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-zk-primary/15 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-zk-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm md:text-base text-zk-gray leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16 bg-zk-dark/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              How we work
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Four principles that are easy to verify.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-2xl border border-white/10 bg-zk-darker/60 hover:border-zk-primary/30 transition-colors"
              >
                <h3 className="font-hatton text-xl text-white mb-3">{p.title}</h3>
                <p className="text-sm text-zk-gray leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVES */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Who we serve
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Seven compliance verticals, one ZK primitive set.
            </h2>
            <p className="text-zk-gray max-w-3xl text-sm leading-relaxed">
              Same 14 production circuits underneath all of them. Per-vertical
              landings have buyer-relevant mapping tables; the{" "}
              <a
                href="/regulations"
                className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
              >
                regulations matrix
              </a>{" "}
              is the universal filter.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {SERVES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="group p-5 rounded-2xl border border-white/10 bg-zk-dark/30 hover:border-zk-primary/30 hover:bg-zk-dark/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-hatton text-lg text-white">{s.label}</h3>
                  <span className="text-zk-gray group-hover:text-zk-primary transition-colors text-sm">
                    →
                  </span>
                </div>
                <p className="text-sm text-zk-gray leading-relaxed">{s.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* LOOKING FOR */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16 bg-zk-dark/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              What we are looking for
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Pilot partners, compliance teams, grants, and the right acquirer.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {LOOKING_FOR.map((l) => (
              <div
                key={l.label}
                className="p-6 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/[0.03]"
              >
                <p className="text-sm font-semibold text-white mb-2">{l.label}</p>
                <p className="text-sm text-zk-gray leading-relaxed">{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Get in touch.
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            One inbox, one founder. The fastest way to evaluate whether zkRune
            fits your problem is to write a short email describing it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=zkRune%20—%20introduction"
              className="px-8 py-3 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
            >
              Email founder@
            </a>
            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all"
            >
              View on GitHub ↗
            </a>
          </div>
          <p className="text-xs text-zk-gray/60 pt-4">
            zkruneprotocol@gmail.com · @rune_zk on X
          </p>
        </div>
      </section>
    </main>
  );
}

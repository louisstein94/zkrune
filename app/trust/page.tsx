import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import MainnetVerifiersGrid from "@/components/MainnetVerifiersGrid";

export const metadata: Metadata = {
  title: "Trust & Security — zkRune",
  description:
    "What we built, what we proved, and what we haven't yet. Mainnet verifiers, a published trust model, an honest per-circuit ceremony audit, and an audit roadmap.",
  alternates: { canonical: "https://zkrune.com/trust" },
  openGraph: {
    title: "Trust & Security — zkRune",
    description:
      "Mainnet verifiers, a published trust model, an honest per-circuit ceremony audit, and an audit roadmap.",
    url: "https://zkrune.com/trust",
    siteName: "zkRune",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trust & Security — zkRune",
    description:
      "Mainnet verifiers, published trust model, ceremony status, audit roadmap.",
    images: ["/og-image.png"],
  },
};

const PILLARS = [
  {
    title: "Trusted setup — Phase 2 re-ceremony pending",
    body: "Phase 1 reuses the Hermez Powers of Tau ceremony (54 Ethereum-community participants). A Phase 2 multi-party ceremony ran in January 2026, but the circuits were later modified — so the zkeys currently in production are single-party for 13 of 14 circuits, and a fresh multi-party Phase 2 is pending. We publish the per-circuit status rather than imply it is done.",
    link: { label: "Per-circuit ceremony status", href: "https://github.com/louisstein94/zkrune/blob/main/ceremony/CEREMONY_REPORT.md" },
  },
  {
    title: "Mainnet verifiers, deployed",
    body: "Groth16 verifiers live on three production chains. The verification key is on-chain and immutable; nobody — including us — can swap it without producing a new contract that the world can see.",
    link: { label: "See verifier addresses below", href: "#verifiers" },
  },
  {
    title: "Published trust model",
    body: "Every circuit is classified as Production, Self-Asserted, or Experimental. Integrators see exactly what each proof guarantees and what it does not. No hand-waving.",
    link: { label: "Read the trust model", href: "/docs/trust-model" },
  },
  {
    title: "Open source under MIT",
    body: "Circuits, SDK, hosted verifier, and the on-chain programs are open source. Any engineer can audit the code, self-host the verifier, and reproduce the proofs.",
    link: { label: "Source on GitHub", href: "https://github.com/louisstein94/zkrune" },
  },
];

const SECURITY = [
  {
    label: "Content Security Policy",
    detail:
      "Nonce-based, strict-dynamic. No unsafe-inline scripts. Per-request nonces forwarded via the x-nonce header.",
  },
  {
    label: "Rate limiting",
    detail:
      "100 req/min per IP at the edge. Tighter caps on RPC proxy (30/min), AI endpoints (5–10/min), and ceremony admin routes. IP resolution prefers x-real-ip / cf-connecting-ip over spoofable headers.",
  },
  {
    label: "Input validation",
    detail:
      "Zod schemas with explicit length and shape bounds on every public API. Proof fields, public signals, and verification keys are typed and bounded.",
  },
  {
    label: "Replay protection",
    detail:
      "Wallet-signed actions bind action + wallet + canonical fields + timestamp. Timestamps must be fresh (≤ 5 min) and not future-dated. Verified signatures are recorded; replays are rejected.",
  },
  {
    label: "No raw PII retained",
    detail:
      "Proofs are generated client-side. The hosted verifier sees the proof and public signals only — never the private witness. Private inputs never leave the user's device.",
  },
  {
    label: "On-chain integrity",
    detail:
      "Verification keys are on-chain on Base, Solana, and Sui. The vKey loaded by the hosted verifier is the same one anchored on mainnet.",
  },
];

const NOT_DONE = [
  {
    label: "Third-party security audit",
    body: "Engagement targeted for Q3–Q4 2026. No external audit reports yet. See the certification roadmap below.",
  },
  {
    label: "SOC 2 / ISO 27001 / HITRUST",
    body: "Not yet certified. Phased roadmap below: SOC 2 Type I targeted 2027 H1, ISO 27001 targeted 2027 H2, SOC 2 Type II targeted 2028 H1. HITRUST gated on healthcare deal demand.",
  },
  {
    label: "Formal verification of circuits",
    body: "Circuits are reviewed by the team and tested against snarkjs reference implementations. Formal verification (e.g. Coq, Halo2 proof-checking) has not been performed.",
  },
  {
    label: "Self-asserted circuits remain self-asserted",
    body: "Several circuits (age-verification, range-proof, credential-proof, anonymous-reputation) classify as self-asserted. The math is sound; the underlying claim is only as trustworthy as the user. Attested upgrades are on the roadmap.",
  },
];

type CertificationState = "engaged" | "planned" | "demand-gated";

const CERTIFICATION_ROADMAP: {
  quarter: string;
  milestone: string;
  state: CertificationState;
  scope: string;
  why: string;
}[] = [
  {
    quarter: "Q3–Q4 2026",
    milestone: "Third-party security audit",
    state: "engaged",
    scope:
      "Cryptographic audit of the 14 production circuits, WASM prover, and on-chain verifiers by a recognised ZK-auditing firm (Zellic, ZKSecurity, or Veridise class). Full report published open-access.",
    why: "The floor. Every enterprise security questionnaire begins here, and supervisor-facing pages (`/enterprise`, `/enterprise/dora`) cite the engagement date.",
  },
  {
    quarter: "2027 H1",
    milestone: "SOC 2 Type I",
    state: "planned",
    scope:
      "Point-in-time attestation against the AICPA Trust Services Criteria (security, availability, confidentiality, processing integrity).",
    why: "US enterprise procurement treats SOC 2 as effectively non-negotiable. Type I is the gateway to Type II.",
  },
  {
    quarter: "2027 H2",
    milestone: "ISO/IEC 27001 certification",
    state: "planned",
    scope:
      "ISMS certification scoped to the hosted verifier, SDK supply chain, and ceremony operations.",
    why: "EU enterprise procurement expectation; cited explicitly in DORA Art. 28 supplier risk obligations and in member-state EUDI Wallet vendor selection.",
  },
  {
    quarter: "2028 H1",
    milestone: "SOC 2 Type II",
    state: "planned",
    scope:
      "Twelve-month operating-effectiveness observation building on Type I controls.",
    why: "Banks, insurers, healthcare networks procure against Type II — not Type I.",
  },
  {
    quarter: "2028 (gated)",
    milestone: "HITRUST CSF",
    state: "demand-gated",
    scope:
      "Healthcare-specific certification mapping HIPAA Security Rule plus dozens of adjacent frameworks (NIST CSF, PCI DSS, GDPR).",
    why: "Pursued if and when healthcare deal demand materialises. Not a sunk cost otherwise — listed here for honesty, not to over-promise.",
  },
];

const CERT_STATE_META: Record<
  CertificationState,
  { label: string; dot: string; badge: string }
> = {
  engaged: {
    label: "Engaged",
    dot: "bg-zk-secondary",
    badge: "bg-zk-secondary/15 text-zk-secondary border-zk-secondary/30",
  },
  planned: {
    label: "Planned",
    dot: "bg-zk-primary",
    badge: "bg-zk-primary/15 text-zk-primary border-zk-primary/30",
  },
  "demand-gated": {
    label: "Demand-gated",
    dot: "bg-zk-gray",
    badge: "bg-zk-gray/15 text-zk-gray border-zk-gray/30",
  },
};

export default function TrustPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <Navigation />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[700px] overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-primary/10 blur-[120px]" />
        <div className="absolute top-56 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-secondary/8 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-20 max-w-5xl mx-auto">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
              Trust &amp; Security
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white max-w-4xl">
            What we built.<br />
            What we proved.{" "}
            <span className="text-zk-gray/70">What we haven&apos;t yet.</span>
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            Privacy infrastructure earns trust by being honest about its boundaries.
            This page is that disclosure: what protects you today, and what we still
            owe.
          </p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16 bg-zk-dark/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Foundations
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white">
              Four pillars that hold the rest up.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="p-6 md:p-7 rounded-2xl border border-white/10 bg-zk-darker/60 hover:border-zk-primary/30 transition-colors"
              >
                <h3 className="font-hatton text-xl text-white mb-3">{p.title}</h3>
                <p className="text-sm text-zk-gray leading-relaxed mb-4">{p.body}</p>
                <a
                  href={p.link.href}
                  target={p.link.href.startsWith("http") ? "_blank" : undefined}
                  rel={p.link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-xs text-zk-primary font-medium hover:text-zk-primary/80 transition-colors inline-flex items-center gap-1"
                >
                  {p.link.label} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFIERS */}
      <MainnetVerifiersGrid
        sectionId="verifiers"
        body="The verification key for every supported circuit is anchored on three production chains. You can verify the same proof on any of them."
      />

      {/* SECURITY POSTURE */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16 bg-zk-dark/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Posture
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white">
              Security controls in production.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              The hosted verifier and the public web app run under the controls
              below. Self-hosted deployments inherit the same code path; the
              policies are yours to configure.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {SECURITY.map((s) => (
              <div
                key={s.label}
                className="p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <p className="text-sm font-semibold text-white mb-1">{s.label}</p>
                <p className="text-xs text-zk-gray leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-zk-gray">
            Full security policy:{" "}
            <a
              href="https://github.com/louisstein94/zkrune/blob/main/SECURITY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zk-primary hover:text-zk-primary/80 transition-colors"
            >
              SECURITY.md
            </a>
          </div>
        </div>
      </section>

      {/* NOT DONE */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Honest disclosure
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              What we have <span className="text-zk-secondary">not</span> proven yet.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              Diligence checklists ask about these. We&apos;d rather you read the
              answers here than guess.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {NOT_DONE.map((n) => (
              <div
                key={n.label}
                className="p-6 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/[0.03]"
              >
                <p className="text-sm font-semibold text-white mb-2">{n.label}</p>
                <p className="text-sm text-zk-gray leading-relaxed">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIT & CERTIFICATION ROADMAP */}
      <section
        id="certification-roadmap"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-16 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Audit &amp; certification roadmap
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              How we close the trust gaps above.
            </h2>
            <p className="text-zk-gray max-w-3xl text-sm leading-relaxed">
              Targets, not promises. Each milestone is gated on the previous,
              on customer demand, and on the open-source commons remaining
              the primary deliverable. We publish dates so buyers and
              auditors can hold us accountable — not to anchor expectations
              we cannot meet.
            </p>
          </div>

          <div className="space-y-3">
            {CERTIFICATION_ROADMAP.map((m) => {
              const meta = CERT_STATE_META[m.state];
              return (
                <div
                  key={m.milestone}
                  className="grid md:grid-cols-12 gap-4 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
                >
                  <div className="md:col-span-3">
                    <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                      Target
                    </p>
                    <p className="font-hatton text-lg text-white">{m.quarter}</p>
                    <span
                      className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </div>
                  <div className="md:col-span-4">
                    <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                      Milestone
                    </p>
                    <p className="text-white text-sm font-medium mb-2">
                      {m.milestone}
                    </p>
                    <p className="text-xs text-zk-gray leading-relaxed">
                      {m.scope}
                    </p>
                  </div>
                  <div className="md:col-span-5">
                    <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                      Why it matters for buyers
                    </p>
                    <p className="text-sm text-zk-gray leading-relaxed">
                      {m.why}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-5 rounded-xl border border-white/5 bg-zk-darker/40">
            <p className="text-xs text-zk-gray/80 leading-relaxed">
              <span className="text-zk-gray font-semibold uppercase tracking-[0.15em]">
                Honest framing —
              </span>{" "}
              The open-source commons remains the primary deliverable. Every
              milestone above is gated on the previous one, on real
              enterprise demand, and on funding (grant, paid pilot, or
              acquirer support). We will not chase certifications without
              the buyers that need them.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Need a deeper review for a security questionnaire?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We&apos;re happy to walk through the trust model, ceremony transcripts,
            and our audit timeline with your team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=zkRune%20security%20review"
              className="px-8 py-3 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
            >
              Email security@
            </a>
            <a
              href="/docs/trust-model"
              className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all"
            >
              Read the full trust model
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

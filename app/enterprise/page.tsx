import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "zkRune for Compliance — Article 12 Logging for High-Risk AI",
  description:
    "Cryptographic record-keeping for EU AI Act Article 12. Log every match. Retain zero personal data. Purpose-built for Annex III 1(a) AI systems. Binding from 2 August 2026.",
  alternates: { canonical: "https://zkrune.com/enterprise" },
  openGraph: {
    title: "zkRune for Compliance — Article 12 Logging for High-Risk AI",
    description:
      "Cryptographic record-keeping for EU AI Act Article 12. Log every match. Retain zero personal data.",
    url: "https://zkrune.com/enterprise",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune for Compliance — Article 12 Logging for High-Risk AI",
    description:
      "Cryptographic record-keeping for EU AI Act Article 12. Retain zero personal data.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

// Revalidate hourly so the "days until 2 Aug 2026" countdown stays accurate
// under static rendering without forcing a per-request render.
export const revalidate = 3600;

const VERIFIERS = [
  {
    chain: "Base",
    address: "0xa03A353d890033aC9b3044776440C2a4c9E849EA",
    explorer:
      "https://basescan.org/address/0xa03A353d890033aC9b3044776440C2a4c9E849EA",
  },
  {
    chain: "Solana",
    address: "9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad",
    explorer:
      "https://solscan.io/account/9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad",
  },
  {
    chain: "Sui",
    address:
      "0x278301424c954dcfdb6e46407728964271fbfff3dc1d4fae5b799c7e977bd4c5",
    explorer:
      "https://suiscan.xyz/mainnet/object/0x278301424c954dcfdb6e46407728964271fbfff3dc1d4fae5b799c7e977bd4c5",
  },
];

const MAPPING = [
  {
    requirement: "(a) Start & end date/time of each use",
    implementation:
      "Block timestamp at proof submission on-chain. Immutable, UTC-normalized, independently verifiable.",
  },
  {
    requirement: "(b) Reference database the input was checked against",
    implementation:
      "The circuit's Merkle root commitment — cryptographically bound inside every proof. Changes to the reference database produce a new, visible root.",
  },
  {
    requirement: "(c) Input data for which the search led to a match",
    implementation:
      "Proof public inputs + unique nullifier + proof hash. The private witness — face embedding, document content, biometric template — is never transmitted and never stored.",
  },
  {
    requirement: "(d) Natural persons involved in verification (Art. 14(5))",
    implementation:
      "Cryptographic signature of the human reviewer's wallet or identity key, bound into the log record. Produces a non-repudiable human-in-the-loop trail.",
  },
];

const METRICS = [
  { value: "13", label: "Production circuits" },
  { value: "0.4–5 s", label: "Proof generation" },
  { value: "~200 B", label: "Proof size" },
  { value: "< 2 ms", label: "Verification time" },
  { value: "3", label: "Mainnet chains" },
  { value: "0", label: "Raw PII retained" },
];

const COMPARISON = [
  {
    category: "SIEM / log aggregation",
    examples: "Splunk, Datadog, Elastic",
    gap: "Stores raw PII. No cryptographic integrity. Direct GDPR exposure.",
  },
  {
    category: "AI observability",
    examples: "Arize, Fiddler, WhyLabs",
    gap: "Model drift and fairness focus. No per-match regulator-facing audit trail.",
  },
  {
    category: "AI governance platforms",
    examples: "Credo AI, Holistic AI",
    gap: "Policy and risk-assessment layer. Presumes technical logging already solved.",
  },
  {
    category: "In-house blockchain logging",
    examples: "Custom builds",
    gap: "12–24 months engineering. Requires ZK expertise. No production verifiers across chains.",
  },
];

function EnterpriseHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zk-darker/85 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        <Link href="/enterprise" className="flex items-center gap-3 group">
          <img src="/zkrune-log.png" alt="zkRune" className="h-9 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-hatton text-white">zkRune</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-zk-gray">
              For Compliance
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#paradox"
            className="text-sm font-medium text-zk-gray hover:text-white transition-colors uppercase tracking-wider"
          >
            The Paradox
          </a>
          <a
            href="#mapping"
            className="text-sm font-medium text-zk-gray hover:text-white transition-colors uppercase tracking-wider"
          >
            Article 12 Mapping
          </a>
          <a
            href="#readiness"
            className="text-sm font-medium text-zk-gray hover:text-white transition-colors uppercase tracking-wider"
          >
            Readiness
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-zk-gray hover:text-white transition-colors uppercase tracking-wider"
          >
            Contact
          </a>
        </nav>

        <a
          href="mailto:zkruneprotocol@gmail.com?subject=Article%2012%20Technical%20Session"
          className="hidden md:inline-flex px-5 py-2 bg-white text-zk-darker font-medium rounded-full hover:bg-zk-gray/90 transition-all text-sm"
        >
          Book a session
        </a>
      </div>
    </header>
  );
}

function CountdownBadge() {
  const deadline = new Date("2026-08-02T00:00:00Z").getTime();
  const now = Date.now();
  const days = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-secondary/40 bg-zk-secondary/10 rounded-full backdrop-blur-sm">
      <div className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
      <span className="text-xs font-bold text-zk-secondary uppercase tracking-wider">
        Article 12 binding in {days} days · 2 August 2026
      </span>
    </div>
  );
}

export default function EnterprisePage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <EnterpriseHeader />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[800px] overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-secondary/10 blur-[120px]" />
        <div className="absolute top-64 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-primary/10 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-24 max-w-6xl mx-auto">
        <div className="space-y-8">
          <CountdownBadge />
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-4xl">
            Article 12-compliant logging for{" "}
            <span className="text-zk-secondary">high-risk AI</span>.
            <br />
            Retain zero personal data.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            zkRune is the cryptographic record-keeping layer for{" "}
            <span className="text-white">EU AI Act Article 12</span>. Every
            decision your AI system makes becomes a tamper-evident Groth16
            proof — verifiable by a regulator, containing no raw input data, at
            under 200 bytes.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=Article%2012%20Technical%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session%20on%20Article%2012%20compliance."
              className="px-6 py-3 bg-zk-secondary text-zk-darker font-semibold rounded-full hover:bg-zk-secondary/90 transition-all"
            >
              Book a 30-minute session
            </a>
            <a
              href="#mapping"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              See the Article 12 mapping
            </a>
          </div>
        </div>
      </section>

      {/* PARADOX */}
      <section
        id="paradox"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              The paradox
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              EU law will require you to log personal data. EU law also forbids
              you from keeping it.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              For Annex III point 1(a) AI systems, Article 12(4) mandates
              retention of the "input data for which the search has led to a
              match" for at least six months. GDPR Article 5(1)(c) mandates
              data minimisation. Both are binding. Both apply to the same
              system, at the same moment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-zk-primary/20 bg-zk-primary/5">
              <div className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                GDPR Art. 5(1)(c) — in force since 2018
              </div>
              <p className="text-lg text-white leading-relaxed mb-4">
                "Adequate, relevant and limited to what is necessary in
                relation to the purposes for which they are processed."
              </p>
              <div className="text-sm text-zk-gray">
                Principle: delete what you don't need.
              </div>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/5">
              <div className="text-xs font-bold text-zk-secondary uppercase tracking-wider mb-3">
                AI Act Art. 12(4)(c) — binding 2 Aug 2026
              </div>
              <p className="text-lg text-white leading-relaxed mb-4">
                "The input data for which the search has led to a match."
                Retained for at least six months.
              </p>
              <div className="text-sm text-zk-gray">
                Principle: keep what regulators may need to inspect.
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-zk-darker/60">
            <p className="text-zk-gray leading-relaxed">
              Most vendors are choosing one of three bad options: log raw PII
              and eat the GDPR exposure, log partial hashes and hope regulators
              accept it, or log nothing and hope no one audits.{" "}
              <span className="text-white">None survive conformity assessment.</span>
            </p>
          </div>
        </div>
      </section>

      {/* MAPPING */}
      <section
        id="mapping"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Article 12(4) mapping
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Every sub-requirement, satisfied cryptographically.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              A direct mapping of the four statutory log fields to the
              primitives zkRune already produces in production.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full">
              <thead className="bg-zk-dark/60 border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zk-gray uppercase tracking-wider w-1/3">
                    Art. 12(4) requirement
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zk-gray uppercase tracking-wider">
                    zkRune implementation
                  </th>
                </tr>
              </thead>
              <tbody>
                {MAPPING.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5 text-white font-medium align-top">
                      {row.requirement}
                    </td>
                    <td className="px-6 py-5 text-zk-gray leading-relaxed">
                      {row.implementation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* READINESS */}
      <section
        id="readiness"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Proof of readiness
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Not a slide deck. A production system.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="p-5 rounded-xl border border-white/10 bg-zk-darker/60 text-center"
              >
                <div className="font-hatton text-2xl md:text-3xl text-white">
                  {m.value}
                </div>
                <div className="text-xs text-zk-gray mt-1 uppercase tracking-wider">
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zk-gray uppercase tracking-wider">
              Mainnet verifier contracts — publicly inspectable today
            </h3>
            <div className="space-y-2">
              {VERIFIERS.map((v) => (
                <a
                  key={v.chain}
                  href={v.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 rounded-xl border border-white/10 bg-zk-darker/60 hover:border-zk-secondary/40 hover:bg-zk-secondary/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-zk-secondary uppercase tracking-wider w-16">
                      {v.chain}
                    </span>
                    <code className="text-xs md:text-sm text-zk-gray group-hover:text-white transition-colors break-all">
                      {v.address}
                    </code>
                  </div>
                  <span className="text-xs text-zk-gray group-hover:text-zk-secondary transition-colors whitespace-nowrap">
                    View on explorer →
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Who this is for
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              High-risk AI systems under Annex III point 1(a).
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-white/10 bg-zk-dark/40">
              <h3 className="font-hatton text-xl text-white mb-4">
                Primary scope
              </h3>
              <ul className="space-y-3 text-zk-gray">
                <li className="flex gap-3">
                  <span className="text-zk-secondary mt-1">→</span>
                  <span>
                    Remote biometric identification systems (face, iris, voice)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-zk-secondary mt-1">→</span>
                  <span>
                    Identity verification and KYC platforms in regulated
                    industries
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-zk-secondary mt-1">→</span>
                  <span>
                    Age-assurance AI under DSA and national age-gating mandates
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-zk-secondary mt-1">→</span>
                  <span>
                    Border control, access control, critical-infrastructure
                    identity checkpoints
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-zk-secondary mt-1">→</span>
                  <span>Financial-sector customer-due-diligence AI</span>
                </li>
              </ul>
            </div>

            <div className="p-6 md:p-8 rounded-2xl border border-white/10 bg-zk-dark/40">
              <h3 className="font-hatton text-xl text-white mb-4">
                Buyer profile
              </h3>
              <div className="space-y-4 text-zk-gray">
                <div>
                  <div className="text-white font-medium mb-1">
                    Data Protection Officer
                  </div>
                  <div className="text-sm">
                    Owns GDPR risk. Co-signs logging architecture.
                  </div>
                </div>
                <div>
                  <div className="text-white font-medium mb-1">
                    Head of AI Governance / AI Risk
                  </div>
                  <div className="text-sm">
                    Owns AI Act conformity assessment.
                  </div>
                </div>
                <div>
                  <div className="text-white font-medium mb-1">CISO</div>
                  <div className="text-sm">
                    Owns log integrity, audit readiness, incident response.
                  </div>
                </div>
                <p className="text-sm italic pt-2 border-t border-white/10">
                  zkRune is adopted once, referenced by all three.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Competitive landscape
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Why existing tooling doesn't solve Article 12.
            </h2>
          </div>

          <div className="space-y-3">
            {COMPARISON.map((c) => (
              <div
                key={c.category}
                className="grid md:grid-cols-[1fr_1fr_2fr] gap-2 md:gap-6 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <div className="text-white font-medium">{c.category}</div>
                <div className="text-sm text-zk-gray italic">{c.examples}</div>
                <div className="text-sm text-zk-gray">{c.gap}</div>
              </div>
            ))}
            <div className="grid md:grid-cols-[1fr_1fr_2fr] gap-2 md:gap-6 p-5 rounded-xl border border-zk-secondary/40 bg-zk-secondary/10">
              <div className="text-zk-secondary font-bold">zkRune</div>
              <div className="text-sm text-zk-gray italic">—</div>
              <div className="text-sm text-white">
                Purpose-built for Article 12(4). Ships today. No PII retained.
                Multi-chain. Regulator-inspectable.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Implementation
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              From signature to Article 12-ready in under 90 days.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                dur: "2 weeks",
                title: "Scoping & mapping",
                body: "Annex III classification, circuit selection, data-flow diagram, DPIA inputs.",
              },
              {
                step: "2",
                dur: "3–6 weeks",
                title: "Integration",
                body: "SDK embedded in inference pipeline, test proofs generated, reviewer-signing wired.",
              },
              {
                step: "3",
                dur: "2 weeks",
                title: "Regulator dossier",
                body: "Article 12(4)(a)-(d) mapping, conformity annex, log-export sample pack.",
              },
              {
                step: "4",
                dur: "1 week",
                title: "Production cutover",
                body: "Verifier registration, monitoring enabled, retention policies signed off.",
              },
            ].map((p) => (
              <div
                key={p.step}
                className="p-5 rounded-2xl border border-white/10 bg-zk-dark/40 flex flex-col"
              >
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-hatton text-3xl text-zk-secondary">
                    {p.step}
                  </span>
                  <span className="text-xs text-zk-gray uppercase tracking-wider">
                    {p.dur}
                  </span>
                </div>
                <div className="text-white font-medium mb-2">{p.title}</div>
                <div className="text-sm text-zk-gray leading-relaxed">
                  {p.body}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-zk-gray mt-6 italic">
            Engagements starting April–May 2026 finish well inside the 2 August
            2026 deadline.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-24 border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <CountdownBadge />
          <h2 className="font-hatton text-3xl md:text-5xl text-white">
            A 30-minute technical session with your DPO and AI governance
            lead.
          </h2>
          <p className="text-zk-gray text-lg max-w-2xl mx-auto">
            We will walk through your Annex III classification, run a live
            proof against a representative decision flow, and deliver a draft
            Article 12 mapping tailored to your system within 5 business days.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=Article%2012%20Technical%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session."
              className="px-8 py-3 bg-zk-secondary text-zk-darker font-semibold rounded-full hover:bg-zk-secondary/90 transition-all"
            >
              zkruneprotocol@gmail.com
            </a>
            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              Source code
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 md:px-12 lg:px-16 py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-sm text-zk-gray">
          <div className="space-y-1">
            <div className="font-hatton text-white text-lg">zkRune</div>
            <div>
              Article 12-compliant by construction. Log every match. Retain zero
              personal data.
            </div>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">
              Protocol site
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

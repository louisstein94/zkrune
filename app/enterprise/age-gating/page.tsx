import type { Metadata } from "next";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import MainnetVerifiersGrid from "@/components/MainnetVerifiersGrid";

export const metadata: Metadata = {
  title: "zkRune for age-gating — DSA · UK OSA · US state laws",
  description:
    "Privacy-preserving age verification for platforms in scope of DSA Art. 28, UK Online Safety Act, and the growing patchwork of US state age-gating laws. One ZK widget, three jurisdictions, no government-ID retention.",
  alternates: { canonical: "https://zkrune.com/enterprise/age-gating" },
  openGraph: {
    title: "zkRune for age-gating — DSA · UK OSA · US state laws",
    description:
      "Privacy-preserving age verification across EU, UK, and US state regimes. No ID retention, no breach surface.",
    url: "https://zkrune.com/enterprise/age-gating",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune for age-gating — DSA · UK OSA · US state laws",
    description:
      "Privacy-preserving age verification across EU, UK, and US state regimes.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const HEADER_NAV = [
  { href: "#opportunity", label: "Opportunity" },
  { href: "#buyers", label: "Who We Serve" },
  { href: "#mapping", label: "Jurisdiction Map" },
  { href: "#contact", label: "Contact" },
];

const HEADER_CTA = {
  href: "mailto:zkruneprotocol@gmail.com?subject=Age-Gating%20Compliance%20Session",
  label: "Book a session",
};

const BUYERS = [
  {
    role: "Dating & social platforms",
    examples:
      "Bumble, Hinge, Grindr, Tinder, Match Group, Discord, Reddit, BeReal, TikTok regional ops",
    fit: "Drop-in widget verifies age before any DM, photo upload, or account upgrade. Your service receives the assertion ('age ≥ 18') and the cryptographic proof hash — never the birthdate. Ofcom's 'highly effective' age-assurance criteria and DSA Art. 28 risk assessments map directly to the widget's output.",
  },
  {
    role: "Adult content & alcohol-vape e-commerce",
    examples:
      "Pornhub / Aylo, OnlyFans, Fanvue, BrewDog DTC, Pernod Ricard online, Juul / Vuse direct-to-consumer",
    fit: "The two highest-risk verticals under UK OSA and US state regimes (TX HB 1181, LA HB 142, UT, MS, VA + 7 more in pipeline). Same widget; per-jurisdiction minimum age via a single config flag. Proof hash gives you the audit log without the data-breach liability.",
  },
  {
    role: "Gambling & regulated wagering",
    examples:
      "DraftKings, FanDuel, bet365, Entain, Flutter, Evolution Gaming partner platforms",
    fit: "Sophisticated AML / KYC stack already in place; zkRune adds a privacy-preserving age and jurisdictional-eligibility layer that differentiates your registration UX without adding regulatory risk. Composable with existing identity orchestrators (Onfido, Sumsub, Veriff) — slots underneath, not in place of.",
  },
];

const JURISDICTION_MAPPING = [
  {
    jurisdiction: "EU — Digital Services Act Art. 28",
    requirement:
      "Online platforms accessible to minors must implement appropriate measures to ensure a high level of privacy, safety, and security. VLOPs face additional risk-assessment obligations under Art. 34–35.",
    zkRuneCircuit: "age-verification",
    notes:
      "Widget output binds an age assertion to a cryptographic proof. DSA risk assessment can cite the proof hash as the integrity anchor. No raw birthdates collected = data-minimisation argument under GDPR Art. 5(1)(c) is automatic.",
  },
  {
    jurisdiction: "UK — Online Safety Act 2023, Part 5",
    requirement:
      "Providers must use 'highly effective age assurance' to keep children from accessing pornographic content. Ofcom is enforcing actively and naming non-compliant platforms publicly.",
    zkRuneCircuit: "age-verification",
    notes:
      "Maps to Ofcom's Method 2 (facial age estimation) → Method 5 (digital identity wallets) range. Crucially: with zkRune, the underlying signal stays on the user's device; the platform only sees the proof. Closes the GDPR exposure that government-ID collection creates.",
  },
  {
    jurisdiction: "US — Texas HB 1181 (and equivalents)",
    requirement:
      "Commercial entities publishing material that is harmful to minors must verify users are at least 18 using a 'reasonable age verification method'.",
    zkRuneCircuit: "age-verification · range-proof",
    notes:
      "TX, LA, MS, UT, VA, and 7+ others in the pipeline. Patchwork of state laws with conflicting evidentiary standards — zkRune's per-jurisdiction config lets you set minimum age and accepted assurance method without recoding the integration.",
  },
  {
    jurisdiction: "EU — DSA Art. 35 risk assessments",
    requirement:
      "VLOPs and VLOSEs must annually assess systemic risks including age-inappropriate access, and document mitigations.",
    zkRuneCircuit: "age-verification · anonymous-reputation",
    notes:
      "Anonymous-reputation circuit lets risk-assessment teams demonstrate moderation outcomes (e.g. 'X% of flagged accounts cleared age assurance') without retaining any user-level reputation history.",
  },
];

const READINESS = [
  {
    label: "Audited circuits",
    value: "14 production Groth16 circuits",
    detail:
      "Age-verification is the workhorse — used in production on the zkRune homepage demo. Same circuit underpins this entire compliance surface.",
  },
  {
    label: "Proof generation",
    value: "Sub-second in-browser",
    detail:
      "Critical for conversion: a UK OSA-style flow that takes more than 5 seconds bleeds funnel. Age-verification proof: ~200 ms median on mobile, ~80 ms on desktop.",
  },
  {
    label: "Proof size",
    value: "~200 bytes",
    detail:
      "Compact. Suitable for the multi-year retention requirements Ofcom and the EU Commission expect to inspect on demand.",
  },
  {
    label: "Mainnet anchors",
    value: "Solana · Base · Sui",
    detail:
      "Ofcom inspectors, EU national authorities, or US state attorneys-general can independently re-verify any proof against the on-chain key — no dependency on the platform or zkRune as a vendor.",
  },
  {
    label: "Licence",
    value: "MIT / Apache-2.0",
    detail:
      "Open source by default. The widget code is auditable by your security team and any regulator that asks. No vendor lock-in.",
  },
  {
    label: "Audit",
    value: "Q3–Q4 2026 (planned)",
    detail:
      "Third-party security audit scheduled. Honest disclosure of current posture at /trust — including what we have not yet proved.",
  },
];

const NOT_BUILDING = [
  "Government-ID collection or storage (the thing we let you avoid)",
  "Facial age estimation or biometric onboarding (Yoti, iProov, Veriff do that)",
  "Trust & Safety operations / content moderation pipelines",
  "Sanctions or PEP screening for age-related verifications",
  "Cross-platform child-safety reporting (NCMEC, IWF, INHOPE pipelines)",
];

export default function EnterpriseAgeGatingPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <EnterpriseHeader
        subtitle="For Age-Aware Platforms"
        navItems={HEADER_NAV}
        cta={HEADER_CTA}
        homeHref="/enterprise/age-gating"
      />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[800px] overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-primary/10 blur-[120px]" />
        <div className="absolute top-64 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-accent/10 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-24 max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
              DSA Art. 28 binding · UK OSA enforced · US state laws active
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-4xl">
            Age verification, three jurisdictions,{" "}
            <span className="text-zk-primary">zero IDs retained</span>.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            zkRune is the privacy-preserving age-assurance layer for platforms
            in scope of the EU Digital Services Act, the UK Online Safety Act,
            and the growing patchwork of US state age-gating laws. One ZK
            widget, three jurisdictions, no government-ID retention, no
            breach surface.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=Age-Gating%20Compliance%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session%20on%20zkRune%20for%20age-gating."
              className="px-6 py-3 bg-zk-primary text-white font-semibold rounded-full hover:bg-zk-primary/90 transition-all"
            >
              Book a 30-minute session
            </a>
            <a
              href="#mapping"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              See the jurisdiction map
            </a>
          </div>
          <p className="text-sm text-zk-gray pt-2">
            Outside age-gating scope? See the{" "}
            <a
              href="/regulations"
              className="text-zk-secondary hover:text-zk-secondary/80 transition-colors underline underline-offset-2"
            >
              full regulations matrix
            </a>{" "}
            (AI Act, MiCA, eIDAS 2.0, DORA, NIS2, GDPR).
          </p>
        </div>
      </section>

      {/* OPPORTUNITY */}
      <section
        id="opportunity"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              The opportunity
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Every regulator wants stronger age verification. Every privacy
              authority wants less personal data. Platforms are caught in
              between — and the default answer is a breach waiting to happen.
            </h2>
            <p className="text-zk-gray max-w-3xl leading-relaxed">
              Most platforms address UK OSA and US state laws by collecting
              government-issued ID. That data immediately becomes a GDPR
              liability, a breach target, and an irreversible privacy cost on
              the user. zkRune lets you satisfy the same regulatory tests
              without ever receiving the underlying document.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-zk-primary/20 bg-zk-primary/5">
              <div className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                What regulators want to see
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Age verification before access to restricted content</li>
                <li>• Highly effective methods (not just self-declaration)</li>
                <li>• Audit trail that an inspector can re-verify</li>
                <li>• Per-jurisdiction minimum-age enforcement</li>
                <li>• Annual systemic-risk assessment for VLOPs</li>
              </ul>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/5">
              <div className="text-xs font-bold text-zk-secondary uppercase tracking-wider mb-3">
                What zkRune delivers
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Sub-second ZK proof of `age ≥ N` in the browser</li>
                <li>• No birthdate, no ID, no biometric on the server</li>
                <li>• Re-verifiable against on-chain anchored vKeys</li>
                <li>• Per-jurisdiction min-age via one config flag</li>
                <li>• MIT-licensed widget + SDK + hosted verifier</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-zk-darker/60">
            <p className="text-zk-gray leading-relaxed">
              <span className="text-white font-medium">
                We do not collect government IDs.
              </span>{" "}
              That is the point. The widget integrates with your existing
              identity stack (Onfido, Yoti, iProov, Veriff) as the
              privacy-preserving evidence path — replacing the
              raw-ID-retention default with a cryptographic proof that
              regulators can inspect.
            </p>
          </div>
        </div>
      </section>

      {/* BUYER TYPOLOGY */}
      <section id="buyers" className="relative z-10 px-6 md:px-12 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Who we serve
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Three platform categories with the sharpest regulatory pressure
              and the most acute privacy exposure.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {BUYERS.map((b) => (
              <article
                key={b.role}
                className="p-6 rounded-2xl border border-white/10 bg-zk-dark/40 hover:border-zk-primary/30 transition-colors"
              >
                <h3 className="font-hatton text-xl text-white mb-2">{b.role}</h3>
                <p className="text-xs text-zk-gray/70 mb-4 leading-relaxed">
                  {b.examples}
                </p>
                <p className="text-sm text-zk-gray leading-relaxed">{b.fit}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* JURISDICTION MAPPING */}
      <section
        id="mapping"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Jurisdiction map
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Four regulatory regimes, one circuit, one widget.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              Mapping is informational; minimum-age thresholds and accepted
              assurance methods vary by jurisdiction. Consult your DPO and the
              relevant national authority before claiming certification.
            </p>
          </div>

          <div className="space-y-3">
            {JURISDICTION_MAPPING.map((row) => (
              <div
                key={row.jurisdiction}
                className="grid md:grid-cols-12 gap-4 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    Jurisdiction
                  </p>
                  <p className="text-white text-sm font-medium">
                    {row.jurisdiction}
                  </p>
                  <p className="text-xs text-zk-gray/70 mt-1 leading-relaxed">
                    {row.requirement}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    zkRune circuit
                  </p>
                  <code className="text-xs text-zk-primary font-mono break-all">
                    {row.zkRuneCircuit}
                  </code>
                </div>
                <div className="md:col-span-5">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-zk-gray leading-relaxed">
                    {row.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* READINESS */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Readiness
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Production today. The widget you can drop on a landing page
              tomorrow.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {READINESS.map((r) => (
              <div
                key={r.label}
                className="p-5 rounded-xl border border-white/10 bg-zk-dark/40"
              >
                <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em] mb-2">
                  {r.label}
                </p>
                <p className="font-hatton text-xl text-white mb-2">{r.value}</p>
                <p className="text-xs text-zk-gray leading-relaxed">
                  {r.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 md:p-8 rounded-2xl border border-zk-gray/20 bg-zk-darker/60">
            <h3 className="font-hatton text-xl text-white mb-3">
              What zkRune deliberately does <span className="text-zk-secondary">not</span> do
            </h3>
            <p className="text-zk-gray mb-4 text-sm leading-relaxed">
              The list below is what existing T&amp;S vendors and identity
              providers already handle. zkRune slots underneath as the
              privacy-preserving evidence path — not as a replacement for the
              orchestration you already trust.
            </p>
            <ul className="space-y-2 text-sm text-zk-gray">
              {NOT_BUILDING.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-zk-gray/60 mt-0.5">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VERIFIERS */}
      <div className="bg-zk-dark/40 border-y border-white/5">
        <MainnetVerifiersGrid
          eyebrow="Mainnet anchors"
          heading="Verification keys on three independent chains."
          body="Ofcom inspectors, EU national authorities, US state attorneys-general, or your own internal audit can independently re-verify any proof against the on-chain key — no dependency on the platform or zkRune as a vendor."
        />
      </div>

      {/* CONTACT */}
      <section
        id="contact"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Evaluating zkRune for an age-gating obligation?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We work directly with Trust &amp; Safety leads, DPOs, and product
            engineers at platforms in scope of UK OSA, DSA Art. 28, and US
            state laws. The fastest path is a 30-minute technical session
            with the widget integration and trust documentation ready to
            forward to your security team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=Age-Gating%20Compliance%20Session"
              className="px-8 py-3 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
            >
              Email compliance@
            </a>
            <a
              href="/docs/widget"
              className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all"
            >
              Widget integration docs
            </a>
          </div>
          <p className="text-xs text-zk-gray/60 pt-4">
            zkruneprotocol@gmail.com · @rune_zk on X · github.com/louisstein94/zkrune
          </p>
        </div>
      </section>
    </main>
  );
}

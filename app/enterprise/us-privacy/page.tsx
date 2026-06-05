import type { Metadata } from "next";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import MainnetVerifiersGrid from "@/components/MainnetVerifiersGrid";

export const metadata: Metadata = {
  title: "zkRune for US privacy — CCPA · CPA · TDPSA · Colorado AI Act · HIPAA",
  description:
    "Privacy-preserving compliance infrastructure for the US state-level data-privacy patchwork — California CPRA, Colorado CPA + AI Act, Texas TDPSA, Virginia VCDPA, Connecticut CTDPA, Utah UCPA — and the sectoral baseline: HIPAA, COPPA, GLBA, FCRA. One ZK primitive set, every jurisdiction.",
  alternates: { canonical: "https://zkrune.com/enterprise/us-privacy" },
  openGraph: {
    title: "zkRune for US privacy — CCPA · CPA · TDPSA · Colorado AI Act · HIPAA",
    description:
      "Privacy-preserving compliance for the US state patchwork + sectoral HIPAA / COPPA / GLBA / FCRA.",
    url: "https://zkrune.com/enterprise/us-privacy",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune for US privacy — state laws + HIPAA + COPPA + GLBA + FCRA",
    description:
      "Privacy-preserving compliance infrastructure for the US state-level data-privacy patchwork.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const HEADER_NAV = [
  { href: "#opportunity", label: "Opportunity" },
  { href: "#buyers", label: "Who We Serve" },
  { href: "#mapping", label: "State + Sectoral Map" },
  { href: "#contact", label: "Contact" },
];

const HEADER_CTA = {
  href: "mailto:zkruneprotocol@gmail.com?subject=US%20Privacy%20Compliance%20Session",
  label: "Book a session",
};

const BUYERS = [
  {
    role: "Multi-state SaaS &amp; consumer platforms",
    examples:
      "Direct-to-consumer SaaS, e-commerce, social platforms, fitness / wellness apps, dating, gaming, streaming, gig-economy marketplaces with users across California, Texas, Colorado, Virginia, Utah, Connecticut",
    fit: "One privacy architecture that satisfies six (and rising) state comprehensive privacy laws simultaneously. The same ZK proof that satisfies California CPRA's data-minimisation expectation also satisfies Colorado CPA and Texas TDPSA. No state-by-state collection-and-storage decision tree to maintain.",
  },
  {
    role: "AI / ML vendors deploying in US",
    examples:
      "AI tooling vendors, model providers, AI-powered SaaS, automated decisioning platforms, RPA vendors, agent platforms (cross-link to Proof of Agent)",
    fit: "Colorado AI Act becomes binding 1 February 2026 for high-risk AI systems. New York, Texas, Illinois, and California are advancing parallel AI rules. zkRune handles the consequential-decision logging and impact-assessment evidence path that satisfies the auditability requirement without retaining the personal data the decision was made on.",
  },
  {
    role: "Sectoral compliance — health · finance · child-facing",
    examples:
      "HIPAA-regulated providers and business associates, GLBA-regulated financial institutions, COPPA-regulated children's online services, FCRA-regulated credit-reporting bureaus and resellers",
    fit: "Sectoral US regimes have lived with the privacy paradox the longest. ZK-attested compliance turns indefinite retention of sensitive records into compact proofs that an OCR auditor, FTC investigator, or state attorney general can independently re-verify. Especially relevant where states layer additional rules on top (CCPA exemptions for HIPAA scope are narrow and shifting).",
  },
];

const STATE_SECTORAL_MAPPING = [
  {
    regime: "California — CPRA (CCPA as amended)",
    requirement:
      "Limit collection to what is reasonably necessary and proportionate; offer purpose-limited data use; honour consumer rights including right to deletion and right to limit sensitive PI use. CPPA actively enforcing.",
    zkRuneCircuit: "age-verification · range-proof · membership-proof",
    notes:
      "Verify thresholds (age, residency, eligibility) without ingesting the underlying personal data. Right-to-delete becomes structurally trivial: there is nothing to delete because nothing was collected server-side.",
  },
  {
    regime: "Colorado — CPA + AI Act (SB 24-205)",
    requirement:
      "Comprehensive privacy law (binding July 2023) and the first US state AI Act (binding 1 February 2026) requiring impact assessments and consumer notification for high-risk AI decisions.",
    zkRuneCircuit: "hash-preimage · signature-verification · membership-proof",
    notes:
      "Cryptographic commitment to each consequential AI decision; the impact assessment becomes a proof an attorney general can re-verify. Cleanly composable with the /enterprise/ai-agents Proof of Agent framework.",
  },
  {
    regime: "Texas — TDPSA (Data Privacy & Security Act)",
    requirement:
      "Binding 1 July 2024. Applies to any business processing personal data of Texas residents above defined thresholds; includes sensitive-data consent requirement and data-minimisation principle.",
    zkRuneCircuit: "age-verification · credential-proof · range-proof",
    notes:
      "Sensitive-data thresholds (health, biometric, precise geolocation) become provable without raw retention. TDPSA's sensitive-data consent record can be a signed Merkle commitment rather than a retained consent log with PII attached.",
  },
  {
    regime: "Virginia · Connecticut · Utah — VCDPA / CTDPA / UCPA",
    requirement:
      "Comprehensive privacy laws binding in 2023 across three states with overlapping but non-identical sensitive-data, consent, and DPIA expectations.",
    zkRuneCircuit: "membership-proof · hash-preimage",
    notes:
      "One ZK primitive set, three legal regimes. The DPIA expectations align with the cryptographic-commitment pattern: the assessment exists, the inputs are provable, the outputs are auditable — none of the underlying data is retained.",
  },
  {
    regime: "HIPAA (45 CFR Parts 160 + 164)",
    requirement:
      "Covered entities and business associates must implement safeguards for PHI, including minimum-necessary use, accounting of disclosures, and risk analysis. OCR audits aggressive; breach exposure compounds annually.",
    zkRuneCircuit: "membership-proof · signature-verification · patience-proof",
    notes:
      "Minimum-necessary becomes literal: the verifier sees only the proof of eligibility / qualification / threshold, not the underlying record. Accounting of disclosures becomes a chain of signed proofs rather than a retained query log.",
  },
  {
    regime: "COPPA (15 USC §§ 6501-06)",
    requirement:
      "Operators of children's online services must obtain verifiable parental consent before collecting personal information from children under 13. FTC actively enforcing; penalties scaled to user counts.",
    zkRuneCircuit: "age-verification · signature-verification",
    notes:
      "Verifiable parental consent via parent-signed authorisation token plus age-verification proof that the child is under 13 (or selectively that they are over 13 and out of COPPA scope). No DOB collected, no consent ledger holding child PII.",
  },
  {
    regime: "GLBA (15 USC §§ 6801-09) + Safeguards Rule",
    requirement:
      "Financial institutions must safeguard customer non-public personal information; FTC's updated Safeguards Rule requires enumerated technical controls and timely breach notification (binding May 2024 amendment).",
    zkRuneCircuit: "balance-proof · range-proof · signature-verification",
    notes:
      "Solvency, eligibility, and risk-threshold proofs that satisfy KYC / underwriting / fraud rules without indefinite NPI retention. Safeguards Rule's risk-assessment obligation gets a cryptographic chain-of-evidence backbone.",
  },
  {
    regime: "FCRA (15 USC § 1681 et seq.)",
    requirement:
      "Consumer-reporting agencies and furnishers must ensure maximum-possible accuracy, provide consumer access and dispute rights, and limit permissible-purpose access. CFPB and FTC joint enforcement.",
    zkRuneCircuit: "credential-proof · range-proof · membership-proof",
    notes:
      "Permissible-purpose access becomes a cryptographic attestation: the requestor proved their purpose category (employment, credit, insurance underwriting) without revealing the requesting entity to the consumer report. Accuracy disputes resolved against signed commitments rather than mutable retained records.",
  },
];

const READINESS = [
  {
    label: "Audited circuits",
    value: "14 production Groth16 circuits",
    detail:
      "Same primitive set that satisfies the EU regulatory matrix also satisfies the US state and sectoral patchwork. One audit, many regimes.",
  },
  {
    label: "Multi-state coverage",
    value: "6+ state comprehensive laws",
    detail:
      "CA · CO · CT · TX · UT · VA today, with Oregon, Iowa, Indiana, Tennessee, Montana, New Jersey, Delaware, New Hampshire, Maryland, Minnesota, Kentucky, Rhode Island all in 2025–2026 staggered effective dates.",
  },
  {
    label: "Proof generation",
    value: "0.4–5 seconds in-browser",
    detail:
      "Suitable for high-frequency consumer flows. Critical for state-AG-facing audit: every proof is dated and re-verifiable independently.",
  },
  {
    label: "Mainnet anchors",
    value: "Solana · Base · Sui",
    detail:
      "State attorneys general, OCR, FTC, CFPB investigators can independently re-verify any proof against on-chain keys. No dependency on the regulated entity or zkRune as a vendor for evidence integrity.",
  },
  {
    label: "Licence",
    value: "MIT / Apache-2.0",
    detail:
      "Open source by default. Auditable by your internal security team, state regulators, and sectoral examiners. No vendor lock-in.",
  },
  {
    label: "Audit",
    value: "Q3–Q4 2026 (planned)",
    detail:
      "Third-party security audit scheduled. SOC 2 / ISO 27001 / HITRUST roadmap follows. Honest disclosure of current posture at /trust — including what we have not yet proved.",
  },
];

const NOT_BUILDING = [
  "State-level legal advisory or compliance consulting (counsel at Davis Wright Tremaine, Hogan Lovells, OneTrust handle that)",
  "Privacy management platforms — DSAR routing, consent orchestration, cookie tooling (OneTrust, TrustArc, Osano handle that)",
  "Healthcare-grade EHR / EMR systems (Epic, Cerner, athenahealth handle that)",
  "Credit-reporting bureau infrastructure (Equifax, Experian, TransUnion are the bureaus)",
  "Federal Trade Commission / state AG enforcement workflow tooling (we are the evidence layer underneath)",
];

export default function EnterpriseUsPrivacyPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <EnterpriseHeader
        subtitle="For US Privacy &amp; Sectoral Compliance"
        navItems={HEADER_NAV}
        cta={HEADER_CTA}
        homeHref="/enterprise/us-privacy"
      />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[800px] overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-secondary/10 blur-[120px]" />
        <div className="absolute top-64 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-primary/10 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-24 max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-secondary/40 bg-zk-secondary/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
            <span className="text-xs font-bold text-zk-secondary uppercase tracking-wider">
              6 state comprehensive laws active · Colorado AI Act binding 1 Feb 2026 · 12+ more states 2026
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-4xl">
            One privacy architecture for the{" "}
            <span className="text-zk-secondary">US state patchwork</span>.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            Six state comprehensive privacy laws are active. Twelve more
            states pass or amend laws every 2026 session. Colorado just
            opened the AI-decision regulation front. The federal sectoral
            baseline — HIPAA, COPPA, GLBA, FCRA — is layered on top. zkRune
            is the cryptographic primitive set that lets you satisfy all of
            them with the same architecture: prove what is required, retain
            what is not.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=US%20Privacy%20Compliance%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session%20on%20zkRune%20for%20US%20privacy%20compliance."
              className="px-6 py-3 bg-zk-secondary text-zk-darker font-semibold rounded-full hover:bg-zk-secondary/90 transition-all"
            >
              Book a 30-minute session
            </a>
            <a
              href="#mapping"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              See the state + sectoral map
            </a>
          </div>
          <p className="text-sm text-zk-gray pt-2">
            Building AI agents under Colorado AI Act?{" "}
            <a
              href="/enterprise/ai-agents"
              className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
            >
              Proof of Agent
            </a>{" "}
            covers the agent-attestation layer. For age-specific
            obligations (TX HB 1181, LA HB 142, UT, MS, VA),{" "}
            <a
              href="/enterprise/age-gating"
              className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
            >
              age-gating
            </a>{" "}
            is the right entry point.
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
              The US is not converging on a federal privacy law. It is
              fragmenting state-by-state — and every state regulator wants
              proof you complied.
            </h2>
            <p className="text-zk-gray max-w-3xl leading-relaxed">
              The standard pattern is to maintain a state-by-state decision
              tree of what data to collect and when. That pattern ages
              poorly: each new state law adds a column to the matrix, each
              amendment moves the cells, and every retained dataset is a
              future enforcement exposure for an attorney general or the
              FTC. zkRune replaces the matrix with one cryptographic
              architecture that proves the requirement was met without
              retaining what the requirement was about.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/5">
              <div className="text-xs font-bold text-zk-secondary uppercase tracking-wider mb-3">
                What US regulators want to see
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Data-minimisation evidence (every comprehensive state law)</li>
                <li>• Sensitive-data consent records (TDPSA, CPA, VCDPA, CTDPA)</li>
                <li>• Impact assessments for high-risk AI (Colorado AI Act)</li>
                <li>• Verifiable parental consent (COPPA)</li>
                <li>• Minimum-necessary use of PHI (HIPAA)</li>
                <li>• Permissible-purpose access logs (FCRA)</li>
              </ul>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border border-zk-primary/20 bg-zk-primary/5">
              <div className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                What zkRune contributes
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• ZK-attested data minimisation (proof not data)</li>
                <li>• Signed consent commitments without PII attached</li>
                <li>• Cryptographic impact-assessment chains (AI decisions)</li>
                <li>• Verifiable parental authorisation tokens (COPPA)</li>
                <li>• Minimum-necessary as architectural guarantee</li>
                <li>• Permissible-purpose attestation proofs (FCRA)</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-zk-darker/60">
            <p className="text-zk-gray leading-relaxed">
              <span className="text-white font-medium">
                We are not a US privacy compliance platform.
              </span>{" "}
              OneTrust, TrustArc, Osano handle DSAR routing, consent
              orchestration, and policy management. zkRune is the
              cryptographic primitive underneath — the bit that turns a
              compliance assertion into a proof a state regulator or
              sectoral examiner can independently re-verify.
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
              Three categories with the most acute US privacy exposure right
              now.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {BUYERS.map((b) => (
              <article
                key={b.role}
                className="p-6 rounded-2xl border border-white/10 bg-zk-dark/40 hover:border-zk-secondary/30 transition-colors"
              >
                <h3
                  className="font-hatton text-xl text-white mb-2"
                  dangerouslySetInnerHTML={{ __html: b.role }}
                />
                <p className="text-xs text-zk-gray/70 mb-4 leading-relaxed">
                  {b.examples}
                </p>
                <p className="text-sm text-zk-gray leading-relaxed">{b.fit}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STATE + SECTORAL MAPPING */}
      <section
        id="mapping"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              State + sectoral map
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Eight regimes, one ZK primitive set.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              Mapping is informational; sensitive-data definitions,
              thresholds, and enforcement priorities vary by state and
              sector. Consult counsel and the relevant attorney general,
              OCR, FTC, or CFPB guidance before claiming certification.
            </p>
          </div>

          <div className="space-y-3">
            {STATE_SECTORAL_MAPPING.map((row) => (
              <div
                key={row.regime}
                className="grid md:grid-cols-12 gap-4 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    Regime
                  </p>
                  <p className="text-white text-sm font-medium">
                    {row.regime}
                  </p>
                  <p className="text-xs text-zk-gray/70 mt-1 leading-relaxed">
                    {row.requirement}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    zkRune circuit
                  </p>
                  <code className="text-xs text-zk-secondary font-mono break-all">
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
              The same primitive set that satisfies the EU regulatory matrix
              satisfies the US patchwork.
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
              What zkRune deliberately does{" "}
              <span className="text-zk-secondary">not</span> do
            </h3>
            <p className="text-zk-gray mb-4 text-sm leading-relaxed">
              The list below is what your existing legal, GRC, and sectoral
              tooling stack already handles. zkRune slots underneath as the
              cryptographic-evidence primitive — not as a replacement for
              counsel, privacy management platforms, or industry-specific
              systems.
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
          body="State attorneys general, OCR, FTC, CFPB investigators, and your own internal audit can independently re-verify any proof against the on-chain key — no dependency on the regulated entity or zkRune as a vendor for evidence integrity."
        />
      </div>

      {/* CONTACT */}
      <section
        id="contact"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Evaluating zkRune for a US privacy obligation?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We work directly with privacy counsel, DPOs, compliance leads,
            and engineering teams at US-operating businesses in scope of
            state comprehensive laws and the federal sectoral baseline. The
            fastest path is a 30-minute technical session with the OpenAPI
            spec and trust documentation ready to forward to your privacy
            and security team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=US%20Privacy%20Compliance%20Session"
              className="px-8 py-3 bg-zk-secondary text-zk-darker font-medium rounded-full hover:bg-zk-secondary/90 transition-all hover:scale-105"
            >
              Email compliance@
            </a>
            <a
              href="/openapi.yaml"
              className="px-8 py-3 border border-zk-secondary/30 text-zk-secondary font-medium rounded-full hover:border-zk-secondary hover:bg-zk-secondary/10 transition-all"
            >
              Download OpenAPI spec
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

import type { Metadata } from "next";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import MainnetVerifiersGrid from "@/components/MainnetVerifiersGrid";

export const metadata: Metadata = {
  title: "zkRune for DORA — operational-resilience evidence without PII",
  description:
    "Cryptographic resilience-event evidence for financial entities and their ICT third-party providers under DORA Regulation (EU) 2022/2554 and the NIS2 Directive. Tamper-evident incident proofs, supplier attestations, and TLPT records — without exposing customer or operational PII.",
  alternates: { canonical: "https://zkrune.com/enterprise/dora" },
  openGraph: {
    title: "zkRune for DORA — operational-resilience evidence without PII",
    description:
      "Tamper-evident DORA incident proofs, third-party attestations, and TLPT records — without exposing customer or operational PII.",
    url: "https://zkrune.com/enterprise/dora",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune for DORA — operational-resilience evidence without PII",
    description:
      "Cryptographic DORA evidence layer for financial entities and ICT providers.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const HEADER_NAV = [
  { href: "#opportunity", label: "Opportunity" },
  { href: "#buyers", label: "Who We Serve" },
  { href: "#mapping", label: "DORA Mapping" },
  { href: "#contact", label: "Contact" },
];

const HEADER_CTA = {
  href: "mailto:zkruneprotocol@gmail.com?subject=DORA%20Resilience%20Session",
  label: "Book a session",
};

const BUYERS = [
  {
    role: "In-scope financial entities",
    examples:
      "Banks, payment institutions, e-money issuers, investment firms, AIFMs, UCITS managers, insurance and reinsurance undertakings, CCPs, CSDs, trade repositories, credit rating agencies",
    fit: "DORA Art. 17 incident reporting requires evidence that an event happened, was contained, and was disclosed — across a supervisory chain that includes the entity, its CSIRT, and the European Supervisory Authorities. zkRune binds each step to a tamper-evident proof so the supervisor can independently re-verify the timeline without touching the underlying operational data.",
  },
  {
    role: "ICT third-party service providers",
    examples:
      "Cloud providers (AWS, Azure, GCP financial-services regions), SaaS vendors, managed-detection-and-response (MDR) firms, banking-as-a-service platforms, payment-tech providers",
    fit: "DORA Art. 28–30 makes you a registered ICT third-party provider with structured attestation obligations toward your in-scope customers. zkRune lets you issue signed attestations of compliance state (patch cadence, access reviews, sub-contractor screening) that customers and their supervisors verify cryptographically — without you exposing your internal infrastructure detail.",
  },
  {
    role: "NIS2-adjacent critical infrastructure",
    examples:
      "Operators of essential services in energy, transport, banking, financial market infrastructure, health, drinking water, digital infrastructure, public administration, space",
    fit: "NIS2 (Directive (EU) 2022/2555) creates parallel obligations to DORA for non-financial critical entities. Same cryptographic evidence pattern applies: incident proofs, vendor attestations, and continuity-test records that supervisory authorities verify against on-chain commitments rather than retained personal data.",
  },
];

const DORA_MAPPING = [
  {
    article: "Art. 17 — ICT-related incident management",
    requirement:
      "Financial entities must classify, manage, and report major ICT-related incidents to competent authorities through a structured initial / intermediate / final reporting flow.",
    zkRuneCircuit: "hash-preimage · patience-proof · signature-verification",
    notes:
      "Each report step is committed as a cryptographic proof: detection timestamp, classification, mitigation milestone, final disclosure. Patience-proof binds wait-period requirements (e.g. continuous monitoring duration). Supervisors re-verify the chain without seeing raw operational data.",
  },
  {
    article: "Art. 18 — Threat-led penetration testing (TLPT)",
    requirement:
      "Larger financial entities must perform threat-led penetration tests at least every three years, with detailed findings shared with competent authorities.",
    zkRuneCircuit: "credential-proof · signature-verification",
    notes:
      "TLPT findings can be committed as a hashed report with attestations from the testing provider, the entity's CISO, and an external attester. The supervisor verifies the chain of attestations without requiring distribution of the sensitive findings themselves.",
  },
  {
    article: "Art. 28–30 — ICT third-party risk",
    requirement:
      "Financial entities must maintain a register of ICT third-party providers, contractually require operational-resilience standards, and demonstrate active monitoring of critical providers.",
    zkRuneCircuit: "membership-proof · signature-verification",
    notes:
      "Vendors join a Merkle-anchored register; each contractual milestone (sub-contractor change, patch attestation, BCP rehearsal) becomes an on-chain proof. The 'register of ICT providers' becomes cryptographically inspectable by supervisors without requiring vendor-by-vendor disclosure to other customers.",
  },
  {
    article: "Art. 24 — Operational resilience testing programme",
    requirement:
      "Entities must maintain a comprehensive testing programme covering vulnerability assessments, network security testing, gap analyses, and end-to-end testing of ICT systems.",
    zkRuneCircuit: "patience-proof · hash-preimage",
    notes:
      "Periodicity and completion of each test type committed cryptographically. Patience-proof enforces minimum intervals between tests; hash-preimage commits findings so post-hoc tampering is detectable.",
  },
  {
    article: "NIS2 Art. 23 — Incident reporting (adjacent)",
    requirement:
      "Essential and important entities must report significant incidents to national CSIRTs through early-warning / incident notification / final report stages.",
    zkRuneCircuit: "hash-preimage · patience-proof · signature-verification",
    notes:
      "Same pattern as DORA Art. 17, applied to NIS2's three-stage reporting flow. Member-state CSIRTs can re-verify proofs against the same on-chain anchors used by financial supervisors.",
  },
];

const READINESS = [
  {
    label: "Audited circuits",
    value: "14 production Groth16 circuits",
    detail:
      "Hash-preimage, patience-proof, signature-verification, and membership-proof together cover the cryptographic primitives DORA reporting flows depend on.",
  },
  {
    label: "Proof generation",
    value: "0.4–5 seconds",
    detail:
      "Suitable for per-event commitment at scale. Incident-class proofs typically run sub-second; full TLPT-grade attestation chains complete in seconds.",
  },
  {
    label: "Proof size",
    value: "~200 bytes",
    detail:
      "Compact enough to retain a five-year supervisory archive of incident-reporting proofs in under 1 MB per entity. Storage cost is not the constraint; trustworthy retention is.",
  },
  {
    label: "Mainnet anchors",
    value: "Solana · Base · Sui",
    detail:
      "ESAs, national CSIRTs, and your own internal audit can independently re-verify any proof against the on-chain key — no dependency on the entity or zkRune as a vendor.",
  },
  {
    label: "Licence",
    value: "MIT / Apache-2.0",
    detail:
      "Open source by default. Compatible with internal procurement reviews and the supervisor's preference for auditable supply chains. No vendor lock-in.",
  },
  {
    label: "Audit",
    value: "Q3–Q4 2026 (planned)",
    detail:
      "Third-party security audit scheduled. Honest disclosure of current posture at /trust — including what we have not yet proved.",
  },
];

const NOT_BUILDING = [
  "GRC platforms or workflow tooling (ServiceNow, Archer, OneTrust handle that)",
  "SIEM / detection engineering (Splunk, Sentinel, Elastic, Datadog)",
  "Threat-led penetration testing services (you keep your existing red team)",
  "Continuity-of-operations or business-continuity planning",
  "Supervisory reporting submission UIs (national authority portals)",
];

export default function EnterpriseDoraPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <EnterpriseHeader
        subtitle="For Financial Resilience"
        navItems={HEADER_NAV}
        cta={HEADER_CTA}
        homeHref="/enterprise/dora"
      />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[800px] overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-accent/10 blur-[120px]" />
        <div className="absolute top-64 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-primary/10 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-24 max-w-6xl mx-auto">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-accent/40 bg-zk-accent/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-accent animate-pulse" />
            <span className="text-xs font-bold text-zk-accent uppercase tracking-wider">
              DORA · Binding since 17 January 2025 · NIS2 transposing
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-4xl">
            Operational-resilience evidence,{" "}
            <span className="text-zk-accent">without exposing the data</span>.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            zkRune is the cryptographic evidence layer for financial entities
            and ICT third-party providers under DORA Regulation (EU) 2022/2554,
            with parallel coverage for NIS2 (Directive (EU) 2022/2555). Each
            incident, attestation, and continuity-test record becomes a
            tamper-evident proof — re-verifiable by an ESA, a national CSIRT,
            or your internal audit, without exposing the underlying operational
            or customer data.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=DORA%20Resilience%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session%20on%20zkRune%20for%20DORA%20%2F%20NIS2."
              className="px-6 py-3 bg-zk-accent text-white font-semibold rounded-full hover:bg-zk-accent/90 transition-all"
            >
              Book a 30-minute session
            </a>
            <a
              href="#mapping"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              See the DORA mapping
            </a>
          </div>
          <p className="text-sm text-zk-gray pt-2">
            Outside DORA / NIS2 scope? See the{" "}
            <a
              href="/regulations"
              className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
            >
              full regulations matrix
            </a>{" "}
            (AI Act, MiCA, eIDAS 2.0, DSA, UK OSA, GDPR).
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
              DORA wants detailed reporting. GDPR demands data minimisation.
              Supervisors want re-verifiable evidence. The three pull against
              each other — until you ship the evidence as a proof.
            </h2>
            <p className="text-zk-gray max-w-3xl leading-relaxed">
              Most financial entities address DORA by retaining detailed
              incident logs, vendor records, and TLPT findings — creating both
              a GDPR proportionality liability and a security exposure.
              zkRune lets you commit the salient facts as cryptographic
              proofs, retain the underlying operational data only as long as
              you need it, and still hand a supervisor a re-verifiable chain.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-zk-accent/20 bg-zk-accent/5">
              <div className="text-xs font-bold text-zk-accent uppercase tracking-wider mb-3">
                What DORA + NIS2 demand
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Structured incident reporting to ESAs / national authorities</li>
                <li>• Registers of ICT third-party providers with attestations</li>
                <li>• Threat-led penetration testing every 3 years (TLPT)</li>
                <li>• Resilience-testing programme with periodicity evidence</li>
                <li>• Supervisor-grade auditability for at least 5 years</li>
              </ul>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border border-zk-primary/20 bg-zk-primary/5">
              <div className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                What zkRune contributes underneath
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Tamper-evident incident proofs (hash-preimage)</li>
                <li>• On-chain anchored vendor registers (membership-proof)</li>
                <li>• Attestation chains for TLPT findings (signature-verification)</li>
                <li>• Cryptographic wait-period enforcement (patience-proof)</li>
                <li>• Compact 5-year archive (~1 MB per entity)</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-zk-darker/60">
            <p className="text-zk-gray leading-relaxed">
              <span className="text-white font-medium">
                We are not a GRC platform.
              </span>{" "}
              ServiceNow, Archer, and OneTrust handle workflow and policy
              orchestration. zkRune is the cryptographic primitive underneath
              — the bit that lets you commit evidence today and re-verify it
              five years from now without retaining the underlying personal or
              operational data.
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
              Three categories with overlapping but distinct evidence
              obligations.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {BUYERS.map((b) => (
              <article
                key={b.role}
                className="p-6 rounded-2xl border border-white/10 bg-zk-dark/40 hover:border-zk-accent/30 transition-colors"
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

      {/* DORA MAPPING */}
      <section
        id="mapping"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              DORA mapping
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Five DORA and NIS2 evidence flows, mapped to circuits you can
              integrate today.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              References are to{" "}
              <a
                href="https://eur-lex.europa.eu/eli/reg/2022/2554/oj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zk-accent hover:text-zk-accent/80 transition-colors underline underline-offset-2"
              >
                Regulation (EU) 2022/2554
              </a>{" "}
              and{" "}
              <a
                href="https://eur-lex.europa.eu/eli/dir/2022/2555/oj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zk-accent hover:text-zk-accent/80 transition-colors underline underline-offset-2"
              >
                Directive (EU) 2022/2555
              </a>
              . Mapping is informational; consult your CISO and competent
              authority for certification-grade claims.
            </p>
          </div>

          <div className="space-y-3">
            {DORA_MAPPING.map((row) => (
              <div
                key={row.article}
                className="grid md:grid-cols-12 gap-4 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    Article
                  </p>
                  <p className="text-white text-sm font-medium">
                    {row.article}
                  </p>
                  <p className="text-xs text-zk-gray/70 mt-1 leading-relaxed">
                    {row.requirement}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    zkRune circuit
                  </p>
                  <code className="text-xs text-zk-accent font-mono break-all">
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
              Production cryptography. Audit roadmap honestly disclosed.
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
              What zkRune deliberately does <span className="text-zk-accent">not</span> do
            </h3>
            <p className="text-zk-gray mb-4 text-sm leading-relaxed">
              The list below is what your existing GRC, SIEM, and red-team
              vendors already handle. zkRune slots underneath as the
              cryptographic-evidence primitive — not as a replacement for the
              orchestration layer you already trust.
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
          body="European Supervisory Authorities, national CSIRTs, and your internal audit can independently re-verify any proof against the on-chain key — no dependency on the entity or zkRune as a vendor."
        />
      </div>

      {/* CONTACT */}
      <section
        id="contact"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Evaluating zkRune for a DORA or NIS2 evidence flow?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We work directly with CISOs, operational-resilience leads, and
            third-party-risk teams at in-scope financial entities and their
            ICT providers. The fastest path is a 30-minute technical session
            with the OpenAPI spec and trust documentation ready to forward to
            your security team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=DORA%20Resilience%20Session"
              className="px-8 py-3 bg-zk-accent text-white font-medium rounded-full hover:bg-zk-accent/90 transition-all hover:scale-105"
            >
              Email resilience@
            </a>
            <a
              href="/openapi.yaml"
              className="px-8 py-3 border border-zk-accent/30 text-zk-accent font-medium rounded-full hover:border-zk-accent hover:bg-zk-accent/10 transition-all"
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

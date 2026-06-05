import type { Metadata } from "next";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import MainnetVerifiersGrid from "@/components/MainnetVerifiersGrid";

export const metadata: Metadata = {
  title: "zkRune for EUDI Wallet — open-source ZK selective disclosure",
  description:
    "Open-source zero-knowledge selective disclosure for EUDI Wallet implementers, attestation issuers, and relying parties. 14 production Groth16 circuits, mainnet on Solana, Ethereum (Base), and Sui. MIT-licensed, ARF-aligned.",
  alternates: { canonical: "https://zkrune.com/enterprise/eudi-wallet" },
  openGraph: {
    title: "zkRune for EUDI Wallet — open-source ZK selective disclosure",
    description:
      "Open-source ZK selective disclosure primitives for EUDI Wallet implementers, attestation issuers, and relying parties. ARF-aligned.",
    url: "https://zkrune.com/enterprise/eudi-wallet",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune for EUDI Wallet — open-source ZK selective disclosure",
    description:
      "ZK selective disclosure for EUDI Wallet implementers, attestation issuers, and relying parties.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const HEADER_NAV = [
  { href: "#opportunity", label: "Opportunity" },
  { href: "#buyers", label: "Who We Serve" },
  { href: "#arf-mapping", label: "ARF Mapping" },
  { href: "#contact", label: "Contact" },
];

const HEADER_CTA = {
  href: "mailto:zkruneprotocol@gmail.com?subject=EUDI%20Wallet%20Integration%20Session",
  label: "Book a session",
};

const BUYERS = [
  {
    role: "Wallet implementers",
    examples:
      "TSPs, identity vendors, member-state pilot consortia (Atos, Bundesdruckerei, Thales, IDnow, Talao, Walt.id, ANF AC)",
    fit: "Drop zkRune circuits into your selective-disclosure pipeline. The wallet keeps full control of key management, biometric onboarding, attestation issuance, and the qualified-status approval process — we provide the ZK proving + verification primitives. MIT licence, audit-friendly, no vendor lock-in.",
  },
  {
    role: "Attestation issuers",
    examples:
      "Member-state authorities, qualified trust service providers, universities, professional bodies, employers",
    fit: "Issue ARF-compliant Electronic Attestations of Attributes (EAA) that holders can prove selectively. zkRune's `credential-proof` and `signature-verification` circuits handle the cryptographic binding so your attestations remain valid across wallets and relying parties without revealing the underlying credential.",
  },
  {
    role: "Relying parties",
    examples:
      "Banks, telco operators, online platforms, healthcare providers, public-service portals",
    fit: "Accept proofs from any EUDI-conformant wallet without rebuilding cryptography. Verify on-chain (Solana / Ethereum / Sui) or via the hosted `POST /api/verify-proof` endpoint. The OpenAPI spec at /openapi.yaml maps to Postman, OpenAPI clients, and security questionnaires.",
  },
];

const ARF_MAPPING = [
  {
    arfConcept: "Predicate proofs on PID attributes",
    arfReference: "ARF v1.4 §6.5 — over-18, residency-bound predicates",
    zkRuneCircuit: "age-verification · range-proof",
    notes:
      "Prove `age >= N` or `attribute ∈ [min, max]` without revealing the attribute. Already in production for age-verification today.",
  },
  {
    arfConcept: "Group membership / inclusion proofs",
    arfReference: "ARF v1.4 §6.6 — qualification, group affiliation",
    zkRuneCircuit: "membership-proof",
    notes:
      "Poseidon Merkle tree, depth=16. Issuer publishes a root; holders prove inclusion without revealing the underlying identifier. Production-safe when the root is published by a trusted issuer.",
  },
  {
    arfConcept: "Credential attestation binding",
    arfReference: "ARF v1.4 §5.3 — Electronic Attestation of Attributes",
    zkRuneCircuit: "credential-proof · signature-verification",
    notes:
      "Holder proves possession of a valid issuer-signed credential plus that the credential has not expired, without revealing the credential contents.",
  },
  {
    arfConcept: "Selective disclosure of qualified electronic signature",
    arfReference: "ARF v1.4 §5.5 — QES with selective disclosure",
    zkRuneCircuit: "signature-verification",
    notes:
      "EdDSA inside a ZK circuit. Prove a signature is valid for a held credential without revealing the signing key or full document.",
  },
  {
    arfConcept: "Unlinkability across relying parties",
    arfReference: "ARF v1.4 §7 — privacy properties",
    zkRuneCircuit: "hash-preimage",
    notes:
      "Same holder produces unlinkable proofs to different verifiers using per-session nullifiers derived from a hashed secret.",
  },
];

const READINESS = [
  {
    label: "Audited circuits",
    value: "14 production Groth16 circuits",
    detail:
      "Compiled with Circom, trusted setup completed via multi-party Phase 1 (Hermez Powers of Tau, 54 contributors) + Phase 2 (zkRune-side).",
  },
  {
    label: "Proof generation",
    value: "0.4–5 seconds in-browser",
    detail:
      "WASM proving runtime works on desktop and mobile. Average age-verification proof: ~200 ms on modern hardware.",
  },
  {
    label: "Proof size",
    value: "~200 bytes",
    detail:
      "Compact, verifiable on resource-constrained relying-party servers. <2 ms verification per proof.",
  },
  {
    label: "Mainnet anchors",
    value: "Solana · Base · Sui",
    detail:
      "Verification keys are immutable on three independent chains. Any party can independently verify the proof against the canonical vKey.",
  },
  {
    label: "Licence",
    value: "MIT / Apache-2.0",
    detail:
      "Open source by default. Compatible with EU NGI Commons and NLnet requirements. No vendor lock-in.",
  },
  {
    label: "Audit",
    value: "Q3–Q4 2026 (planned)",
    detail:
      "Third-party security audit scheduled. Honest disclosure of current posture at /trust — including what we have not yet proved.",
  },
];

const NOT_BUILDING = [
  "The wallet UI / UX surface (Atos, Talao, Walt.id and others own that)",
  "Biometric onboarding or device key management",
  "Qualified trust service provider approval process",
  "Member-state pilot programme administration",
  "EAA issuance UIs for authorities (we provide the circuits underneath)",
];

export default function EnterpriseEudiWalletPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <EnterpriseHeader
        subtitle="For EUDI Implementers"
        navItems={HEADER_NAV}
        cta={HEADER_CTA}
        homeHref="/enterprise/eudi-wallet"
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
              eIDAS 2.0 · EUDI Wallet · Rolling out 2026–2027
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-4xl">
            Open-source ZK selective disclosure for{" "}
            <span className="text-zk-primary">EUDI Wallet implementers</span>.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            zkRune is the privacy-preserving cryptographic layer underneath
            EUDI-conformant wallets, attestation issuers, and relying parties.
            14 production Groth16 circuits, mainnet verifier anchors on three
            chains, MIT-licensed. We do not build a wallet — we make yours
            ARF-compliant on the ZK primitives.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=EUDI%20Wallet%20Integration%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session%20on%20zkRune%20for%20EUDI%20Wallet."
              className="px-6 py-3 bg-zk-primary text-white font-semibold rounded-full hover:bg-zk-primary/90 transition-all"
            >
              Book a 30-minute session
            </a>
            <a
              href="#arf-mapping"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              See the ARF mapping
            </a>
          </div>
          <p className="text-sm text-zk-gray pt-2">
            Outside the EUDI Wallet scope? See the{" "}
            <a
              href="/regulations"
              className="text-zk-secondary hover:text-zk-secondary/80 transition-colors underline underline-offset-2"
            >
              full regulations matrix
            </a>{" "}
            (AI Act, DSA, MiCA, DORA, NIS2, UK OSA, GDPR). For AI agent
            deployments using EUDI-issued credentials, see{" "}
            <a
              href="/enterprise/ai-agents"
              className="text-zk-secondary hover:text-zk-secondary/80 transition-colors underline underline-offset-2"
            >
              Proof of Agent
            </a>
            .
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
              Every EU member state must issue an identity wallet. The wallet
              must support selective disclosure. Most of them do not yet.
            </h2>
            <p className="text-zk-gray max-w-3xl leading-relaxed">
              eIDAS 2.0 (Regulation (EU) 2024/1183) requires member states to
              make a European Digital Identity Wallet available to every
              citizen and resident. The Architecture Reference Framework
              explicitly cites zero-knowledge proofs as a valid mechanism for
              attribute selective disclosure. The implementation gap between
              the spec and shipped wallets is real, and shrinking quickly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-zk-primary/20 bg-zk-primary/5">
              <div className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                What every wallet needs
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Prove `age &gt;= N` without revealing the birthdate</li>
                <li>• Prove residency without revealing the full address</li>
                <li>• Prove credential validity without revealing its body</li>
                <li>• Stay unlinkable across relying parties</li>
                <li>• All of the above, audit-grade, today</li>
              </ul>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/5">
              <div className="text-xs font-bold text-zk-secondary uppercase tracking-wider mb-3">
                What zkRune already ships
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• 14 production Groth16 circuits</li>
                <li>• In-browser WASM proving (0.4–5 s)</li>
                <li>• Hosted verifier API + OpenAPI 3.1 spec</li>
                <li>• Mainnet verifier contracts on three chains</li>
                <li>• MIT / Apache-2.0, audit-friendly source</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-zk-darker/60">
            <p className="text-zk-gray leading-relaxed">
              <span className="text-white font-medium">
                We are not building an EUDI Wallet.
              </span>{" "}
              We make existing wallets, issuers, and relying parties
              ARF-compliant on the cryptographic primitives. The wallet UX,
              key management, biometrics, and qualified-status approval
              remain yours.
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
              Three places where ARF-aligned ZK is now table stakes.
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

      {/* ARF MAPPING */}
      <section
        id="arf-mapping"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              ARF mapping
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Each ARF selective-disclosure primitive, mapped to a circuit you
              can integrate today.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              ARF references are to{" "}
              <a
                href="https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
              >
                the EU Commission's Architecture Reference Framework v1.4
              </a>
              . Mapping is informational; consult your conformity assessor for
              certification-grade claims.
            </p>
          </div>

          <div className="space-y-3">
            {ARF_MAPPING.map((row) => (
              <div
                key={row.arfConcept}
                className="grid md:grid-cols-12 gap-4 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    ARF concept
                  </p>
                  <p className="text-white text-sm font-medium">{row.arfConcept}</p>
                  <p className="text-xs text-zk-gray/70 mt-1 font-mono">
                    {row.arfReference}
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
      <section
        id="readiness"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Readiness
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Production today. Honest about what is still on the audit
              roadmap.
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
              We stay in our lane. The list below is what wallet vendors,
              issuers, and member-state pilots already do — adding zkRune to
              your stack should not crowd out the work you have already done.
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
      <MainnetVerifiersGrid
        eyebrow="Mainnet anchors"
        heading="Verification keys on three independent chains."
        body="The vKeys served by the hosted verifier are the same ones anchored on Base, Solana, and Sui mainnet. Relying parties can re-verify any proof against the on-chain key without trusting zkRune's hosted endpoint."
      />

      {/* CONTACT */}
      <section
        id="contact"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Evaluating zkRune for an EUDI Wallet integration?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We work directly with wallet implementers, qualified trust service
            providers, and relying-party engineering teams. The fastest path
            is a 30-minute technical session with a security-questionnaire
            response packet ready before the call.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=EUDI%20Wallet%20Integration%20Session"
              className="px-8 py-3 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
            >
              Email founder@
            </a>
            <a
              href="/openapi.yaml"
              className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all"
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

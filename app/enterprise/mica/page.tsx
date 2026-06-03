import type { Metadata } from "next";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import MainnetVerifiersGrid from "@/components/MainnetVerifiersGrid";

export const metadata: Metadata = {
  title: "zkRune for MiCA — privacy-preserving compliance for CASPs",
  description:
    "Open-source zero-knowledge primitives for MiCA-licensed crypto-asset service providers, custodians, and stablecoin issuers. Proof of reserves, travel-rule attestations, AML thresholds, and beneficial-ownership selective disclosure without retaining identity dossiers.",
  alternates: { canonical: "https://zkrune.com/enterprise/mica" },
  openGraph: {
    title: "zkRune for MiCA — privacy-preserving compliance for CASPs",
    description:
      "Open-source ZK primitives for MiCA-licensed CASPs. Proof of reserves, travel-rule, AML thresholds — without retaining identity dossiers.",
    url: "https://zkrune.com/enterprise/mica",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune for MiCA — privacy-preserving compliance for CASPs",
    description:
      "Open-source ZK primitives for MiCA-licensed crypto-asset service providers.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const HEADER_NAV = [
  { href: "#opportunity", label: "Opportunity" },
  { href: "#buyers", label: "Who We Serve" },
  { href: "#mica-mapping", label: "MiCA Mapping" },
  { href: "#contact", label: "Contact" },
];

const HEADER_CTA = {
  href: "mailto:zkruneprotocol@gmail.com?subject=MiCA%20Compliance%20Session",
  label: "Book a session",
};

const BUYERS = [
  {
    role: "Crypto-asset service providers (CASPs)",
    examples:
      "EU-licensed exchanges, brokers, OTC desks, custodians (Binance EU, Bitstamp, Kraken EU, Bitvavo, Bitpanda, Coinbase EU, OKX EU)",
    fit: "Proof of solvency and proof of reserve without revealing per-user balances. Travel-rule attestations bound to the originating wallet via the signature-verification circuit. AML threshold checks (range-proof) that satisfy reporting thresholds without retaining the user's amount.",
  },
  {
    role: "Issuers of asset-referenced and e-money tokens",
    examples:
      "Stablecoin issuers (Circle, Tether EU subsidiaries, Banking Circle), tokenised deposit operators, regulated EMT issuers",
    fit: "Reserve attestations on a per-block cadence — the holder of the proof can verify reserves match commitments without seeing the reserve composition. Bound to on-chain anchors so attestations are non-repudiable.",
  },
  {
    role: "AML / compliance tech integrators",
    examples:
      "Sumsub, Chainalysis, Elliptic, TRM, Notabene — AML orchestration and transaction-risk vendors",
    fit: "ZK as a pluggable layer in your existing screening stack. Customers retain orchestration control, you add the privacy-preserving evidence path that satisfies GDPR proportionality challenges to indefinite EDD retention.",
  },
];

const MICA_MAPPING = [
  {
    micaArticle: "Art. 67 — Reserve of assets (ART issuers)",
    requirement:
      "Issuer must maintain segregated reserves of assets backing the issued ART, with monthly audits and ongoing supervision.",
    zkRuneCircuit: "balance-proof · range-proof",
    notes:
      "Per-block proof that on-chain reserve wallets hold at least the circulating supply. Verifiers re-check against published commitments without seeing the asset composition.",
  },
  {
    micaArticle: "Art. 70 — Reserve composition (EMT issuers)",
    requirement:
      "E-money tokens must be redeemable at par by the holder; reserves held as deposits in qualifying institutions.",
    zkRuneCircuit: "membership-proof · signature-verification",
    notes:
      "Cryptographic attestation from the reserve custodian, signed and verified by the issuer's smart contract. Holders verify the chain of trust without seeing depositor identities.",
  },
  {
    micaArticle: "Travel Rule (TFR 2023/1113)",
    requirement:
      "Originator and beneficiary identifiers must accompany crypto transfers above EUR 1,000 between CASPs.",
    zkRuneCircuit: "signature-verification · credential-proof",
    notes:
      "Originator CASP binds the transfer to a signed identity attestation that the beneficiary CASP verifies cryptographically. The on-chain transaction itself remains pseudonymous; identifying data lives in the attestation, not the chain.",
  },
  {
    micaArticle: "Art. 60 — Authorisation conditions (CASPs)",
    requirement:
      "Verification of senior-manager fitness, beneficial ownership, and PEP / sanctions screening as part of authorisation.",
    zkRuneCircuit: "credential-proof · membership-proof",
    notes:
      "Attestations from regulators / national authorities that a person is authorised and screened, verifiable by counterparties without exposing the underlying identity dossier.",
  },
  {
    micaArticle: "AML 6AMLD enhanced due diligence",
    requirement:
      "Retain EDD records for at least 5 years; reconcile to GDPR proportionality. Currently most CASPs retain raw dossiers indefinitely as a safe default.",
    zkRuneCircuit: "hash-preimage · patience-proof",
    notes:
      "Proof that an EDD review happened at a moment in time, bound to the reviewer and the customer hash, without retaining the raw customer record. Supervisors can re-verify the proof against the anchored commitment chain.",
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
      "Suitable for per-transaction risk attestations issued from the customer's device. Sub-second on modern hardware for the smaller circuits (range-proof, balance-proof).",
  },
  {
    label: "Proof size",
    value: "~200 bytes",
    detail:
      "Storage-friendly for the multi-year retention obligations under MiCA and 6AMLD. Five years of daily reserve attestations is well under 500 KB per circuit.",
  },
  {
    label: "Mainnet anchors",
    value: "Solana · Base · Sui",
    detail:
      "Verification keys are immutable on three independent chains. EU supervisors can independently verify any proof against the on-chain key — no dependency on zkRune as a vendor.",
  },
  {
    label: "Licence",
    value: "MIT / Apache-2.0",
    detail:
      "Open source by default. Compatible with internal procurement reviews and the regulator's preference for auditable supply chains. No vendor lock-in.",
  },
  {
    label: "Audit",
    value: "Q3–Q4 2026 (planned)",
    detail:
      "Third-party security audit scheduled. Honest disclosure of current posture at /trust — including what we have not yet proved.",
  },
];

const NOT_BUILDING = [
  "MiCA licensing or authorisation services (national competent authorities do that)",
  "AML / KYC orchestration UIs (Sumsub, Onfido, Veriff, Chainalysis — we plug under them)",
  "Sanctions / PEP list maintenance and refresh (Refinitiv, Dow Jones, OFAC feeds)",
  "Reserve custody or banking infrastructure (Banking Circle, BCB, qualified custodians)",
  "Transaction monitoring rule engines (Chainalysis Reactor, TRM Forensics, Elliptic Navigator)",
];

export default function EnterpriseMicaPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <EnterpriseHeader
        subtitle="For CASPs"
        navItems={HEADER_NAV}
        cta={HEADER_CTA}
        homeHref="/enterprise/mica"
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
              MiCA · Binding since 30 June 2024 · CASPs since 30 Dec 2024
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-4xl">
            Privacy-preserving compliance for{" "}
            <span className="text-zk-secondary">crypto-asset service providers</span>.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            zkRune is the cryptographic primitive layer for MiCA-licensed CASPs,
            issuers of ARTs and EMTs, and the AML / compliance tech vendors that
            integrate with them. Proof of reserves, travel-rule attestations,
            AML thresholds, and beneficial-ownership selective disclosure —
            without indefinite retention of identity dossiers.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=MiCA%20Compliance%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session%20on%20zkRune%20for%20MiCA."
              className="px-6 py-3 bg-zk-secondary text-zk-darker font-semibold rounded-full hover:bg-zk-secondary/90 transition-all"
            >
              Book a 30-minute session
            </a>
            <a
              href="#mica-mapping"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              See the MiCA mapping
            </a>
          </div>
          <p className="text-sm text-zk-gray pt-2">
            Outside MiCA scope? See the{" "}
            <a
              href="/regulations"
              className="text-zk-primary hover:text-zk-primary/80 transition-colors underline underline-offset-2"
            >
              full regulations matrix
            </a>{" "}
            (AI Act, DSA, eIDAS 2.0, DORA, NIS2, UK OSA, GDPR).
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
              MiCA demands evidence. GDPR demands minimisation. CASPs are
              caught between the two — and are paying the cost.
            </h2>
            <p className="text-zk-gray max-w-3xl leading-relaxed">
              Regulation (EU) 2023/1114 has been binding for CASPs since 30
              December 2024. Every CASP must demonstrate reserve adequacy,
              travel-rule compliance, AML reporting, and beneficial-ownership
              screening — while GDPR Article 5(1)(c) constrains how much of
              that evidence can be retained as raw personal data. Most CASPs
              default to indefinite EDD retention. Most exchange compliance
              teams know it's the wrong default.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-zk-primary/20 bg-zk-primary/5">
              <div className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                What MiCA + 6AMLD + Travel Rule demand
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Proof of reserve adequacy, on a recurring cadence</li>
                <li>• Travel-rule originator/beneficiary identity attestations</li>
                <li>• AML threshold checks (above EUR 1,000 transfers)</li>
                <li>• Beneficial-ownership screening, 5+ year EDD retention</li>
                <li>• Auditable trail for regulators on demand</li>
              </ul>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/5">
              <div className="text-xs font-bold text-zk-secondary uppercase tracking-wider mb-3">
                What zkRune contributes underneath
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• On-chain proof-of-reserve commitments (balance-proof)</li>
                <li>• Signed identity attestations (signature-verification)</li>
                <li>• Range proofs for thresholds without raw amounts</li>
                <li>• Compact 5-year retention (~200 B per attestation)</li>
                <li>• Mainnet anchors for tamper-evident audit trail</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-zk-darker/60">
            <p className="text-zk-gray leading-relaxed">
              <span className="text-white font-medium">
                We are not a MiCA compliance platform.
              </span>{" "}
              We are the cryptographic primitive underneath one. The licensing,
              KYC orchestration, sanctions feeds, and transaction monitoring
              remain with you (or your existing vendor stack). We replace the
              raw-PII retention model with proofs that travel.
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
              Three categories of MiCA-impacted buyer that need this today.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {BUYERS.map((b) => (
              <article
                key={b.role}
                className="p-6 rounded-2xl border border-white/10 bg-zk-dark/40 hover:border-zk-secondary/30 transition-colors"
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

      {/* MICA MAPPING */}
      <section
        id="mica-mapping"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              MiCA mapping
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Five recurring MiCA requirements, mapped to circuits you can
              integrate today.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              References are to{" "}
              <a
                href="https://eur-lex.europa.eu/eli/reg/2023/1114/oj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zk-secondary hover:text-zk-secondary/80 transition-colors underline underline-offset-2"
              >
                Regulation (EU) 2023/1114
              </a>{" "}
              and the Transfer of Funds Regulation (Regulation (EU) 2023/1113).
              Mapping is informational; consult your DPO and authorised
              national competent authority for certification-grade claims.
            </p>
          </div>

          <div className="space-y-3">
            {MICA_MAPPING.map((row) => (
              <div
                key={row.micaArticle}
                className="grid md:grid-cols-12 gap-4 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    MiCA article
                  </p>
                  <p className="text-white text-sm font-medium">{row.micaArticle}</p>
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
              The list below is what licensed CASPs and their existing vendor
              stack already do. Adding zkRune to your architecture should slot
              under the orchestration you already trust — not replace it.
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
          body="The vKeys served by the hosted verifier are the same ones anchored on Base, Solana, and Sui mainnet. Auditors, supervisors, and counterparty CASPs can independently verify any proof against the on-chain key without trusting zkRune's hosted endpoint."
        />
      </div>

      {/* CONTACT */}
      <section
        id="contact"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Evaluating zkRune for a MiCA-licensed flow?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We work directly with compliance leads, DPOs, and engineering
            teams at CASPs, ART/EMT issuers, and AML technology vendors. The
            fastest path is a 30-minute technical session with the OpenAPI
            spec and trust documentation ready to forward to your security
            team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=MiCA%20Compliance%20Session"
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

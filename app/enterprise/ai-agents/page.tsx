import type { Metadata } from "next";
import EnterpriseHeader from "@/components/EnterpriseHeader";
import MainnetVerifiersGrid from "@/components/MainnetVerifiersGrid";

export const metadata: Metadata = {
  title: "zkRune — Proof of Agent for the agentic web",
  description:
    "Open-source zero-knowledge primitives for AI agent identity: delegated authority, Agent Passport verification, permission constraints, and human-in-loop attestations. zkRune verifies issuer-signed attestations — it does not generate proof-of-training. No closed ecosystem, no hardware lock-in, no token gate.",
  alternates: { canonical: "https://zkrune.com/enterprise/ai-agents" },
  openGraph: {
    title: "zkRune — Proof of Agent for the agentic web",
    description:
      "Open-source ZK primitives for AI agent identity: authority, Agent Passport, constraint, human-in-loop.",
    url: "https://zkrune.com/enterprise/ai-agents",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "zkRune — Proof of Agent for the agentic web",
    description:
      "Open-source ZK primitives for AI agent identity. Authority · Agent Passport · Constraint · Human-in-loop.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const HEADER_NAV = [
  { href: "#opportunity", label: "Opportunity" },
  { href: "#buyers", label: "Who We Serve" },
  { href: "#proof-of-agent", label: "Proof of Agent" },
  { href: "#contact", label: "Contact" },
];

const HEADER_CTA = {
  href: "mailto:zkruneprotocol@gmail.com?subject=AI%20Agent%20Identity%20Session",
  label: "Book a session",
};

const BUYERS = [
  {
    role: "AI agent platforms",
    examples:
      "Browserbase, Exa, Anthropic Claude Agent SDK, OpenAI Agents, Vercel AI SDK, Cohere, LangChain, Cline, agent-runtime infra",
    fit: "Drop-in attestation layer underneath your existing agent runtime. The agent runs in your platform; the proof that it was authorised, in-scope, and human-reviewed lives in the user's browser and is verified independently. Open-source MIT — no Orb hardware, no token gate, no closed ecosystem.",
  },
  {
    role: "Enterprise AI ops & governance",
    examples:
      "In-house agent deployments at regulated enterprises — banks, healthcare providers, public-sector portals, insurance, large SaaS — that need an auditable trail of agent decisions",
    fit: "Each agent action becomes a cryptographic proof: who authorised the agent, what its scope was, whether a human reviewed it, what data licence backed its model. Maps directly to EU AI Act Article 12 logging obligations for high-risk systems and to internal SOX-grade audit requirements.",
  },
  {
    role: "AI governance & T&S vendors",
    examples:
      "Credo AI, Holistic AI, Fiddler, Arize, AI risk-management platforms, model-card and policy-orchestration vendors",
    fit: "ZK as a pluggable evidence layer in your existing GRC / model-card pipeline. You keep policy orchestration and dashboards; we provide the cryptographic primitives that turn 'we asserted compliance' into 'here is a proof a regulator can re-verify'.",
  },
];

const PROOF_OF_AGENT = [
  {
    pillar: "Authority",
    question: "Does this agent legitimately act for the user it claims to represent?",
    zkRuneCircuit: "signature-verification · credential-proof",
    notes:
      "User signs a delegation token bound to the agent's public key, scope, and expiry. The agent proves possession of the signed delegation without exposing the user's private key. Selective disclosure lets the relying party verify the binding without seeing unrelated user attributes.",
  },
  {
    pillar: "Agent Passport",
    question:
      "Does this agent hold a current, issuer-signed Passport for the data, licences, and credentials it claims to operate under?",
    zkRuneCircuit: "membership-proof · hash-preimage · signature-verification",
    notes:
      "Data licensors and credential issuers sign Agent Passports — attestations binding the agent's identity to authorised corpora, licences, or external credentials. The agent presents a zero-knowledge proof that it holds a current Passport; the relying party verifies the issuer's signature chain against on-chain anchors. **zkRune verifies the Passport. It does not generate proof that the model was actually trained on a given corpus — that responsibility stays with the issuer (the data licensor or attesting authority).** Maps to GPAI Code of Practice training-data transparency expectations and to EU AI Act Article 50 provenance obligations.",
  },
  {
    pillar: "Constraint",
    question: "Is the agent acting within its authorised permission and resource limits?",
    zkRuneCircuit: "range-proof · balance-proof",
    notes:
      "Range-proof binds spending caps, token budgets, rate limits, or tool-call counts. Balance-proof verifies the agent has not exceeded its authorised principal balance. Useful for autonomous payment agents, RPA agents, and any agent with a budget envelope.",
  },
  {
    pillar: "Human-in-loop",
    question:
      "Did a designated human reviewer authorise this specific decision before it executed?",
    zkRuneCircuit: "signature-verification · patience-proof",
    notes:
      "A human reviewer signs the decision hash. Patience-proof enforces minimum review intervals (anti-rubber-stamping). Maps directly to EU AI Act Article 14 human-oversight requirements and to internal four-eyes / maker-checker controls in regulated workflows.",
  },
];

const COMPARISON = [
  {
    layer: "Proof of Human (human identity)",
    incumbent: "World ID 4.0 (Worldcoin)",
    incumbentNote:
      "April 2026 'Lift Off' launch — proof-of-human SDK with Browserbase, Exa, Okta, Vercel partners. Closed ecosystem, Orb hardware, WLD token. Strong distribution.",
    zkRuneFit:
      "We do not compete here. zkRune slots above the human-identity layer — wherever your user already verified personhood (World ID, civil registry, KYC vendor, EUDI Wallet), zkRune adds the agent-specific attestations on top.",
  },
  {
    layer: "Web data attestation (zkTLS)",
    incumbent: "Reclaim Protocol",
    incumbentNote:
      "3M+ verifications, 0% fraud, SOC 2 + ISO 27001 + GDPR. 10K+ payroll, 29K+ universities, 100+ airlines integrated. Effectively the production incumbent.",
    zkRuneFit:
      "We do not compete head-on. Where Reclaim provides the web-data proof, zkRune can act as the policy-and-binding layer that takes their attestation and turns it into an agent-scoped credential.",
  },
  {
    layer: "Agent attestation (authority · Agent Passport · constraint · oversight)",
    incumbent: "(no dominant incumbent)",
    incumbentNote:
      "Worldcoin holds the human side but the agent-specific attestation layer is commercially open. AI governance vendors (Credo AI, Holistic AI) provide policy and dashboarding but not cryptographic evidence.",
    zkRuneFit:
      "This is where zkRune leads. 14 production Groth16 circuits, mainnet on three chains, MIT-licensed. The Proof of Agent framework is what we ship today.",
  },
];

const READINESS = [
  {
    label: "Existing circuits",
    value: "4 of 14 directly map",
    detail:
      "signature-verification, credential-proof, membership-proof, range-proof — the Proof of Agent framework requires zero new circuit work to ship a v1 integration.",
  },
  {
    label: "Proof generation",
    value: "0.4–5 seconds in-browser",
    detail:
      "Agent attestations run client-side at human speed. For high-throughput autonomous agents, a server-side proving fallback is straightforward to add — proofs themselves remain ~200 bytes.",
  },
  {
    label: "Open source",
    value: "MIT / Apache-2.0",
    detail:
      "No closed-ecosystem capture. Customers fork, self-host, audit. Critical for enterprise procurement and increasingly demanded by AI governance frameworks (NIST AI RMF, ISO 42001).",
  },
  {
    label: "Mainnet anchors",
    value: "Solana · Base · Sui",
    detail:
      "Verification keys are immutable on three chains. An auditor, a regulator, or a downstream agent platform can re-verify any attestation against the on-chain key — no dependency on zkRune or the agent operator as a vendor.",
  },
  {
    label: "Licence",
    value: "No token gate · No hardware",
    detail:
      "Unlike alternatives that require a proprietary token, hardware device, or closed onboarding path, zkRune integration is a single npm install plus the OpenAPI spec.",
  },
  {
    label: "Audit",
    value: "Q3–Q4 2026 (planned)",
    detail:
      "Third-party security audit scheduled. SOC 2 / ISO 27001 roadmap follows. Honest disclosure of current posture at /trust — including what we have not yet proved.",
  },
];

const NOT_BUILDING = [
  "An agent runtime or agent SDK (LangChain, Anthropic Claude Agent SDK, OpenAI Agents, Vercel AI SDK already do this)",
  "Proof of human / personhood (Worldcoin, BrightID, Civic, Anon Aadhaar, EUDI Wallet handle this)",
  "Web data attestation / zkTLS (Reclaim Protocol, Pluto, TLSNotary handle this)",
  "Model evaluation / red-teaming infrastructure (Anthropic Trust & Safety, AI Safety Institute, Holistic AI handle this)",
  "AI governance dashboards or policy orchestration (Credo AI, Holistic AI, Fiddler handle this)",
];

export default function EnterpriseAiAgentsPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <EnterpriseHeader
        subtitle="For the Agentic Web"
        navItems={HEADER_NAV}
        cta={HEADER_CTA}
        homeHref="/enterprise/ai-agents"
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
              For the agentic web · Open-source · No token gate
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white max-w-4xl">
            <span className="text-zk-primary">Proof of Agent</span>{" "}
            for the agentic web.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            World ID closed the proof-of-human layer in April 2026. The
            agent-specific layer above it — authority, Agent Passport,
            constraint, human-in-loop — is commercially open. zkRune is the open-source
            cryptographic primitive set for that layer. No closed ecosystem,
            no Orb hardware, no token gate. Drop into any agent runtime.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=AI%20Agent%20Identity%20Session&body=We%20would%20like%20to%20schedule%20a%2030-minute%20technical%20session%20on%20zkRune%20Proof%20of%20Agent."
              className="px-6 py-3 bg-zk-primary text-white font-semibold rounded-full hover:bg-zk-primary/90 transition-all"
            >
              Book a 30-minute session
            </a>
            <a
              href="#proof-of-agent"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all"
            >
              See the four-pillar mapping
            </a>
          </div>
          <p className="text-sm text-zk-gray pt-2">
            Already using World ID, Reclaim, or EUDI Wallet for human identity?{" "}
            <a
              href="/enterprise/eudi-wallet"
              className="text-zk-secondary hover:text-zk-secondary/80 transition-colors underline underline-offset-2"
            >
              zkRune slots above them
            </a>{" "}
            as the agent-attestation layer — see the comparison table below.
            Deploying agents in the US?{" "}
            <a
              href="/enterprise/us-privacy"
              className="text-zk-secondary hover:text-zk-secondary/80 transition-colors underline underline-offset-2"
            >
              Colorado AI Act
            </a>{" "}
            is binding 1 February 2026.
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
              Every enterprise running agents today has the same four
              unanswered questions — and no production cryptographic answer
              for any of them.
            </h2>
            <p className="text-zk-gray max-w-3xl leading-relaxed">
              The agent runtime is well-served (LangChain, Claude Agent SDK,
              Vercel AI SDK). The human-identity layer is well-served (World
              ID 4.0, EUDI Wallet, KYC vendors). The web-data attestation
              layer is well-served (Reclaim Protocol). What is missing is the
              layer in between: the cryptographic primitives that make an
              agent's actions independently verifiable as authorised,
              in-scope, sourced from licensed data, and human-reviewed where
              required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 rounded-2xl border border-zk-primary/20 bg-zk-primary/5">
              <div className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                What regulators &amp; counterparties demand
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• EU AI Act Art. 12 — logging for high-risk AI decisions</li>
                <li>• EU AI Act Art. 14 — human-oversight attestation</li>
                <li>• EU AI Act Art. 50 — agent / generated-content transparency</li>
                <li>• GPAI Code of Practice — training-data provenance</li>
                <li>• Internal four-eyes / maker-checker controls</li>
                <li>• Vendor diligence: "prove the agent acted in scope"</li>
              </ul>
            </div>
            <div className="p-6 md:p-8 rounded-2xl border border-zk-secondary/20 bg-zk-secondary/5">
              <div className="text-xs font-bold text-zk-secondary uppercase tracking-wider mb-3">
                What zkRune ships today
              </div>
              <ul className="space-y-2.5 text-zk-gray">
                <li>• Cryptographic authority delegation (signature-verification)</li>
                <li>• Agent Passport verification — issuer-attested licensing (membership-proof)</li>
                <li>• Spending / scope / rate-limit proofs (range-proof)</li>
                <li>• Human-review attestations (signature-verification + patience-proof)</li>
                <li>• Mainnet anchors on three chains — re-verifiable</li>
                <li>• MIT-licensed, no token, no hardware, no closed ecosystem</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 p-6 rounded-2xl border border-white/10 bg-zk-darker/60">
            <p className="text-zk-gray leading-relaxed">
              <span className="text-white font-medium">
                We do not build an agent runtime.
              </span>{" "}
              Your agents keep running where they already do. We do not
              compete with World ID on proof-of-human or with Reclaim on
              web-data attestation. We provide the cryptographic primitives
              for the agent-specific attestation layer — the bit that turns
              "the agent did X" into a proof a regulator or counterparty can
              independently re-verify.
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
              Three categories with the sharpest agent-attestation gap right
              now.
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

      {/* PROOF OF AGENT — FOUR PILLARS */}
      <section
        id="proof-of-agent"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Proof of Agent
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Four pillars, four circuits, one open-source primitive set.
            </h2>
            <p className="text-zk-gray max-w-3xl">
              The four questions every agent deployment has to answer, and
              the circuits zkRune ships today that produce a re-verifiable
              cryptographic answer for each. Mapping is informational;
              consult your conformity assessor and DPO before claiming
              certification.
            </p>
          </div>

          <div className="space-y-3">
            {PROOF_OF_AGENT.map((row) => (
              <div
                key={row.pillar}
                className="grid md:grid-cols-12 gap-4 p-5 rounded-xl border border-white/10 bg-zk-darker/60"
              >
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    Pillar
                  </p>
                  <p className="font-hatton text-xl text-zk-primary mb-2">
                    {row.pillar}
                  </p>
                  <p className="text-xs text-zk-gray italic leading-relaxed">
                    {row.question}
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

      {/* COMPARISON */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              How we relate to the rest of the stack
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Three layers, three incumbents (or none), one place where
              zkRune fits.
            </h2>
          </div>
          <div className="space-y-4">
            {COMPARISON.map((row) => (
              <div
                key={row.layer}
                className="grid md:grid-cols-12 gap-4 p-6 rounded-2xl border border-white/10 bg-zk-dark/40"
              >
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    Layer
                  </p>
                  <p className="text-white text-sm font-medium">{row.layer}</p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    Incumbent
                  </p>
                  <p className="text-zk-accent text-sm font-medium mb-1">
                    {row.incumbent}
                  </p>
                  <p className="text-xs text-zk-gray/70 leading-relaxed">
                    {row.incumbentNote}
                  </p>
                </div>
                <div className="md:col-span-4">
                  <p className="text-xs font-bold text-zk-gray uppercase tracking-[0.18em] mb-1">
                    zkRune fit
                  </p>
                  <p className="text-sm text-zk-gray leading-relaxed">
                    {row.zkRuneFit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* READINESS */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 bg-zk-dark/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-bold text-zk-gray uppercase tracking-[0.2em]">
              Readiness
            </span>
            <h2 className="font-hatton text-3xl md:text-4xl text-white max-w-3xl">
              Zero new circuit work to ship v1. Honest about what is still on
              the audit roadmap.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {READINESS.map((r) => (
              <div
                key={r.label}
                className="p-5 rounded-xl border border-white/10 bg-zk-darker/60"
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
              The list below is what your existing agent stack already
              handles. zkRune slots underneath as the cryptographic
              attestation layer — not as a replacement for the runtimes,
              vendors, or platforms you already trust.
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
        body="Counterparties, internal audit, AI governance teams, and supervisors can independently re-verify any Proof of Agent attestation against the on-chain key — no dependency on the agent operator or zkRune as a vendor."
      />

      {/* CONTACT */}
      <section
        id="contact"
        className="relative z-10 px-6 md:px-12 lg:px-16 py-20 border-t border-white/5"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Evaluating zkRune as your Proof of Agent layer?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We work directly with engineering teams at agent platforms,
            in-house AI ops, and AI governance vendors. The fastest path is a
            30-minute technical session with the OpenAPI spec, trust
            documentation, and a tailored Proof-of-Agent integration sketch
            ready to forward to your security team.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=AI%20Agent%20Identity%20Session"
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

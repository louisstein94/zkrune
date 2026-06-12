import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Proof of Agent — Verifiable identity for AI agents",
  description:
    "Give any AI agent a portable, zero-knowledge passport. Prove who authorized it, that it acts within limits, and that a human is in the loop — verified statelessly on every MCP / A2A / x402 request. Groth16 ZK-SNARKs over BN128.",
  alternates: { canonical: "https://zkrune.com/proof-of-agent" },
  openGraph: {
    title: "Proof of Agent — Verifiable identity for AI agents",
    description:
      "A portable, zero-knowledge passport for AI agents. Verified statelessly on every request. Slots under MCP, A2A, and x402.",
    url: "https://zkrune.com/proof-of-agent",
    siteName: "zkRune",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Proof of Agent — Verifiable identity for AI agents",
    description:
      "A portable, zero-knowledge passport for AI agents. Verified statelessly. Groth16 over BN128.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const PROVES = [
  {
    title: "Delegated authority",
    body: "A human signs a delegation over the agent's key, its policy, and an expiry. The passport proves the agent runs under that authority — without revealing the human's key.",
  },
  {
    title: "Within limits",
    body: "Spend ceilings and allowed domains travel with the passport. A relying party rejects any action outside the delegated policy — checked against signature-bound values, not client claims.",
  },
  {
    title: "Human in the loop",
    body: "For sensitive actions, a fresh human signature is bound to the specific action and timestamp. The verifier confirms the approval is recent, within a TTL window.",
  },
];

const STACK = [
  { k: "MCP / A2A", v: "Rides as request headers — no new identity format to adopt." },
  { k: "x402", v: "Gate a paid endpoint on a valid passport, same 403-challenge retry loop." },
  { k: "ERC-8004", v: "Maps onto the Trustless Agents Validation Registry as a ZK validation method." },
];

const ROADMAP = [
  {
    tag: "v1 · light",
    title: "Authority + human-in-the-loop + freshness",
    body: "Zero new trusted setup — reuses the existing signature-verification circuit.",
    live: true,
  },
  {
    tag: "v1.1 · full",
    title: "maxSpend / onlyDomains enforced in-circuit",
    body: "A composed agent-action circuit ZK-hides the amount, plus one ceremony.",
    live: false,
  },
  {
    tag: "v2",
    title: "Issuer-attested, policy-bound provenance",
    body: "An open issuer registry. zkRune verifies the attestation chain — it does not generate proof-of-training.",
    live: false,
  },
];

export default function ProofOfAgentPage() {
  return (
    <main className="min-h-screen bg-zk-darker text-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 px-8 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              Proof of Agent
            </span>
          </div>

          <h1 className="font-hatton text-5xl md:text-6xl text-white mb-6 leading-tight">
            A passport for <span className="text-zk-primary">AI agents</span>
          </h1>
          <p className="text-xl text-zk-gray max-w-2xl mx-auto mb-10">
            Agents are everywhere; nobody can verify them. Give any agent a portable,
            zero-knowledge passport — and let anyone confirm, statelessly, who authorized it,
            that it acts within limits, and that a human is in the loop. Groth16 ZK-SNARKs over BN128.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/agent/verify"
              className="px-8 py-4 bg-zk-primary text-white font-medium rounded-lg hover:bg-zk-primary/90 transition-all text-lg"
            >
              Open the verifier
            </Link>
            <Link
              href="/docs/agent-passport"
              className="px-8 py-4 border border-zk-gray/30 text-white font-medium rounded-lg hover:border-zk-primary hover:text-zk-primary transition-all text-lg"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      {/* What it proves */}
      <section className="px-8 py-16 border-t border-zk-gray/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-3 text-center">
            What a passport proves
          </h2>
          <p className="text-zk-gray text-center mb-12 max-w-2xl mx-auto">
            Three claims, each cryptographic. No private keys ever leave the agent or the human.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {PROVES.map((p) => (
              <div key={p.title} className="p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-zk-secondary/15 flex items-center justify-center mb-4">
                  <span className="text-zk-secondary">✓</span>
                </div>
                <h3 className="font-medium text-white mb-2">{p.title}</h3>
                <p className="text-sm text-zk-gray">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-16 border-t border-zk-gray/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-12 text-center">Eight lines</h2>
          <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 md:p-8">
            <pre className="text-xs md:text-sm font-mono text-zk-gray overflow-x-auto">
              <code>{`import { AgentPassport, agentPassportFetchGuard, localGroth16Backend } from "zkrune-agent";

// Agent: mint once, attest each action
const passport = await AgentPassport.mint({ humanSigner, agentSigner, policy, backend });
const headers  = await passport.attest({ action: { method, target, amount, externalId } });

// Relying party: gate the endpoint
const guard = agentPassportFetchGuard({ backend: localGroth16Backend(vkey), enforceDomain: true });
const blocked = await guard(request);   // 403 challenge, or null to proceed`}</code>
            </pre>
          </div>
          <p className="text-sm text-zk-gray text-center mt-6">
            The action proof is bound to{" "}
            <span className="font-mono text-zk-primary">
              M = Poseidon(actionDigest ‖ issuedAt ‖ agentId)
            </span>{" "}
            — it cannot be replayed onto a different action.
          </p>
        </div>
      </section>

      {/* Slots under your stack */}
      <section className="px-8 py-16 border-t border-zk-gray/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-3 text-center">
            Under your stack, not beside it
          </h2>
          <p className="text-zk-gray text-center mb-12 max-w-2xl mx-auto">
            The passport is two HTTP headers. It does not create a new identity island —
            it goes under the standards agents already speak.
          </p>
          <div className="space-y-3">
            {STACK.map((s) => (
              <div
                key={s.k}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-5 bg-zk-dark/30 border border-zk-gray/20 rounded-xl"
              >
                <span className="font-mono text-sm text-zk-primary sm:w-32 shrink-0">{s.k}</span>
                <span className="text-sm text-zk-gray">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap / honest scope */}
      <section className="px-8 py-16 border-t border-zk-gray/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-hatton text-3xl text-white mb-3 text-center">Honest scope</h2>
          <p className="text-zk-gray text-center mb-12 max-w-2xl mx-auto">
            We ship what we can prove today and name what we can&apos;t yet. zkRune verifies
            issuer-attested provenance — it does not generate proof-of-training, and never claims
            ZK proves training data is &ldquo;licensed&rdquo;.
          </p>
          <div className="space-y-4">
            {ROADMAP.map((r) => (
              <div
                key={r.tag}
                className="flex items-start gap-4 p-5 bg-zk-dark/30 border border-zk-gray/20 rounded-xl"
              >
                <span
                  className={`mt-0.5 px-3 py-1 text-xs font-mono rounded-full border whitespace-nowrap ${
                    r.live
                      ? "text-zk-secondary border-zk-secondary/40 bg-zk-secondary/10"
                      : "text-zk-gray border-zk-gray/30"
                  }`}
                >
                  {r.tag}
                </span>
                <div>
                  <h3 className="font-medium text-white">{r.title}</h3>
                  <p className="text-sm text-zk-gray mt-1">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-8 py-20 border-t border-zk-gray/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-hatton text-4xl text-white mb-6">
            Verify an agent in your browser
          </h2>
          <p className="text-zk-gray mb-10">
            Generate a live passport, then watch it verify — Groth16, checked in milliseconds.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/agent/verify"
              className="px-8 py-4 bg-zk-primary text-white font-medium rounded-lg hover:bg-zk-primary/90 transition-all text-lg"
            >
              Open the verifier
            </Link>
            <Link
              href="/docs/agent-passport"
              className="px-8 py-4 border border-zk-gray/30 text-white font-medium rounded-lg hover:border-zk-primary hover:text-zk-primary transition-all text-lg"
            >
              Read the docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

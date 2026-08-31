"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

type DemoResult = {
  verified: boolean;
  provingMs: number;
  nullifier: string;
  publicSignalCount: number;
  policy: { requiredTier: string; jurisdictionsServed: number[]; issuerPublicKey: string };
  undisclosed: string[];
  audit: {
    statedBar: string;
    admissions: number;
    passed: number;
    upheld: boolean;
    findings: { nullifier: string; ok: boolean; reason: string | null }[];
    commitment: string;
    note: string;
  };
  onChain:
    | { cluster: string; signature: string; explorer: string; note: string }
    | { cluster: string; unavailable: string };
  error?: string;
};

const PARTIES = [
  {
    role: "Issuer",
    who: "Transfer agent, fund administrator or KYC provider",
    does: "Signs a claim about an investor and publishes only its public key.",
    cannot: "Cannot prove eligibility on an investor's behalf — it never receives their secret.",
    color: "#6366F1",
  },
  {
    role: "Venue",
    who: "The regulated offering",
    does: "Configures the issuer key once, publishes the countries it serves and the tier it requires.",
    cannot: "Cannot learn who arrived, where they live, or how accredited they are.",
    color: "#8B5CF6",
  },
  {
    role: "Investor",
    who: "The holder",
    does: "Generates their own secret, receives a signed credential, proves eligibility.",
    cannot: "Cannot inflate their tier, extend the expiry, or reuse someone else's credential.",
    color: "#34D399",
  },
];

export default function RwaPage() {
  const [result, setResult] = useState<DemoResult | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/rwa/demo", { method: "POST" });
      setResult(await res.json());
    } catch {
      setResult({ error: "Request failed" } as DemoResult);
    } finally {
      setRunning(false);
    }
  }

  const onChain = result?.onChain;
  const chainSignature = onChain && "signature" in onChain ? onChain : null;

  return (
    <main className="relative min-h-screen bg-zk-darker overflow-hidden">
      <Navigation />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-zk-primary/5 blur-[140px]" />
        <div className="noise-texture absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zk-primary/10 border border-zk-primary/30 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-sm font-bold text-zk-primary uppercase tracking-wider">
              Private RWA Access
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-6xl text-white mb-5">
            Eligibility without
            <br />
            <span className="text-zk-primary">disclosure</span>.
          </h1>
          <p className="text-lg text-zk-gray max-w-2xl mx-auto leading-relaxed">
            A regulated offering verifies that an investor is accredited and in an
            accepted jurisdiction — without learning who they are, where they live,
            or which tier they actually hold.
          </p>
        </div>

        {/* Parties */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {PARTIES.map((p) => (
            <div
              key={p.role}
              className="p-6 bg-zk-dark/60 border rounded-2xl backdrop-blur-sm"
              style={{ borderColor: `${p.color}25` }}
            >
              <h2 className="font-hatton text-xl mb-1" style={{ color: p.color }}>
                {p.role}
              </h2>
              <p className="text-xs text-zk-gray/60 uppercase tracking-wider mb-4">{p.who}</p>
              <p className="text-sm text-zk-gray leading-relaxed mb-3">{p.does}</p>
              <p className="text-sm text-zk-gray/70 leading-relaxed border-t border-white/5 pt-3">
                {p.cannot}
              </p>
            </div>
          ))}
        </div>

        {/* Demo */}
        <div className="p-6 md:p-8 bg-zk-dark/50 border border-white/5 rounded-2xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-hatton text-2xl text-white mb-1">Run the flow</h2>
              <p className="text-sm text-zk-gray">
                Issues a credential, proves eligibility, and verifies the proof on chain.
              </p>
            </div>
            <button
              onClick={run}
              disabled={running}
              className="px-6 py-3 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all disabled:opacity-50"
            >
              {running ? "Proving…" : "Run demo"}
            </button>
          </div>

          {result?.error && (
            <p className="text-sm text-red-400">{result.error}</p>
          )}

          {result && !result.error && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <Stat label="Result" value={result.verified ? "Eligible" : "Rejected"} accent />
                <Stat label="Proving time" value={`${result.provingMs} ms`} />
                <Stat label="Public signals" value={String(result.publicSignalCount)} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Panel title="What the venue configured">
                  <Row k="Required tier" v={result.policy.requiredTier} />
                  <Row k="Jurisdictions served" v={result.policy.jurisdictionsServed.join(", ")} />
                  <Row k="Issuer key" v={`${result.policy.issuerPublicKey.slice(0, 20)}…`} mono />
                </Panel>

                <Panel title="What the venue never learned">
                  {result.undisclosed.map((item) => (
                    <div key={item} className="flex items-center gap-2 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zk-secondary" />
                      <span className="text-sm text-zk-gray capitalize">{item}</span>
                    </div>
                  ))}
                </Panel>
              </div>

              <Panel title="Nullifier">
                <p className="text-xs font-mono text-zk-gray break-all leading-relaxed">
                  {result.nullifier}
                </p>
                <p className="text-sm text-zk-gray/70 mt-3 leading-relaxed">
                  Deterministic for this investor in this offering, so the gate can turn
                  away a second entry. Unlinkable to the same investor anywhere else.
                </p>
              </Panel>

              {result.audit && (
                <Panel title="What an auditor can check later">
                  <p className="text-sm text-zk-gray/80 leading-relaxed mb-4">
                    Every admission is kept with the proof that granted it. A regulator
                    the venue authorises re-verifies the set and learns whether policy
                    held — without learning who was admitted.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-zk-gray">
                      stated bar: {result.audit.statedBar}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-zk-gray">
                      {result.audit.passed} of {result.audit.admissions} upheld
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {result.audit.findings.map((f) => (
                      <div
                        key={f.nullifier}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          f.ok
                            ? "border-zk-secondary/25 bg-zk-secondary/5"
                            : "border-red-500/25 bg-red-500/5"
                        }`}
                      >
                        <span
                          className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            f.ok ? "bg-zk-secondary" : "bg-red-400"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-zk-gray truncate">{f.nullifier}</p>
                          <p className={`text-sm ${f.ok ? "text-zk-secondary" : "text-red-400"}`}>
                            {f.ok ? "Met the stated policy" : f.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-zk-gray/70 leading-relaxed">{result.audit.note}</p>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-zk-gray/60 uppercase tracking-wider mb-1">
                      Admissions commitment
                    </p>
                    <p className="text-xs font-mono text-zk-gray break-all">
                      {result.audit.commitment}
                    </p>
                    <p className="text-sm text-zk-gray/70 mt-2 leading-relaxed">
                      Published as admissions happen, this is what stops a venue quietly
                      dropping a record before the audit. Proofs alone show that what is
                      in the set is sound; they cannot show nothing was left out.
                    </p>
                  </div>
                </Panel>
              )}

              {chainSignature ? (
                <div className="p-5 bg-zk-secondary/5 border border-zk-secondary/25 rounded-xl">
                  <p className="text-xs font-bold text-zk-secondary uppercase tracking-wider mb-2">
                    Verified on {chainSignature.cluster}
                  </p>
                  <a
                    href={chainSignature.explorer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-zk-secondary hover:underline break-all"
                  >
                    {chainSignature.signature}
                  </a>
                  <p className="text-sm text-zk-gray/70 mt-3 leading-relaxed">
                    {chainSignature.note}
                  </p>
                </div>
              ) : (
                <div className="p-5 bg-white/[0.03] border border-white/10 rounded-xl">
                  <p className="text-sm text-zk-gray leading-relaxed">
                    The proof verified locally. On-chain verification is not configured on
                    this deployment, so the chain step was skipped rather than reported as
                    a failure.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Honest limits */}
        <div className="mt-10 p-6 bg-zk-accent/5 border border-zk-accent/25 rounded-2xl">
          <h2 className="text-sm font-bold text-zk-accent uppercase tracking-wider mb-3">
            Where this stands
          </h2>
          <p className="text-sm text-zk-gray leading-relaxed mb-3">
            On-chain verification runs on devnet. The mainnet verifier carries the
            circuit once that program is upgraded; the proof and the verification
            logic are identical on both.
          </p>
          <p className="text-sm text-zk-gray leading-relaxed">
            Credentials carry a validity window and there is no revocation list yet, so
            an issuer that changes its mind is expressed by declining to re-issue. Until
            revocation ships, offerings that need tighter control should issue for hours
            rather than weeks. Read the{" "}
            <Link href="/trust" className="text-zk-accent hover:underline">
              trust model
            </Link>{" "}
            before relying on this in production.
          </p>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-4 bg-zk-darker/60 border border-white/5 rounded-xl">
      <p className="text-xs text-zk-gray/60 uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-hatton text-xl ${accent ? "text-zk-secondary" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 bg-zk-darker/40 border border-white/5 rounded-xl">
      <p className="text-xs font-bold text-zk-gray/70 uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-zk-gray/70">{k}</span>
      <span className={`text-white ${mono ? "font-mono text-xs" : ""}`}>{v}</span>
    </div>
  );
}

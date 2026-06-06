"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";

// Friendly labels for the six stateless checks the verifier runs.
const CHECK_LABELS: Record<string, string> = {
  passportNotExpired: "Passport not expired",
  delegationValid: "Delegated by human (signature valid)",
  signerMatchesPolicy: "Signer matches policy",
  proofValid: "Groth16 proof valid",
  messageBindingValid: "Action cryptographically bound",
  fresh: "Fresh (within TTL)",
};

export default function AgentVerifyPage() {
  const [passport, setPassport] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const verify = async () => {
    if (!passport || !action) {
      alert("Paste both the X-zkRune-Passport and X-zkRune-Action values.");
      return;
    }
    setIsVerifying(true);
    setResult(null);
    try {
      const res = await fetch("/api/agent/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passport: passport.trim(), action: action.trim() }),
      });
      setResult(await res.json());
    } catch (error: any) {
      setResult({ error: "Request failed: " + error.message });
    } finally {
      setIsVerifying(false);
    }
  };

  // Fetch a freshly-minted, genuinely-valid passport from the server (live
  // Groth16). Keeps the client bundle free of the proving stack.
  const loadExample = async () => {
    setIsLoadingExample(true);
    try {
      const res = await fetch("/api/agent/example");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPassport(data.passport);
      setAction(data.action);
      setResult(null);
    } catch (error: any) {
      console.error("Failed to generate example:", error);
      alert("Failed to generate a live example: " + error.message);
    } finally {
      setIsLoadingExample(false);
    }
  };

  const verified = result?.verified === true;

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-32 px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
              <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Proof of Agent — Stateless Verifier
              </span>
            </div>

            <h1 className="font-hatton text-5xl text-white mb-4">
              Verify an <span className="text-zk-primary">Agent Passport</span>
            </h1>
            <p className="text-xl text-zk-gray max-w-2xl mx-auto">
              Paste an agent&apos;s passport headers. Anyone can verify — no database, no shared
              state. Groth16 over BN128, checked in milliseconds.
            </p>

            <button
              onClick={() => setShowHelp((v) => !v)}
              className="mt-5 inline-flex items-center gap-2 text-sm text-zk-gray hover:text-zk-primary transition-all"
              aria-expanded={showHelp}
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-zk-gray/50 text-xs">
                ?
              </span>
              What&apos;s an agent passport?
            </button>
          </div>

          {/* Explainer */}
          {showHelp && (
            <div className="mb-8 p-6 bg-zk-dark/40 border border-zk-gray/20 rounded-2xl text-left">
              <p className="text-sm text-zk-gray mb-4">
                An <span className="text-white">agent passport</span> is a portable credential an
                AI agent carries on every request — two base64 headers:
              </p>
              <ul className="space-y-3 text-sm text-zk-gray mb-4">
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs text-zk-primary whitespace-nowrap mt-0.5">
                    X-zkRune-Passport
                  </span>
                  <span>
                    a human&apos;s signature delegating <span className="text-white">authority</span> and
                    a <span className="text-white">policy</span> (spend limits, allowed domains) to the
                    agent&apos;s key. Minted once.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono text-xs text-zk-primary whitespace-nowrap mt-0.5">
                    X-zkRune-Action
                  </span>
                  <span>
                    a fresh zero-knowledge proof (Groth16) binding{" "}
                    <span className="text-white">this one action</span> to the passport. Produced per
                    request, so it can&apos;t be replayed onto a different action.
                  </span>
                </li>
              </ul>
              <p className="text-sm text-zk-gray">
                Verifying proves <span className="text-white">who authorized the agent</span>, that the
                action is <span className="text-white">within the delegated limits</span>, and that it&apos;s{" "}
                <span className="text-white">fresh</span> — without revealing any private keys. It slots
                under MCP, A2A, and x402 as request headers.
              </p>
            </div>
          )}

          {/* What gets proven */}
          <div className="mb-8 p-6 bg-zk-secondary/10 border border-zk-secondary/30 rounded-2xl">
            <h3 className="font-medium text-zk-secondary mb-3">This verifier proves, cryptographically:</h3>
            <ul className="space-y-2 text-sm text-zk-gray">
              <li className="flex items-start gap-2">
                <span className="text-zk-primary mt-1">✓</span>
                <span>The agent runs under authority delegated by a human signer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zk-primary mt-1">✓</span>
                <span>The action is bound to this proof (it cannot be replayed onto another action)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zk-primary mt-1">✓</span>
                <span>The attestation is fresh, and human-in-the-loop approval is present when required</span>
              </li>
            </ul>
          </div>

          {/* Inputs */}
          <div className="mb-6 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-hatton text-2xl text-white">Passport headers</h3>
              <button
                onClick={loadExample}
                disabled={isLoadingExample}
                className="px-4 py-2 border border-zk-gray/30 text-zk-gray rounded-lg text-sm hover:border-zk-primary hover:text-zk-primary transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoadingExample ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zk-gray/30 border-t-zk-primary rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>Load live example</>
                )}
              </button>
            </div>

            <label className="block text-xs text-zk-gray uppercase tracking-wider mb-2">
              X-zkRune-Passport
            </label>
            <textarea
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              placeholder="base64 passport envelope…"
              className="w-full h-28 px-4 py-3 mb-5 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
            />

            <label className="block text-xs text-zk-gray uppercase tracking-wider mb-2">
              X-zkRune-Action
            </label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="base64 action attestation…"
              className="w-full h-28 px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
            />
          </div>

          {/* Action */}
          <button
            onClick={verify}
            disabled={isVerifying || !passport || !action}
            className="w-full py-4 mb-8 bg-zk-primary text-white font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying…
              </>
            ) : (
              <>Verify Passport</>
            )}
          </button>

          {/* Result */}
          {result && !result.error && (
            <div
              className={`p-8 rounded-2xl border-2 ${
                verified ? "bg-zk-primary/10 border-zk-primary" : "bg-red-500/10 border-red-500"
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                {verified ? (
                  <svg className="w-16 h-16 text-zk-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <div>
                  <h2 className="font-hatton text-3xl text-white">
                    {verified ? "zkRune Verified" : "Not Verified"}
                  </h2>
                  <p className="text-sm text-zk-gray mt-1">
                    {result.circuit} · {result.timing}ms
                  </p>
                </div>
              </div>

              {/* Claims (green) */}
              {verified && Array.isArray(result.claims) && result.claims.length > 0 && (
                <div className="mb-6 space-y-2">
                  {result.claims.map((c: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white">
                      <span className="text-zk-secondary mt-0.5">✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reasons (failure) */}
              {!verified && Array.isArray(result.reasons) && result.reasons.length > 0 && (
                <div className="mb-6 space-y-2">
                  {result.reasons.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                      <span className="mt-0.5">✗</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Per-check grid */}
              {result.checks && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {Object.entries(result.checks).map(([key, pass]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-sm px-3 py-2 bg-zk-darker/50 rounded-lg"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${pass ? "bg-zk-secondary" : "bg-red-500"}`}
                      />
                      <span className="text-zk-gray">{CHECK_LABELS[key] ?? key}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Passport summary */}
              {result.passport && (
                <div className="text-xs text-zk-gray border-t border-zk-gray/20 pt-4 space-y-1 font-mono">
                  <div>agent: {result.passport.agentPubkey}</div>
                  <div>human: {result.passport.humanPubkey}</div>
                  <div>policy: {JSON.stringify(result.passport.policy)}</div>
                </div>
              )}
            </div>
          )}

          {result?.error && (
            <div className="p-6 rounded-2xl border-2 bg-red-500/10 border-red-500 text-red-300">
              {result.error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";

export default function VerifyProofPage() {
  const [proofJson, setProofJson] = useState("");
  const [publicJson, setPublicJson] = useState("");
  const [vKeyJson, setVKeyJson] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyProof = async () => {
    if (!proofJson || !publicJson || !vKeyJson) {
      alert("Please fill all fields");
      return;
    }

    setIsVerifying(true);

    try {
      // Parse JSONs
      const proof = JSON.parse(proofJson);
      const publicSignals = JSON.parse(publicJson);
      const vKey = JSON.parse(vKeyJson);

      // Call verification API
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proof, publicSignals, vKey }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const loadExample = () => {
    setProofJson(JSON.stringify({
      "pi_a": ["12345..."],
      "pi_b": [["67890..."]],
      "pi_c": ["abcde..."],
      "protocol": "groth16"
    }, null, 2));
    setPublicJson(JSON.stringify(["1"], null, 2));
    setVKeyJson('{"protocol": "groth16", "curve": "bn128"}');
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-32 px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
              <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Independent Verification
              </span>
            </div>

            <h1 className="font-hatton text-5xl text-white mb-4">
              Verify <span className="text-zk-primary">Any ZK Proof</span>
            </h1>
            <p className="text-xl text-zk-gray max-w-2xl mx-auto">
              Independently verify zero-knowledge proofs. Paste your proof, public signals, and verification key below.
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-8 p-6 bg-zk-secondary/10 border border-zk-secondary/30 rounded-2xl">
            <h3 className="font-medium text-zk-secondary mb-3 flex items-center gap-2">
              <span className="text-2xl">🔬</span>
              Why Independent Verification?
            </h3>
            <ul className="space-y-2 text-sm text-zk-gray">
              <li className="flex items-start gap-2">
                <span className="text-zk-primary mt-1">✓</span>
                <span>Verify proofs were actually generated with real ZK-SNARKs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zk-primary mt-1">✓</span>
                <span>Don't trust zkRune - verify mathematically!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zk-primary mt-1">✓</span>
                <span>Use any snarkjs-compatible verifier</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zk-primary mt-1">✓</span>
                <span>Open source, transparent, trustless</span>
              </li>
            </ul>
          </div>

          {/* Input Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Proof */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6">
              <h3 className="font-hatton text-xl text-white mb-4">1. Proof</h3>
              <textarea
                value={proofJson}
                onChange={(e) => setProofJson(e.target.value)}
                placeholder='{"pi_a": [...], "pi_b": [...], ...}'
                className="w-full h-64 px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
              />
            </div>

            {/* Public Signals */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6">
              <h3 className="font-hatton text-xl text-white mb-4">2. Public Signals</h3>
              <textarea
                value={publicJson}
                onChange={(e) => setPublicJson(e.target.value)}
                placeholder='["1"]'
                className="w-full h-64 px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
              />
            </div>

            {/* Verification Key */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6">
              <h3 className="font-hatton text-xl text-white mb-4">3. Verification Key</h3>
              <textarea
                value={vKeyJson}
                onChange={(e) => setVKeyJson(e.target.value)}
                placeholder='{"protocol": "groth16", ...}'
                className="w-full h-64 px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={loadExample}
              className="px-6 py-3 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary hover:text-zk-primary transition-colors"
            >
              Load Example
            </button>
            <button
              onClick={verifyProof}
              disabled={isVerifying || !proofJson || !publicJson || !vKeyJson}
              className="flex-1 py-3 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>🔍 Verify Proof</>
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`p-8 rounded-2xl border-2 ${
              result.success && result.isValid
                ? "bg-zk-primary/10 border-zk-primary"
                : "bg-red-500/10 border-red-500"
            }`}>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-6xl">
                  {result.success && result.isValid ? "✅" : "❌"}
                </div>
                <div>
                  <h2 className="font-hatton text-3xl text-white mb-2">
                    {result.success && result.isValid
                      ? "Proof is Valid!"
                      : "Proof is Invalid"}
                  </h2>
                  <p className="text-zk-gray">
                    {result.success && result.isValid
                      ? "This proof was cryptographically verified using zk-SNARKs"
                      : result.error || "The proof could not be verified"}
                  </p>
                </div>
              </div>

              {result.timing && (
                <div className="text-sm text-zk-gray">
                  Verification completed in {result.timing}ms
                </div>
              )}
            </div>
          )}

          {/* How to Verify Externally */}
          <div className="mt-12 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <h2 className="font-hatton text-2xl text-white mb-6">
              Verify with CLI (100% Independent)
            </h2>
            
            <div className="space-y-4">
              <div className="bg-zk-darker/50 border border-zk-gray/10 rounded-lg p-4">
                <p className="text-sm text-zk-gray mb-3">
                  1. Export your proof from zkRune (JSON format)
                </p>
                <pre className="text-xs text-white font-mono bg-black/30 p-3 rounded overflow-x-auto">
{`# Save files: proof.json, public.json, verification_key.json

# Verify with snarkjs CLI:
snarkjs groth16 verify \\
  verification_key.json \\
  public.json \\
  proof.json

# Output: [INFO] snarkJS: OK!`}</pre>
              </div>

              <div className="bg-zk-darker/50 border border-zk-gray/10 rounded-lg p-4">
                <p className="text-sm text-zk-gray mb-3">
                  2. Or use any zk-SNARK verifier (Solidity, Rust, Python)
                </p>
                <p className="text-xs text-zk-gray">
                  zkRune uses standard Groth16 protocol - compatible with all major ZK libraries
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


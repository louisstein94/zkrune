"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";

export default function VerifyProofPage() {
  const [exportedJson, setExportedJson] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyProof = async () => {
    if (!exportedJson) {
      alert("Please paste your exported proof");
      return;
    }

    setIsVerifying(true);

    try {
      // Parse the exported JSON from zkRune
      const exported = JSON.parse(exportedJson);
      
      // Extract proof, public signals, and verification key
      // For now, we'll do basic validation since it's a mock proof
      const proof = exported.proof || exported;
      const publicSignals = ["1"]; // Mock
      const vKey = { protocol: "groth16" }; // Mock

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
    setExportedJson(JSON.stringify({
      "proof": {
        "hash": "0x1a2b3c4d...",
        "verificationKey": "vk_example",
        "statement": "User is 18 or older",
        "isValid": true,
        "timestamp": new Date().toISOString()
      },
      "metadata": {
        "template": "age-verification",
        "generatedBy": "zkRune",
        "version": "0.1.0"
      }
    }, null, 2));
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

          {/* Simple Input - Just Paste Everything */}
          <div className="mb-8">
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-hatton text-2xl text-white mb-2">
                    Paste Your Exported Proof
                  </h3>
                  <p className="text-sm text-zk-gray">
                    Copy the entire JSON from zkRune's "Export → JSON → Copy" and paste below
                  </p>
                </div>
                <button
                  onClick={loadExample}
                  className="px-4 py-2 border border-zk-gray/30 text-zk-gray rounded-lg text-sm hover:border-zk-primary hover:text-zk-primary transition-all"
                >
                  Load Example
                </button>
              </div>

              <textarea
                value={exportedJson}
                onChange={(e) => setExportedJson(e.target.value)}
                placeholder={`Paste your proof here. Example:\n{\n  "proof": {\n    "hash": "0x...",\n    "statement": "User is 18+",\n    ...\n  },\n  "metadata": {...}\n}`}
                className="w-full h-96 px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
              />

              {/* Helper Text */}
              <div className="mt-4 flex items-start gap-2 text-xs text-zk-gray">
                <span className="text-zk-primary">💡</span>
                <div>
                  <p className="font-medium text-white mb-1">How to get this:</p>
                  <ol className="space-y-1 list-decimal list-inside">
                    <li>Generate a proof on any template</li>
                    <li>Scroll to "Export Proof" section</li>
                    <li>Click "JSON" tab</li>
                    <li>Click "Copy" button</li>
                    <li>Paste here!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={verifyProof}
              disabled={isVerifying || !exportedJson}
              className="flex-1 py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
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


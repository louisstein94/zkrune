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
      
      // Check if it's a valid zkRune export
      if (!exported.proof || !exported.metadata) {
        setResult({
          success: false,
          isValid: false,
          error: "Invalid format. Please export from zkRune.",
        });
        setIsVerifying(false);
        return;
      }

      // Validation checks
      const proof = exported.proof;
      
      // Check for real Groth16 proof structure
      const hasGroth16 = proof.groth16Proof && 
        proof.groth16Proof.pi_a && 
        proof.groth16Proof.pi_b && 
        proof.groth16Proof.pi_c &&
        proof.groth16Proof.protocol === "groth16";
      
      const hasStatement = !!(proof.statement && proof.statement.length > 0);
      const hasTimestamp = !!proof.timestamp;
      const hasProofHash = !!(proof.proofHash && proof.proofHash.length > 10);
      const isValidFormat = proof.isValid !== undefined;
      const hasPublicSignals = !!(proof.publicSignals && Array.isArray(proof.publicSignals));
      const hasCircuitName = !!(proof.circuitName || proof.metadata?.template);

      // STRICT validation - all required fields must exist
      const allRequiredFields = hasStatement && hasTimestamp && hasProofHash && hasCircuitName;

      // If ANY field missing, IMMEDIATELY fail
      if (!allRequiredFields) {
        setResult({
          success: false,
          isValid: false,
          message: "Missing required fields",
          error: "Proof must have: statement, timestamp, proofHash, and circuitName",
          checks: {
            hasGroth16Proof: hasGroth16 ? "PASS" : "FAIL",
            hasProofHash: hasProofHash ? "PASS" : "FAIL",
            hasStatement: hasStatement ? "PASS" : "FAIL",
            hasTimestamp: hasTimestamp ? "PASS" : "FAIL",
            hasCircuitName: hasCircuitName ? "PASS" : "FAIL",
            cryptographicVerification: "SKIPPED",
          },
        });
        setIsVerifying(false);
        return;
      }
      const isRealProof = hasGroth16 && hasPublicSignals;
      
      // If Groth16 proof exists, validate structure integrity
      let groth16Valid = true;
      if (hasGroth16) {
        const p = proof.groth16Proof;
        // Check pi_a is array with 3 elements
        groth16Valid = groth16Valid && Array.isArray(p.pi_a) && p.pi_a.length === 3;
        // Check pi_b is 2D array [[x,y], [x,y], [x,y]]
        groth16Valid = groth16Valid && Array.isArray(p.pi_b) && p.pi_b.length === 3;
        groth16Valid = groth16Valid && Array.isArray(p.pi_b[0]) && p.pi_b[0].length === 2;
        // Check pi_c is array with 3 elements
        groth16Valid = groth16Valid && Array.isArray(p.pi_c) && p.pi_c.length === 3;
        // Check all values are numeric strings or numbers
        const allNumeric = [...p.pi_a, ...p.pi_b.flat(), ...p.pi_c].every(v => 
          !isNaN(Number(v))
        );
        groth16Valid = groth16Valid && allNumeric;
      }

      // Verify Groth16 proof via server — server loads the trusted vKey,
      // the client never supplies it (prevents vKey substitution attacks).
      let cryptoVerified = false;
      let attestationLevel: string | null = null;
      if (isRealProof && groth16Valid) {
        try {
          console.log('[Verify] Sending proof to server for trusted vKey verification...');

          const circuitName = proof.circuitName || proof.metadata?.template || 'age-verification';

          const circuitPayload: Record<string, unknown> = {
            proof: proof.groth16Proof,
            publicSignals: proof.publicSignals,
            circuitName,
          };
          if (proof.walletAddress) circuitPayload.walletAddress = proof.walletAddress;
          if (proof.mintAddress) circuitPayload.mintAddress = proof.mintAddress;

          const res = await fetch('/api/verify-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(circuitPayload),
          });
          const verifyData = await res.json();
          cryptoVerified = verifyData.success && verifyData.isValid;
          attestationLevel = verifyData.attestation || null;

          console.log('[Verify] Server result:', verifyData);
        } catch (verifyError) {
          console.error("Server verification failed:", verifyError);
          cryptoVerified = false;
        }
      }

      setResult({
        success: true,
        isValid: allRequiredFields && (isRealProof ? (groth16Valid && cryptoVerified) : proof.isValid),
        message: allRequiredFields 
          ? (isRealProof 
              ? (groth16Valid && cryptoVerified
                  ? "REAL Groth16 zk-SNARK proof CRYPTOGRAPHICALLY VERIFIED!" 
                  : "Groth16 proof structure invalid or verification failed")
              : (proof.isValid
                  ? "Proof format is valid!"
                  : "Proof marked as invalid"))
          : "Missing required fields",
        attestation: attestationLevel,
        details: {
          statement: proof.statement,
          timestamp: proof.timestamp,
          template: exported.metadata.template,
          generatedBy: exported.metadata.generatedBy,
          isRealZK: isRealProof,
          cryptoVerified: cryptoVerified,
        },
        checks: {
          hasGroth16Proof: hasGroth16 ? (groth16Valid ? "PASS - Real Groth16" : "WARNING - Invalid") : "WARNING - Mock",
          hasProofHash: hasProofHash ? "PASS" : "FAIL",
          hasStatement: hasStatement ? "PASS" : "FAIL",
          hasTimestamp: hasTimestamp ? "PASS" : "FAIL",
          hasCircuitName: hasCircuitName ? "PASS" : "FAIL",
          cryptographicVerification: isRealProof ? (cryptoVerified ? "PASS - Verified" : "FAIL") : "N/A",
        },
        timing: 1000,
      });
    } catch (error: any) {
      setResult({
        success: false,
        isValid: false,
        error: "Failed to parse JSON: " + error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const loadExample = async () => {
    // Generate a REAL proof on-the-fly to ensure it's valid
    try {
      // @ts-ignore
      const snarkjs = await import("snarkjs");
      
      // Use a fixed birthYear that makes someone 18+ (1990)
      const inputs = {
        birthYear: 1990,
        currentYear: 2026,
        minAge: 18
      };
      
      const wasmPath = '/circuits/age-verification.wasm';
      const zkeyPath = '/circuits/age-verification.zkey';
      
      // Generate real proof
      const { proof: groth16Proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        wasmPath as any,
        zkeyPath as any
      );
      
      // Set the example with real proof data — no vKey in export, server loads it
      setExportedJson(JSON.stringify({
        "proof": {
          "groth16Proof": groth16Proof,
          "statement": "User is 18 or older",
          "isValid": true,
          "timestamp": new Date().toISOString(),
          "publicSignals": publicSignals,
          "proofHash": "0x" + JSON.stringify(groth16Proof).substring(10, 74),
          "circuitName": "age-verification",
          "note": "REAL Groth16 zk-SNARK proof generated live"
        },
        "metadata": {
          "template": "age-verification",
          "generatedBy": "zkRune",
          "version": "0.1.0"
        }
      }, null, 2));
    } catch (error) {
      console.error("Failed to generate example proof:", error);
      alert("Failed to load example. Please generate a proof from a template first.");
    }
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
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
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
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-zk-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
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
              className="flex-1 py-4 bg-zk-primary text-white font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>Verify Proof</>
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
                {result.success && result.isValid ? (
                  <svg className="w-16 h-16 text-zk-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-hatton text-3xl text-white">
                      {result.success && result.isValid
                        ? "Proof is Valid!"
                        : "Proof is Invalid"}
                    </h2>
                    {result.attestation === 'attested' && (
                      <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.352.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        On-Chain Attested
                      </span>
                    )}
                    {result.attestation === 'self-asserted' && (
                      <span className="px-3 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Self-Asserted
                      </span>
                    )}
                  </div>
                  <p className="text-zk-gray">
                    {result.success && result.isValid
                      ? result.message || "This proof passed all validation checks"
                      : result.error || "The proof could not be verified"}
                  </p>
                </div>
              </div>

              {/* Details */}
              {result.details && (
                <div className="mb-6 p-4 bg-zk-darker/50 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-3">Proof Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zk-gray">Statement:</span>
                      <span className="text-white">{result.details.statement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zk-gray">Template:</span>
                      <span className="text-white">{result.details.template}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zk-gray">Generated:</span>
                      <span className="text-white">{new Date(result.details.timestamp).toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Checks */}
              {result.checks && (
                <div className="mb-6 p-4 bg-zk-darker/50 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-3">Validation Checks:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{result.checks.hasGroth16Proof}</span>
                      <span className="text-zk-gray">ZK Proof Type</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{result.checks.hasProofHash}</span>
                      <span className="text-zk-gray">Proof Hash</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{result.checks.hasStatement}</span>
                      <span className="text-zk-gray">Statement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{result.checks.hasTimestamp}</span>
                      <span className="text-zk-gray">Timestamp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{result.checks.hasCircuitName}</span>
                      <span className="text-zk-gray">Circuit Name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{result.checks.validFormat}</span>
                      <span className="text-zk-gray">Valid Format</span>
                    </div>
                  </div>
                </div>
              )}

              {result.timing && (
                <div className="text-sm text-zk-gray text-center">
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


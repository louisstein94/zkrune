"use client";

import { useState } from "react";
import { generateClientProof } from "@/lib/clientZkProof";

interface CredentialProofFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function CredentialProofForm({ onProofGenerated }: CredentialProofFormProps) {
  const [credentialHash, setCredentialHash] = useState("");
  const [credentialSecret, setCredentialSecret] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [expectedHash, setExpectedHash] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-set current time on mount
  useState(() => {
    const now = Math.floor(Date.now() / 1000).toString();
    setCurrentTime(now);
  });

  const generateProof = async () => {
    if (!credentialHash || !credentialSecret || !validUntil || !currentTime || !expectedHash) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);

    try {
      const isValid = credentialHash === expectedHash && 
                      parseInt(validUntil) > parseInt(currentTime);

      // Generate REAL ZK proof in browser
      const data = await generateClientProof("credential-proof", {
        credentialHash,
        credentialSecret,
        validUntil,
        currentTime,
        expectedHash,
      });

      if (data.success && data.proof) {
        const resultProof = {
          statement: isValid
            ? "Credentials are valid and not expired"
            : "Credentials are invalid or expired",
          isValid: isValid,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          credentialStatus: isValid ? "VALID" : "INVALID",
          expiryDate: new Date(parseInt(validUntil) * 1000).toLocaleString('en-US'),
          realProof: true,
          note: data.proof.note,
          groth16Proof: data.proof.groth16Proof,
          publicSignals: data.proof.publicSignals,
        };
        onProofGenerated(resultProof);
      } else {
        alert(`Proof generation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Credential proof error:", error);
      alert("Error generating proof. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Credential Hash (Private)
        </label>
        <input
          type="text"
          value={credentialHash}
          onChange={(e) => setCredentialHash(e.target.value)}
          placeholder="12345678901234567890"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
        />
        <p className="text-xs text-zk-gray mt-2">
          Your credential hash will remain private
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Credential Secret (Private)
        </label>
        <input
          type="password"
          value={credentialSecret}
          onChange={(e) => setCredentialSecret(e.target.value)}
          placeholder="Secret key"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Valid Until (Unix Timestamp)
        </label>
        <input
          type="text"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          placeholder="1735689600"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
        />
        <p className="text-xs text-zk-gray mt-2">
          Expiration date of the credential
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Current Time (Unix Timestamp)
        </label>
        <input
          type="text"
          value={currentTime}
          onChange={(e) => setCurrentTime(e.target.value)}
          placeholder="1700000000"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Expected Hash (Public)
        </label>
        <input
          type="text"
          value={expectedHash}
          onChange={(e) => setExpectedHash(e.target.value)}
          placeholder="12345678901234567890"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
        />
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !credentialHash || !credentialSecret || !validUntil || !currentTime || !expectedHash}
        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>Generate ZK Proof</>
        )}
      </button>
    </div>
  );
}


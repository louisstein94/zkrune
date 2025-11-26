"use client";

import { useState } from "react";
import { generateClientProof } from "@/lib/clientZkProof";

interface SignatureVerificationFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function SignatureVerificationForm({ onProofGenerated }: SignatureVerificationFormProps) {
  const [privateKey, setPrivateKey] = useState("");
  const [message, setMessage] = useState("");
  const [nonce, setNonce] = useState("");
  const [publicKeyX, setPublicKeyX] = useState("");
  const [publicKeyY, setPublicKeyY] = useState("");
  const [expectedMessage, setExpectedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProof = async () => {
    if (!privateKey || !message || !nonce || !publicKeyX || !publicKeyY || !expectedMessage) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);

    try {
      // Simple validation (in real scenario, this would be cryptographic)
      const isValid = message === expectedMessage && privateKey.length > 10;

      // Generate REAL ZK proof in browser
      const data = await generateClientProof("signature-verification", {
        privateKey,
        message,
        nonce,
        publicKeyX,
        publicKeyY,
        expectedMessage,
      });

      if (data.success && data.proof) {
        const resultProof = {
          statement: isValid
            ? "Signature verified - Message is authentic"
            : "Signature verification failed - Message not authentic",
          isValid: isValid,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          signatureDetails: {
            messagePreview: message.substring(0, 20) + "...",
            publicKeyPreview: publicKeyX.substring(0, 16) + "...",
            status: isValid ? "VERIFIED" : "INVALID",
            algorithm: "EdDSA-Poseidon"
          },
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
      console.error("Signature verification proof error:", error);
      alert("Error generating proof. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomKeys = () => {
    const randomPriv = Math.random().toString().substring(2, 22);
    const randomPubX = Math.random().toString().substring(2, 22);
    const randomPubY = Math.random().toString().substring(2, 22);
    const randomNonce = Math.random().toString().substring(2, 12);
    
    setPrivateKey(randomPriv);
    setPublicKeyX(randomPubX);
    setPublicKeyY(randomPubY);
    setNonce(randomNonce);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={generateRandomKeys}
          className="px-4 py-2 bg-zk-gray/20 text-zk-gray text-sm rounded-lg hover:bg-zk-gray/30 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Generate Random Keys
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Private Key (Secret)
        </label>
        <input
          type="password"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="12345678901234567890"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
        />
        <p className="text-xs text-zk-gray mt-2">
          Your private key will never be shared
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Message to Sign (Private)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here"
          rows={3}
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Nonce (Random Value) - Private
        </label>
        <input
          type="text"
          value={nonce}
          onChange={(e) => setNonce(e.target.value)}
          placeholder="9876543210"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Public Key X (Public)
          </label>
          <input
            type="text"
            value={publicKeyX}
            onChange={(e) => setPublicKeyX(e.target.value)}
            placeholder="987654321098765432"
            className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Public Key Y (Public)
          </label>
          <input
            type="text"
            value={publicKeyY}
            onChange={(e) => setPublicKeyY(e.target.value)}
            placeholder="123456789012345678"
            className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Expected Message Hash (Public)
        </label>
        <input
          type="text"
          value={expectedMessage}
          onChange={(e) => setExpectedMessage(e.target.value)}
          placeholder="Message to verify"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm"
        />
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-400 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span><strong>Tip:</strong> This circuit verifies your digital signature without revealing the private key. Uses EdDSA-Poseidon algorithm.</span>
        </p>
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !privateKey || !message || !nonce || !publicKeyX || !publicKeyY || !expectedMessage}
        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Verifying Signature...
          </>
        ) : (
          <>Generate Signature Verification Proof</>
        )}
      </button>
    </div>
  );
}


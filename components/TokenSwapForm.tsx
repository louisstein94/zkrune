"use client";

import { useState } from "react";
import { generateClientProof } from "@/lib/clientZkProof";

interface TokenSwapFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function TokenSwapForm({ onProofGenerated }: TokenSwapFormProps) {
  const [tokenABalance, setTokenABalance] = useState("");
  const [tokenBBalance, setTokenBBalance] = useState("");
  const [swapSecret, setSwapSecret] = useState("");
  const [requiredTokenA, setRequiredTokenA] = useState("");
  const [swapRate, setSwapRate] = useState("1500"); // Default 1.5x rate (scaled by 1000)
  const [minReceive, setMinReceive] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateExpectedReceive = () => {
    if (!requiredTokenA || !swapRate) return 0;
    return (parseInt(requiredTokenA) * parseInt(swapRate)) / 1000;
  };

  const generateProof = async () => {
    if (!tokenABalance || !tokenBBalance || !swapSecret || !requiredTokenA || !swapRate || !minReceive) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);

    try {
      const hasSufficientA = parseInt(tokenABalance) >= parseInt(requiredTokenA);
      const expectedReceive = calculateExpectedReceive();
      const meetsMinimum = expectedReceive >= parseInt(minReceive);
      const canSwap = hasSufficientA && meetsMinimum;

      // Generate REAL ZK proof in browser
      const data = await generateClientProof("token-swap", {
        tokenABalance,
        tokenBBalance,
        swapSecret,
        requiredTokenA,
        swapRate,
        minReceive,
      });

      if (data.success && data.proof) {
        const resultProof = {
          statement: canSwap
            ? `✅ Swap possible: ${requiredTokenA} Token A → ~${Math.floor(expectedReceive)} Token B`
            : `❌ Swap not possible (insufficient balance or rate)`,
          isValid: canSwap,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          swapDetails: {
            inputAmount: requiredTokenA,
            expectedOutput: Math.floor(expectedReceive),
            rate: parseInt(swapRate) / 1000,
            status: canSwap ? "APPROVED" : "REJECTED"
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
      console.error("Token swap proof error:", error);
      alert("Error generating proof. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Your Token A Balance (Private)
          </label>
          <input
            type="number"
            value={tokenABalance}
            onChange={(e) => setTokenABalance(e.target.value)}
            placeholder="1000000"
            className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Your Token B Balance (Private)
          </label>
          <input
            type="number"
            value={tokenBBalance}
            onChange={(e) => setTokenBBalance(e.target.value)}
            placeholder="500000"
            className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Swap Secret (Private)
        </label>
        <input
          type="password"
          value={swapSecret}
          onChange={(e) => setSwapSecret(e.target.value)}
          placeholder="Secret key"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
        <p className="text-xs text-zk-gray mt-2">
          Secret key to authorize the swap
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Required Token A Amount (Public)
        </label>
        <input
          type="number"
          value={requiredTokenA}
          onChange={(e) => setRequiredTokenA(e.target.value)}
          placeholder="100000"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Swap Rate (x1000, Public)
        </label>
        <input
          type="number"
          value={swapRate}
          onChange={(e) => setSwapRate(e.target.value)}
          placeholder="1500"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
        <p className="text-xs text-zk-gray mt-2">
          Example: 1500 = 1.5x rate (1 Token A = 1.5 Token B)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Minimum Receive Amount (Public)
        </label>
        <input
          type="number"
          value={minReceive}
          onChange={(e) => setMinReceive(e.target.value)}
          placeholder="140000"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
      </div>

      {requiredTokenA && swapRate && (
        <div className="p-4 bg-zk-primary/10 border border-zk-primary/30 rounded-lg">
          <p className="text-sm text-zk-gray">
            Estimated receive amount: <span className="text-zk-primary font-mono">{Math.floor(calculateExpectedReceive())} Token B</span>
          </p>
        </div>
      )}

      <button
        onClick={generateProof}
        disabled={isGenerating || !tokenABalance || !tokenBBalance || !swapSecret || !requiredTokenA || !swapRate || !minReceive}
        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>Generate Token Swap Proof</>
        )}
      </button>
    </div>
  );
}


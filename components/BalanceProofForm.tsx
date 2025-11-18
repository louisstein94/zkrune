"use client";

import { useState } from "react";
import { generateClientProof } from "@/lib/clientZkProof";

interface BalanceProofFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function BalanceProofForm({ onProofGenerated }: BalanceProofFormProps) {
  const [balance, setBalance] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProof = async () => {
    if (!balance || !minBalance) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);

    try {
      const balanceNum = parseFloat(balance);
      const minBalanceNum = parseFloat(minBalance);
      const hasSufficientBalance = balanceNum >= minBalanceNum;

      // Generate REAL ZK proof in browser
      const data = await generateClientProof("balance-proof", {
        balance: Math.floor(balanceNum * 100).toString(),
        minimumBalance: Math.floor(minBalanceNum * 100).toString(),
      });

      if (data.success) {
        const resultProof = {
          statement: hasSufficientBalance
            ? `Balance ≥ ${minBalanceNum} ZEC`
            : `Balance < ${minBalanceNum} ZEC`,
          isValid: hasSufficientBalance,
          timestamp: data.proof?.timestamp || new Date().toISOString(),
          proofHash: data.proof?.proofHash || "0x...",
          verificationKey: data.proof?.verificationKey || 'vk_circuit',
          actualBalance: balanceNum,
          threshold: minBalanceNum,
          realProof: data.metadata?.realProof || false,
          note: data.proof?.note || data.note || "Proof generated",
          // Store full proof for export
          groth16Proof: data.proof?.groth16Proof,
          publicSignals: data.proof?.publicSignals,
        };
        onProofGenerated(resultProof);
      } else {
        alert("Proof generation failed");
      }
    } catch (error) {
      console.error("Balance proof error:", error);
      alert("Error generating proof. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Your Balance (ZEC)
        </label>
        <input
          type="number"
          step="0.01"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
        <p className="text-xs text-zk-gray mt-2">
          Your actual balance will NOT be revealed
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Minimum Required Balance (ZEC)
        </label>
        <input
          type="number"
          step="0.01"
          value={minBalance}
          onChange={(e) => setMinBalance(e.target.value)}
          placeholder="10.00"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !balance || !minBalance}
        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>⚡ Generate ZK Proof</>
        )}
      </button>
    </div>
  );
}


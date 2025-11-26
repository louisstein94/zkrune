"use client";

import { useState } from "react";
import { generateClientProof } from "@/lib/clientZkProof";

interface BalanceProofFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function BalanceProofForm({ onProofGenerated }: BalanceProofFormProps) {
  const [zcashAddress, setZcashAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [balanceFetched, setBalanceFetched] = useState(false);

  // Fetch real Zcash balance from blockchain
  const fetchZcashBalance = async () => {
    if (!zcashAddress.trim()) {
      alert("Please enter a Zcash address");
      return;
    }

    // Basic validation
    if (!zcashAddress.startsWith('t') && !zcashAddress.startsWith('z')) {
      alert("Invalid Zcash address. Must start with 't' (transparent) or 'z' (shielded)");
      return;
    }

    setIsFetchingBalance(true);
    setBalanceFetched(false);
    
    try {
      // Call Zcash explorer API via our Next.js API route
      const response = await fetch(
        `/api/zcash-balance?address=${encodeURIComponent(zcashAddress)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data = await response.json();
      
      if (data.success && data.balance !== undefined) {
        const balanceInZEC = data.balance;
        
        setBalance(balanceInZEC.toFixed(8));
        setBalanceFetched(true);
        
        const message = data.source === 'demo' 
          ? `Demo Balance: ${balanceInZEC.toFixed(8)} ZEC\n\n${data.note || 'Demo mode'}\n\nAddress: ${zcashAddress.substring(0, 10)}...`
          : `Real balance fetched from Zcash blockchain!\n\nBalance: ${balanceInZEC.toFixed(8)} ZEC\nSource: ${data.source}\nAddress: ${zcashAddress.substring(0, 10)}...\n\nLive data from ${data.source}`;
        
        alert(message);
      } else {
        throw new Error(data.error || "Failed to fetch balance");
      }
    } catch (error) {
      console.error("Zcash balance fetch error:", error);
      alert("Failed to fetch balance. Please check your address or enter manually.");
      setBalanceFetched(false);
    } finally {
      setIsFetchingBalance(false);
    }
  };

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

      if (data.success && data.proof) {
        const resultProof = {
          statement: hasSufficientBalance
            ? `Balance ≥ ${minBalanceNum} ZEC`
            : `Balance < ${minBalanceNum} ZEC`,
          isValid: hasSufficientBalance,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          actualBalance: balanceNum,
          threshold: minBalanceNum,
          realProof: true,
          zcashIntegration: balanceFetched,
          zcashAddress: balanceFetched ? zcashAddress : undefined,
          note: balanceFetched 
            ? `Real Zcash balance proof - Fetched from blockchain (${zcashAddress.substring(0,10)}...). ${data.proof.note}`
            : data.proof.note,
          groth16Proof: data.proof.groth16Proof,
          publicSignals: data.proof.publicSignals,
        };
        onProofGenerated(resultProof);
      } else {
        alert(`Proof generation failed: ${data.error || 'Unknown error'}`);
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
      {/* Zcash Address Input - REAL INTEGRATION */}
      <div className="bg-gradient-to-r from-[#F4B728]/10 to-zk-dark/30 border border-[#F4B728]/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <img src="/zcash-logo.png" alt="Zcash" className="w-5 h-5" />
          <label className="text-sm font-bold text-[#F4B728] uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Real Zcash Blockchain Integration
          </label>
        </div>
        
        <input
          type="text"
          value={zcashAddress}
          onChange={(e) => {
            setZcashAddress(e.target.value);
            setBalanceFetched(false);
          }}
          placeholder="t1abc... or z1xyz... (Zcash address)"
          className="w-full px-4 py-3 bg-zk-darker border border-[#F4B728]/30 rounded-lg text-white focus:border-[#F4B728] focus:outline-none transition-colors font-mono text-sm mb-3"
        />
        
        <button
          onClick={fetchZcashBalance}
          disabled={isFetchingBalance || !zcashAddress.trim()}
          className="w-full py-3 bg-[#F4B728]/20 border border-[#F4B728]/50 text-[#F4B728] font-medium rounded-lg hover:bg-[#F4B728]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isFetchingBalance ? (
            <>
              <div className="w-4 h-4 border-2 border-[#F4B728]/30 border-t-[#F4B728] rounded-full animate-spin" />
              Fetching from Zcash Blockchain...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Fetch My Real ZEC Balance
            </>
          )}
        </button>
        
        <p className="text-xs text-[#F4B728]/70 mt-2 flex items-start gap-1">
          <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Real-time Zcash balance from Crypto APIs (enterprise blockchain data)</span>
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-zk-gray">
            Your Balance (ZEC)
          </label>
          {balanceFetched && (
            <span className="text-xs px-2 py-1 bg-[#F4B728]/20 text-[#F4B728] rounded-full border border-[#F4B728]/30 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Real Balance
            </span>
          )}
        </div>
        <input
          type="number"
          step="0.00000001"
          value={balance}
          onChange={(e) => {
            setBalance(e.target.value);
            if (balanceFetched) setBalanceFetched(false);
          }}
          placeholder="0.00000000"
          disabled={isFetchingBalance}
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors disabled:opacity-50"
        />
        <p className="text-xs text-zk-gray mt-2 flex items-start gap-1.5">
          {balanceFetched ? (
            <>
              <svg className="w-4 h-4 text-[#F4B728] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fetched from Zcash blockchain - Your exact amount stays private in the proof</span>
            </>
          ) : (
            <span>Your actual balance will NOT be revealed in the proof</span>
          )}
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
          <>Generate ZK Proof</>
        )}
      </button>
    </div>
  );
}


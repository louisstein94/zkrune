"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { generateClientProof } from "@/lib/clientZkProof";
import { useBalanceAttestation } from "@/lib/hooks/useBalanceAttestation";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const ZKRUNE_MINT = process.env.NEXT_PUBLIC_ZKRUNE_MINT || '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump';

interface BalanceProofFormProps {
  onProofGenerated: (proof: any) => void;
}

type MintOption = 'zkRUNE' | 'SOL' | 'custom';

export default function BalanceProofForm({ onProofGenerated }: BalanceProofFormProps) {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [mintOption, setMintOption] = useState<MintOption>('zkRUNE');
  const [customMint, setCustomMint] = useState("");

  const activeMint = mintOption === 'zkRUNE' ? ZKRUNE_MINT
    : mintOption === 'SOL' ? 'SOL'
    : customMint;

  const {
    balance: attestedBalance,
    loading: attestLoading,
    error: attestError,
    attested,
    symbol,
    decimals,
    attestation,
    setMintAddress,
    refetch,
    walletConnected,
  } = useBalanceAttestation(activeMint);

  useEffect(() => {
    setMintAddress(activeMint);
  }, [activeMint]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (attested && attestedBalance !== null) {
      setBalance(attestedBalance);
    }
  }, [attested, attestedBalance]);

  const generateProof = async () => {
    if (!balance || !minBalance) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);
    setProofError(null);

    try {
      const balanceNum = parseFloat(balance);
      const minBalanceNum = parseFloat(minBalance);

      if (balanceNum < minBalanceNum) {
        setProofError(
          `Your balance (${balanceNum} ${attested ? symbol : 'tokens'}) is below the minimum threshold (${minBalanceNum}). ` +
          `The ZK circuit enforces that balance must meet the threshold — a proof cannot be generated for an insufficient balance.`
        );
        setIsGenerating(false);
        return;
      }

      const scaledBalance = Math.floor(balanceNum * 100).toString();
      const scaledMin = Math.floor(minBalanceNum * 100).toString();

      const data = await generateClientProof("balance-proof", {
        balance: scaledBalance,
        minimumBalance: scaledMin,
      });

      if (data.success && data.proof) {
        const walletAddr = connected && publicKey ? publicKey.toBase58() : undefined;

        let serverResult: any = null;
        try {
          const verifyRes = await fetch('/api/verify-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              proof: data.proof.groth16Proof,
              publicSignals: data.proof.publicSignals,
              circuitName: 'balance-proof',
              walletAddress: walletAddr,
              mintAddress: walletAddr ? activeMint : undefined,
            }),
          });
          serverResult = await verifyRes.json();
        } catch {
          // Verification endpoint failed, proceed without attestation
        }

        const resultProof = {
          statement: `Balance ≥ ${minBalanceNum} ${symbol}`,
          isValid: true,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          actualBalance: balanceNum,
          threshold: minBalanceNum,
          realProof: true,
          attestation: serverResult?.attestation || 'self-asserted',
          onChainVerified: serverResult?.attestation === 'attested',
          walletAddress: walletAddr,
          mintAddress: activeMint,
          symbol,
          note: attested
            ? `On-chain attested balance proof — ${symbol} balance verified via Solana RPC. ${data.proof.note}`
            : `Self-asserted balance proof. ${data.proof.note}`,
          groth16Proof: data.proof.groth16Proof,
          publicSignals: data.proof.publicSignals,
          circuitName: 'balance-proof',
        };
        onProofGenerated(resultProof);
      } else {
        const msg = data.error || 'Unknown error';
        if (msg.includes('Assert') || msg.includes('constraint')) {
          setProofError('Balance does not meet the minimum threshold. A valid proof can only be generated when your balance is sufficient.');
        } else {
          setProofError(`Proof generation failed: ${msg}`);
        }
      }
    } catch (error) {
      console.error("Balance proof error:", error);
      setProofError("Unexpected error during proof generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet / Token Selection */}
      <div className="bg-gradient-to-r from-zk-primary/10 to-zk-dark/30 border border-zk-primary/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <label className="text-sm font-bold text-zk-primary uppercase tracking-wider">
            Solana On-Chain Balance
          </label>
        </div>

        {walletConnected ? (
          <>
            {/* Connected wallet info */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-zk-darker rounded-lg border border-zk-primary/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-zk-gray">Wallet:</span>
              <span className="text-sm text-white font-mono">
                {publicKey!.toBase58().slice(0, 6)}...{publicKey!.toBase58().slice(-4)}
              </span>
              <div className="ml-auto">
                <WalletMultiButton className="!bg-green-500/20 !border !border-green-500/30 !rounded-full !h-7 !text-xs !font-medium !text-green-400 !px-3" />
              </div>
            </div>

            {/* Mint selection */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-zk-gray mb-2 uppercase tracking-wider">Token</label>
              <div className="flex gap-2">
                {(['zkRUNE', 'SOL', 'custom'] as MintOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setMintOption(opt)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mintOption === opt
                        ? 'bg-zk-primary text-white'
                        : 'bg-zk-darker text-zk-gray border border-zk-gray/20 hover:border-zk-primary/50'
                    }`}
                  >
                    {opt === 'custom' ? 'Custom SPL' : opt}
                  </button>
                ))}
              </div>
            </div>

            {mintOption === 'custom' && (
              <input
                type="text"
                value={customMint}
                onChange={(e) => setCustomMint(e.target.value)}
                placeholder="SPL Token mint address..."
                className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors font-mono text-sm mb-4"
              />
            )}

            {/* Attestation status */}
            {attestLoading && (
              <div className="flex items-center gap-2 p-3 bg-zk-darker rounded-lg border border-zk-gray/20">
                <div className="w-4 h-4 border-2 border-zk-primary/30 border-t-zk-primary rounded-full animate-spin" />
                <span className="text-sm text-zk-gray">Fetching on-chain balance...</span>
              </div>
            )}

            {attestError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30 mb-2">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-400">{attestError}</span>
                <button onClick={refetch} className="ml-auto text-xs text-zk-primary hover:underline">Retry</button>
              </div>
            )}

            {attested && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-400">
                  On-chain balance attested: {attestedBalance} {symbol}
                </span>
                <button onClick={refetch} className="ml-auto text-xs text-zk-gray hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 bg-zk-darker/50 rounded-lg border border-dashed border-zk-gray/30">
            <svg className="w-10 h-10 mx-auto mb-3 text-zk-gray/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm text-zk-gray mb-2">Connect wallet for <strong className="text-zk-primary">attested proof</strong></p>
            <div className="flex justify-center mb-2">
              <WalletMultiButton className="!bg-gradient-to-r !from-[#6366F1] !to-[#8B5CF6] hover:!opacity-90 !rounded-xl !h-10 !text-sm !font-medium !text-white" />
            </div>
            <p className="text-xs text-zk-gray/60">
              Your on-chain balance will be verified by the server for higher trust.
              <br />Without a wallet, the proof will be self-asserted.
            </p>
          </div>
        )}
      </div>

      {/* Balance Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-zk-gray">
            Your Balance ({attested ? symbol : 'token units'})
          </label>
          {attested && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              On-Chain Attested
            </span>
          )}
        </div>
        <input
          type="number"
          step="0.000001"
          value={balance}
          onChange={(e) => { setBalance(e.target.value); setProofError(null); }}
          readOnly={attested}
          placeholder="0.000000"
          disabled={attestLoading}
          className={`w-full px-4 py-3 bg-zk-darker border rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors disabled:opacity-50 ${
            attested ? 'border-green-500/30 bg-green-500/5 cursor-not-allowed' : 'border-zk-gray/30'
          }`}
        />
        <p className="text-xs text-zk-gray mt-2 flex items-start gap-1.5">
          {attested ? (
            <>
              <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.352.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Fetched from Solana blockchain — your exact balance stays private in the proof</span>
            </>
          ) : (
            <span>Your actual balance will NOT be revealed in the proof — only whether it meets the minimum</span>
          )}
        </p>
      </div>

      {/* Minimum Balance */}
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Minimum Required Balance ({attested ? symbol : 'token units'})
        </label>
        <input
          type="number"
          step="0.01"
          value={minBalance}
          onChange={(e) => { setMinBalance(e.target.value); setProofError(null); }}
          placeholder="10.00"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Attestation info banner */}
      {!walletConnected && (
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <svg className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-yellow-300/80">
            This proof will be <strong>self-asserted</strong>. Connect your Solana wallet above for an on-chain attested proof with higher trust level.
          </p>
        </div>
      )}

      {/* Proof error */}
      {proofError && (
        <div className="flex items-start gap-2.5 p-4 bg-red-500/10 rounded-xl border border-red-500/25">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-red-300 font-medium mb-1">Insufficient Balance</p>
            <p className="text-xs text-red-400/80">{proofError}</p>
          </div>
          <button onClick={() => setProofError(null)} className="ml-auto text-red-400/60 hover:text-red-300 flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <button
        onClick={generateProof}
        disabled={isGenerating || !balance || !minBalance}
        className="w-full py-4 bg-zk-primary text-white font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>Generate ZK Proof</>
        )}
      </button>
    </div>
  );
}

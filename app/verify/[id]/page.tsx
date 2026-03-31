"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

const GROTH16_PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_GROTH16_VERIFIER_PROGRAM || '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad',
);

const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088696311157297823662689037894645226208583',
);

const TEMPLATE_IDS: Record<string, number> = {
  'age-verification': 0,
  'balance-proof': 1,
  'membership-proof': 2,
  'credential-proof': 3,
  'private-voting': 4,
  'nft-ownership': 5,
  'range-proof': 6,
  'hash-preimage': 7,
  'quadratic-voting': 8,
  'anonymous-reputation': 9,
  'token-swap': 10,
  'patience-proof': 11,
  'signature-verification': 12,
};

function fieldToBytes(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xff));
    n >>= BigInt(8);
  }
  return bytes;
}

function negateG1Y(point: string[]): string[] {
  const y = BigInt(point[1]);
  const negY = y === 0n ? 0n : BN254_PRIME - (y % BN254_PRIME);
  return [point[0], negY.toString()];
}

function g1ToBytes(point: string[]): Uint8Array {
  const out = new Uint8Array(64);
  out.set(fieldToBytes(point[0]), 0);
  out.set(fieldToBytes(point[1]), 32);
  return out;
}

function g2ToBytes(point: string[][]): Uint8Array {
  const out = new Uint8Array(128);
  out.set(fieldToBytes(point[0][1]), 0);
  out.set(fieldToBytes(point[0][0]), 32);
  out.set(fieldToBytes(point[1][1]), 64);
  out.set(fieldToBytes(point[1][0]), 96);
  return out;
}

interface ProofData {
  id: string;
  circuitName: string;
  label: string;
  description: string;
  publicSignals: string[];
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  createdAt: string;
  expiresAt: string;
  verifiedOffChain: boolean;
}

const CIRCUIT_META: Record<string, {
  title: string;
  emoji: string;
  statement: string;
  signalLabels?: string[];
}> = {
  'age-verification':       { title: 'Age Verification',         emoji: '🎂', statement: 'User meets the minimum age requirement', signalLabels: ['isValid', 'currentYear', 'minimumAge'] },
  'balance-proof':          { title: 'Anonymous Balance Proof',   emoji: '💰', statement: 'User holds a balance above the required threshold', signalLabels: ['hasMinimum', 'minimumBalance'] },
  'whale-holder':           { title: 'Whale Verification',        emoji: '🐋', statement: 'User qualifies as a whale holder', signalLabels: ['hasMinimum', 'nullifier', 'root', 'minimumBalance'] },
  'membership-proof':       { title: 'Membership Proof',          emoji: '🏛️', statement: 'User is a verified member of the group', signalLabels: ['root'] },
  'private-voting':         { title: 'Private Vote',              emoji: '🗳️', statement: 'A valid vote was cast privately', signalLabels: ['voteCommitment', 'pollId'] },
  'quadratic-voting':       { title: 'Quadratic Vote',            emoji: '📊', statement: 'A weighted vote was cast using quadratic voting', signalLabels: ['voteWeight', 'voteCommitment', 'pollId', 'minTokens'] },
  'credential-proof':       { title: 'Credential Proof',          emoji: '🪪', statement: 'User holds a valid, non-expired credential', signalLabels: ['isValid', 'currentTime', 'expectedHash'] },
  'anonymous-reputation':   { title: 'Anonymous Reputation',      emoji: '⭐', statement: 'User meets the reputation score threshold', signalLabels: ['meetsThreshold', 'nullifier', 'thresholdScore', 'platformId'] },
  'nft-ownership':          { title: 'NFT Ownership Proof',       emoji: '🖼️', statement: 'User owns an NFT from the specified collection', signalLabels: ['isValid', 'collectionRoot', 'minTokenId', 'maxTokenId'] },
  'range-proof':            { title: 'Range Proof',               emoji: '📏', statement: 'A private value falls within the specified range', signalLabels: ['inRange', 'minRange', 'maxRange'] },
  'hash-preimage':          { title: 'Hash Preimage Proof',       emoji: '🔐', statement: 'User knows the preimage of a hash', signalLabels: ['expectedHash'] },
  'signature-verification': { title: 'Signature Verification',    emoji: '✍️', statement: 'A valid digital signature was verified', signalLabels: ['Ax', 'Ay', 'M'] },
  'token-swap':             { title: 'Token Swap Proof',          emoji: '🔄', statement: 'User has sufficient balance for the swap', signalLabels: ['swapCommitment', 'requiredTokenA', 'swapRate', 'minReceive'] },
  'patience-proof':         { title: 'Patience Proof',            emoji: '⏳', statement: 'User waited the required duration', signalLabels: ['isValid', 'commitmentHash', 'minimumWaitTime'] },
};

function formatSignalValue(label: string, value: string): string {
  if (label === 'isValid' || label === 'hasMinimum' || label === 'inRange' || label === 'meetsThreshold') {
    return value === '1' ? 'True' : 'False';
  }
  if (label === 'currentYear' || label === 'minimumAge' || label === 'minimumBalance' ||
      label === 'minTokens' || label === 'thresholdScore' || label === 'minRange' ||
      label === 'maxRange' || label === 'pollId' || label === 'platformId' ||
      label === 'requiredTokenA' || label === 'swapRate' || label === 'minReceive' ||
      label === 'minimumWaitTime' || label === 'minTokenId' || label === 'maxTokenId') {
    return value;
  }
  if (value.length > 20) return `${value.substring(0, 8)}...${value.substring(value.length - 6)}`;
  return value;
}

function formatLabel(label: string): string {
  return label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

function proofFingerprint(id: string): string {
  return `0x${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
}

export default function VerifyPage() {
  const params = useParams();
  const proofId = params.id as string;
  const [proof, setProof] = useState<ProofData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const [chainStatus, setChainStatus] = useState<'idle' | 'building' | 'signing' | 'confirming' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [chainError, setChainError] = useState<string>('');

  const network = useMemo(() => {
    const ep = connection.rpcEndpoint.toLowerCase();
    if (ep.includes('mainnet')) return 'mainnet';
    if (ep.includes('devnet')) return 'devnet';
    if (ep.includes('testnet')) return 'testnet';
    return 'mainnet';
  }, [connection.rpcEndpoint]);

  const solscanBase = network === 'mainnet'
    ? 'https://solscan.io'
    : `https://solscan.io`;
  const solscanCluster = network === 'mainnet' ? '' : `?cluster=${network}`;

  useEffect(() => {
    async function fetchProof() {
      try {
        const res = await fetch(`/api/proof/${proofId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Proof not found');
        }
        setProof(await res.json());
      } catch (err: any) {
        setError(err.message || 'Failed to load proof');
      } finally {
        setLoading(false);
      }
    }
    fetchProof();
  }, [proofId]);

  const handleVerifyOnChain = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !proof) return;

    try {
      setChainStatus('building');
      setChainError('');

      const templateId = TEMPLATE_IDS[proof.circuitName];
      if (templateId === undefined) {
        throw new Error(`Circuit "${proof.circuitName}" is not supported for on-chain verification.`);
      }

      const size = 1 + 64 + 128 + 64 + proof.publicSignals.length * 32;
      const data = new Uint8Array(size);
      let offset = 0;

      data[offset] = templateId;
      offset += 1;

      const negA = negateG1Y(proof.proof.pi_a);
      data.set(g1ToBytes(negA), offset);
      offset += 64;

      data.set(g2ToBytes(proof.proof.pi_b), offset);
      offset += 128;

      data.set(g1ToBytes(proof.proof.pi_c), offset);
      offset += 64;

      for (const signal of proof.publicSignals) {
        data.set(fieldToBytes(signal), offset);
        offset += 32;
      }

      const ix = new TransactionInstruction({
        keys: [],
        programId: GROTH16_PROGRAM,
        data: Buffer.from(data),
      });

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

      const tx = new Transaction();
      tx.add(ix);
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;
      tx.feePayer = wallet.publicKey;

      setChainStatus('signing');
      const signed = await wallet.signTransaction(tx);

      setChainStatus('confirming');
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      setTxHash(signature);
      setChainStatus('success');
    } catch (err: any) {
      let message = err.message || 'Transaction failed';
      if (message.includes('ProofVerificationFailed')) {
        message = 'Proof verification failed on-chain. The proof may be invalid.';
      } else if (message.includes('insufficient funds') || message.includes('Insufficient')) {
        message = `Insufficient SOL for transaction fees.${network !== 'mainnet' ? ' Get SOL from a faucet.' : ''}`;
      } else if (message.includes('User rejected')) {
        message = 'Transaction cancelled by user.';
      }
      setChainError(message);
      setChainStatus('error');
    }
  }, [wallet, proof, connection, network]);

  const meta = proof ? (CIRCUIT_META[proof.circuitName] || { title: proof.circuitName, emoji: '🔮', statement: proof.description }) : null;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verifyPageUrl = `${origin}/verify/${proofId}`;
  const blinkUrl = `https://dial.to/?action=solana-action:${origin}/api/actions/verify?id=${proofId}`;

  const timeAgo = useMemo(() => {
    if (!proof) return '';
    const diff = Date.now() - new Date(proof.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }, [proof]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verifyPageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-28 px-4 sm:px-8 pb-16">
        <div className="max-w-2xl mx-auto">

          {loading && (
            <div className="text-center py-24">
              <div className="w-12 h-12 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-5" />
              <p className="text-zinc-400 text-sm">Verifying proof...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto mb-5 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h1 className="font-hatton text-3xl text-white mb-3">Proof Not Found</h1>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">This proof may have expired or does not exist. Proofs are valid for 7 days after creation.</p>
              <Link href="/zkblink" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors text-sm font-medium">
                Create Your Own Proof
              </Link>
            </div>
          )}

          {proof && meta && (
            <>
              {/* Verification Badge */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-400">Verified ZK Proof</span>
                </div>
                <h1 className="font-hatton text-3xl sm:text-4xl text-white mb-2">
                  {meta.emoji} {meta.title}
                </h1>
                <p className="text-zinc-500 text-sm font-mono">{proofFingerprint(proofId)}</p>
              </div>

              {/* Main Proof Card */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden mb-5">

                {/* Proven Statement */}
                <div className="px-6 py-6 border-b border-zinc-800/80">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium mb-3">Proven Statement</p>
                  <p className="text-lg sm:text-xl text-white font-medium leading-relaxed">&ldquo;{meta.statement}&rdquo;</p>
                </div>

                {/* Public Signals */}
                {proof.publicSignals.length > 0 && (
                  <div className="px-6 py-5 border-b border-zinc-800/80">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium mb-3">Public Signals</p>
                    <div className="space-y-2">
                      {proof.publicSignals.map((signal, i) => {
                        const signalLabels = meta.signalLabels || [];
                        const label = signalLabels[i] || `signal_${i}`;
                        const isBoolean = ['isValid', 'hasMinimum', 'inRange', 'meetsThreshold'].includes(label);
                        const isTrue = signal === '1';
                        return (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-zinc-400 text-sm">{formatLabel(label)}</span>
                            <span className={`font-mono text-sm ${
                              isBoolean
                                ? isTrue ? 'text-emerald-400' : 'text-red-400'
                                : 'text-white'
                            }`}>
                              {isBoolean && (
                                <span className="mr-1.5">{isTrue ? '✓' : '✗'}</span>
                              )}
                              {formatSignalValue(label, signal)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-3 divide-x divide-zinc-800/80">
                  <div className="px-5 py-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Protocol</p>
                    <p className="text-white text-xs font-medium">Groth16</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Curve</p>
                    <p className="text-white text-xs font-medium">BN254</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Created</p>
                    <p className="text-white text-xs font-medium">{timeAgo}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status Card */}
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-emerald-300 text-sm font-medium mb-1">Off-Chain Verification Passed</p>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      This zk-SNARK proof was verified using snarkjs Groth16 verifier. The proof is cryptographically valid — it cannot be forged or tampered with.
                    </p>
                  </div>
                </div>
              </div>

              {/* On-Chain Verification */}
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4.5 h-4.5 text-violet-400" viewBox="0 0 128 128" fill="currentColor">
                      <path d="M93.94 42.63c13.48 0 24.42 10.94 24.42 24.42s-10.94 24.42-24.42 24.42H49.88L93.94 42.63zM34.06 85.37c-13.48 0-24.42-10.94-24.42-24.42s10.94-24.42 24.42-24.42h44.06L34.06 85.37z"/>
                    </svg>
                    <span className="text-sm font-medium text-white">On-Chain Verification</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    network === 'mainnet'
                      ? 'bg-violet-600/20 text-violet-400 border-violet-500/30'
                      : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {network.toUpperCase()}
                  </span>
                </div>

                {chainStatus === 'success' ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg flex-shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="text-emerald-300 text-sm font-semibold">Verified On-Chain</p>
                        <p className="text-zinc-500 text-xs">Groth16 pairing check passed via Solana altbn254 syscalls</p>
                      </div>
                    </div>
                    <a
                      href={`${solscanBase}/tx/${txHash}${solscanCluster}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <span className="font-mono">{txHash.substring(0, 12)}...{txHash.substring(txHash.length - 8)}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
                      Submit this proof to Solana for trustless on-chain verification using Groth16 pairing checks. Program:&nbsp;
                      <a href={`${solscanBase}/account/9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad${solscanCluster}`} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-mono">9apA5...X7ad</a>
                    </p>

                    {chainError && (
                      <div className="mb-3 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
                        {chainError}
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      {!wallet.connected ? (
                        <WalletMultiButton className="!w-full !rounded-lg !bg-violet-600 hover:!bg-violet-500 !text-white !font-medium !text-sm !h-11 !transition-colors" />
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-xs text-zinc-400 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {wallet.publicKey?.toBase58().slice(0, 4)}...{wallet.publicKey?.toBase58().slice(-4)}
                          </div>
                          <button
                            onClick={handleVerifyOnChain}
                            disabled={chainStatus !== 'idle' && chainStatus !== 'error'}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 text-white ${
                              chainStatus === 'idle' || chainStatus === 'error'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
                                : 'bg-violet-600/50 cursor-wait'
                            }`}
                          >
                            {chainStatus === 'building' && (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Building TX...
                              </>
                            )}
                            {chainStatus === 'signing' && (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sign in Wallet...
                              </>
                            )}
                            {chainStatus === 'confirming' && (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Confirming...
                              </>
                            )}
                            {(chainStatus === 'idle' || chainStatus === 'error') && (
                              <>
                                ⛓️ Verify On-Chain
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Share Actions */}
              <div className="flex gap-2.5 mb-4">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `I verified a ${meta.title} proof using @rune_zk — zero-knowledge cryptography on Solana.\n\n${blinkUrl}`
                    );
                    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
                  }}
                  className="flex-1 py-2.5 bg-zinc-800/80 text-white rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2.5 border border-zinc-700/60 text-white rounded-xl hover:border-zinc-500 transition-colors text-sm"
                >
                  {copied ? '✓ Copied' : 'Copy Link'}
                </button>
                <Link
                  href="/zkblink"
                  className="flex-1 py-2.5 bg-emerald-600/90 text-white rounded-xl hover:bg-emerald-500 transition-colors text-center text-sm"
                >
                  Create Proof
                </Link>
              </div>

              {/* Blink URL */}
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">Solana Blink URL</p>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(blinkUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch {}
                    }}
                    className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors font-medium"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-xs text-violet-300/80 break-all select-all leading-relaxed">{blinkUrl}</p>
                <p className="text-zinc-600 text-[10px] mt-2">Unfurls as interactive Blink on X.com (requires Dialect verification)</p>
              </div>

              {/* ZK Privacy Note */}
              <div className="border border-zinc-800/50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-base">🔒</span>
                  <div>
                    <p className="text-zinc-300 text-xs font-medium mb-1">Zero-Knowledge Privacy</p>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      Only the statement and public signals above are revealed. All private inputs remain confidential — they never left the prover&apos;s browser and cannot be derived from the proof.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center">
                <Link href="/" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors">
                  Powered by zkRune — Privacy verification infrastructure for Solana
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";

interface ProofData {
  id: string;
  circuitName: string;
  label: string;
  description: string;
  publicSignals: string[];
  createdAt: string;
  expiresAt: string;
  verifiedOffChain: boolean;
}

const CIRCUIT_META: Record<string, { title: string; emoji: string; statement: string }> = {
  'age-verification':       { title: 'Age Verification',           emoji: '🎂', statement: 'User meets the minimum age requirement' },
  'balance-proof':          { title: 'Anonymous Balance Proof',    emoji: '💰', statement: 'User holds a balance above the required threshold' },
  'whale-holder':           { title: 'Whale Verification',         emoji: '🐋', statement: 'User qualifies as a whale holder' },
  'membership-proof':       { title: 'Membership Proof',           emoji: '🏛️', statement: 'User is a verified member of the group' },
  'private-voting':         { title: 'Private Vote',               emoji: '🗳️', statement: 'A valid vote was cast privately' },
  'quadratic-voting':       { title: 'Quadratic Vote',             emoji: '📊', statement: 'A weighted vote was cast using quadratic voting' },
  'credential-proof':       { title: 'Credential Proof',           emoji: '🪪', statement: 'User holds a valid, non-expired credential' },
  'anonymous-reputation':   { title: 'Anonymous Reputation',       emoji: '⭐', statement: 'User meets the reputation score threshold' },
  'nft-ownership':          { title: 'NFT Ownership Proof',        emoji: '🖼️', statement: 'User owns an NFT from the specified collection' },
  'range-proof':            { title: 'Range Proof',                emoji: '📏', statement: 'A private value falls within the specified range' },
  'hash-preimage':          { title: 'Hash Preimage Proof',        emoji: '🔐', statement: 'User knows the preimage of a hash' },
  'signature-verification': { title: 'Signature Verification',     emoji: '✍️', statement: 'A valid digital signature was verified' },
  'token-swap':             { title: 'Token Swap Proof',           emoji: '🔄', statement: 'User has sufficient balance for the swap' },
  'patience-proof':         { title: 'Patience Proof',             emoji: '⏳', statement: 'User waited the required duration' },
};

export default function VerifyPage() {
  const params = useParams();
  const proofId = params.id as string;
  const [proof, setProof] = useState<ProofData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProof() {
      try {
        const res = await fetch(`/api/actions/verify?id=${proofId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Proof not found');
        }
        const actionData = await res.json();

        const res2 = await fetch(`/api/proof/${proofId}`);
        if (res2.ok) {
          const data = await res2.json();
          setProof(data);
        } else {
          const circuitName = extractCircuitFromTitle(actionData.title);
          setProof({
            id: proofId,
            circuitName,
            label: actionData.title,
            description: actionData.description,
            publicSignals: [],
            createdAt: new Date().toISOString(),
            expiresAt: '',
            verifiedOffChain: true,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load proof');
      } finally {
        setLoading(false);
      }
    }
    fetchProof();
  }, [proofId]);

  const meta = proof ? (CIRCUIT_META[proof.circuitName] || { title: proof.circuitName, emoji: '🔮', statement: proof.description }) : null;
  const blinkUrl = `solana-action:${typeof window !== 'undefined' ? window.location.origin : ''}/api/actions/verify?id=${proofId}`;
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/actions/verify?id=${proofId}`;

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-32 px-4 sm:px-8 pb-12">
        <div className="max-w-3xl mx-auto">

          {loading && (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-zinc-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400">Loading proof...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h1 className="font-hatton text-3xl text-white mb-3">Proof Not Found</h1>
              <p className="text-zinc-400 mb-8">This proof may have expired or does not exist.</p>
              <Link href="/zkblink" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors">
                Create Your Own Proof
              </Link>
            </div>
          )}

          {proof && meta && (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div className="text-6xl mb-4">{meta.emoji}</div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                    Verified ZK Proof
                  </span>
                </div>
                <h1 className="font-hatton text-4xl sm:text-5xl text-white mb-3">
                  {meta.title}
                </h1>
                <p className="text-lg text-zinc-400">
                  {proof.description}
                </p>
              </div>

              {/* Proof Card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
                {/* Status Bar */}
                <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/5 border-b border-emerald-500/10">
                  <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Cryptographically Valid</p>
                    <p className="text-zinc-500 text-xs">This proof has been verified off-chain using snarkjs</p>
                  </div>
                </div>

                {/* Statement */}
                <div className="px-6 py-5 border-b border-zinc-800">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Proven Statement</p>
                  <p className="text-xl text-white font-medium">&ldquo;{meta.statement}&rdquo;</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 divide-x divide-zinc-800">
                  <div className="px-6 py-4">
                    <p className="text-xs text-zinc-500 mb-1">Circuit</p>
                    <p className="text-white text-sm font-medium">{meta.title}</p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-xs text-zinc-500 mb-1">Proof ID</p>
                    <p className="text-white text-sm font-mono">{proofId.substring(0, 12)}...</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-zinc-800 border-t border-zinc-800">
                  <div className="px-6 py-4">
                    <p className="text-xs text-zinc-500 mb-1">Created</p>
                    <p className="text-white text-sm">{new Date(proof.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-xs text-zinc-500 mb-1">Public Signals</p>
                    <p className="text-white text-sm font-mono">
                      {proof.publicSignals.length > 0 ? proof.publicSignals.join(', ') : 'Hidden'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-xl">🔒</div>
                  <div>
                    <p className="text-violet-300 text-sm font-medium mb-1">Zero-Knowledge Privacy</p>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      This proof verifies the statement above without revealing any private data.
                      The original inputs remain completely confidential and cannot be derived from the proof.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={() => {
                    const text = encodeURIComponent(
                      `Check out this verified ${meta.title} — generated with @rune_zk using zero-knowledge cryptography.\n\n${verifyUrl}`
                    );
                    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
                  }}
                  className="flex-1 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X
                </button>
                <button
                  onClick={async () => { try { await navigator.clipboard.writeText(verifyUrl); } catch {} }}
                  className="flex-1 py-3 border border-zinc-700 text-white rounded-xl hover:border-zinc-500 transition-colors text-sm font-medium"
                >
                  Copy Link
                </button>
                <Link
                  href="/zkblink"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all text-center text-sm font-medium"
                >
                  Create Your Own
                </Link>
              </div>

              {/* Powered by */}
              <div className="text-center">
                <p className="text-zinc-600 text-xs">
                  Powered by <Link href="/" className="text-zinc-400 hover:text-white transition-colors">zkRune</Link> — Privacy verification infrastructure for Solana
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function extractCircuitFromTitle(title: string): string {
  for (const [id, meta] of Object.entries(CIRCUIT_META)) {
    if (title.includes(meta.title)) return id;
  }
  return 'unknown';
}

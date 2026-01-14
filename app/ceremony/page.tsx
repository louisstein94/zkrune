"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

interface Contribution {
  index: number;
  name: string;
  hash: string;
  timestamp: string;
}

interface CeremonyState {
  phase: "contribution" | "finalized";
  startedAt: string;
  finalizedAt?: string;
  contributions: Contribution[];
  circuits: string[];
  currentContributionIndex: number;
}

const CIRCUITS = [
  { id: "age-verification", name: "Age Verification", track: "Privacy Tooling" },
  { id: "anonymous-reputation", name: "Anonymous Reputation", track: "Privacy Tooling" },
  { id: "balance-proof", name: "Balance Proof", track: "Private Payments" },
  { id: "credential-proof", name: "Credential Proof", track: "Privacy Tooling" },
  { id: "hash-preimage", name: "Hash Preimage", track: "Open Track" },
  { id: "membership-proof", name: "Membership Proof", track: "Privacy Tooling" },
  { id: "nft-ownership", name: "NFT Ownership", track: "Private Payments" },
  { id: "patience-proof", name: "Patience Proof", track: "Privacy Tooling" },
  { id: "private-voting", name: "Private Voting", track: "Privacy Tooling" },
  { id: "quadratic-voting", name: "Quadratic Voting", track: "Privacy Tooling" },
  { id: "range-proof", name: "Range Proof", track: "Private Payments" },
  { id: "signature-verification", name: "Signature Verification", track: "Privacy Tooling" },
  { id: "token-swap", name: "Token Swap", track: "Private Payments" },
];

// Mock ceremony state for display - in production, fetch from API
const CEREMONY_STATE: CeremonyState = {
  phase: "contribution",
  startedAt: "2026-01-14T00:00:00Z",
  contributions: [
    { index: 1, name: "zkRune Core", hash: "a1b2c3d4e5f6789012345678901234567890abcd", timestamp: "2026-01-14T00:00:00Z" },
  ],
  circuits: CIRCUITS.map(c => c.id),
  currentContributionIndex: 1,
};

export default function CeremonyPage() {
  const [state, setState] = useState<CeremonyState>(CEREMONY_STATE);
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('./scripts/ceremony.sh contribute "Your Name"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTrackColor = (track: string) => {
    switch (track) {
      case "Private Payments": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Privacy Tooling": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-zk-dark text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {state.phase === "contribution" ? "Ceremony Active" : "Ceremony Finalized"}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                🔮 Trusted Setup Ceremony
              </span>
            </h1>
            
            <p className="text-xl text-zk-gray max-w-3xl mx-auto mb-8">
              Contribute to zkRune&apos;s security by participating in our multi-party computation ceremony.
              Your contribution adds entropy that makes the system cryptographically secure.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-zk-darker rounded-lg border border-white/10">
                <span className="text-zk-gray">Phase 1:</span>
                <span className="text-green-400">✓ Hermez PoT (54 contributors)</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zk-darker rounded-lg border border-white/10">
                <span className="text-zk-gray">Phase 2:</span>
                <span className="text-purple-400">{state.contributions.length} contributions</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-zk-darker rounded-lg border border-white/10">
                <span className="text-zk-gray">Circuits:</span>
                <span className="text-white">{CIRCUITS.length} total</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="py-20 bg-zk-darker/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How to Participate</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-zk-dark p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl mb-4">
                1️⃣
              </div>
              <h3 className="text-xl font-bold mb-2">Clone Repository</h3>
              <p className="text-zk-gray mb-4">Get the zkRune codebase and install dependencies.</p>
              <code className="block bg-black/50 p-3 rounded-lg text-sm text-purple-400 overflow-x-auto">
                git clone https://github.com/zkrune/zkrune.git && cd zkrune && npm i
              </code>
            </div>
            
            <div className="bg-zk-dark p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl mb-4">
                2️⃣
              </div>
              <h3 className="text-xl font-bold mb-2">Run Contribution</h3>
              <p className="text-zk-gray mb-4">Execute the ceremony script with your name.</p>
              <div className="relative">
                <code className="block bg-black/50 p-3 rounded-lg text-sm text-purple-400 pr-12 overflow-x-auto">
                  ./scripts/ceremony.sh contribute &quot;Your Name&quot;
                </code>
                <button
                  onClick={copyCommand}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded transition-colors"
                >
                  {copied ? "✓" : "📋"}
                </button>
              </div>
            </div>
            
            <div className="bg-zk-dark p-6 rounded-xl border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl mb-4">
                3️⃣
              </div>
              <h3 className="text-xl font-bold mb-2">Share Your Hash</h3>
              <p className="text-zk-gray mb-4">Post your contribution hash on social media.</p>
              <code className="block bg-black/50 p-3 rounded-lg text-sm text-purple-400 overflow-x-auto">
                &quot;I contributed to @zkRune ceremony! 🔮&quot;
              </code>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="https://github.com/louisstein94/zkrune/blob/main/CEREMONY.md"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
            >
              📖 Full Documentation
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contributors */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Contributors</h2>
          <p className="text-center text-zk-gray mb-12">
            Every contribution makes the ceremony more secure
          </p>
          
          <div className="bg-zk-darker rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zk-gray">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zk-gray">Contributor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zk-gray">Hash</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zk-gray">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {state.contributions.map((contrib, i) => (
                  <tr key={contrib.index} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-purple-400 font-mono">{contrib.index}</td>
                    <td className="px-6 py-4 font-semibold">{contrib.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-zk-gray">
                      {contrib.hash.slice(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-zk-gray">
                      {new Date(contrib.timestamp).toLocaleString('en-US', { timeZone: 'UTC' })}
                    </td>
                  </tr>
                ))}
                {state.contributions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zk-gray">
                      No contributions yet. Be the first! 🚀
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <p className="text-center text-sm text-zk-gray mt-4">
            Be the next contributor! Your entropy strengthens the ceremony.
          </p>
        </div>
      </section>

      {/* Circuits */}
      <section className="py-20 bg-zk-darker/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Circuits Included</h2>
          <p className="text-center text-zk-gray mb-12">
            All 13 zkRune circuits are part of this ceremony
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CIRCUITS.map((circuit) => (
              <div
                key={circuit.id}
                className="bg-zk-dark p-4 rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{circuit.name}</h3>
                    <code className="text-xs text-zk-gray">{circuit.id}</code>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded border ${getTrackColor(circuit.track)}`}>
                    {circuit.track}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Security Guarantees</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-500/10 to-transparent p-6 rounded-xl border border-green-500/20">
              <h3 className="text-xl font-bold text-green-400 mb-4">✅ What Makes This Secure</h3>
              <ul className="space-y-3 text-zk-gray">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Multi-party computation - no single point of failure
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Each contributor adds unique entropy
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Only ONE honest participant needed for security
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  All contributions are cryptographically verifiable
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Phase 1 uses audited Hermez Network ceremony
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/10 to-transparent p-6 rounded-xl border border-red-500/20">
              <h3 className="text-xl font-bold text-red-400 mb-4">⚠️ What If Someone Is Malicious?</h3>
              <ul className="space-y-3 text-zk-gray">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  A malicious contributor CANNOT break the ceremony
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  They can only add (possibly weak) entropy
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Weak entropy is harmlessly absorbed by honest contributions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  Tampering attempts are detected during verification
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  The protocol is mathematically proven secure
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-t from-purple-900/20 to-transparent">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Contribute?</h2>
          <p className="text-zk-gray mb-8">
            Your contribution takes about 2-5 minutes and helps secure zkRune for everyone.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
              </svg>
              Clone on GitHub
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors"
            >
              Explore Templates
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center text-zk-gray text-sm">
          <p>zkRune Trusted Setup Ceremony • Solana Privacy Hack 2026</p>
          <p className="mt-2">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            {" • "}
            <Link href="https://github.com/louisstein94/zkrune" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
            {" • "}
            <Link href="https://twitter.com/rune_zk" target="_blank" className="hover:text-white transition-colors">Twitter</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

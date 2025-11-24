"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function ZcashIntegrationPage() {
  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 pt-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-[#F4B728]/50 bg-[#F4B728]/10 rounded-full mb-6">
            <img src="/zcash-logo.png" alt="Zcash" className="w-6 h-6" />
            <span className="text-sm font-bold text-[#F4B728] uppercase tracking-wider">
              Zcash Integration
            </span>
          </div>
          
          <h1 className="font-hatton text-5xl md:text-6xl text-white mb-6">
            Built for the <span className="text-[#F4B728]">Zcash</span> Ecosystem
          </h1>
          
          <p className="text-xl text-zk-gray max-w-3xl mx-auto">
            zkRune leverages Zcash's battle-tested Groth16 zk-SNARK technology to bring 
            privacy-preserving proofs to everyone.
          </p>
        </div>

        {/* Zcash Technology Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-zk-dark/30 border border-[#F4B728]/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#F4B728]/20 rounded-xl">
                <svg className="w-6 h-6 text-[#F4B728]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="font-hatton text-2xl text-white">Groth16 zk-SNARKs</h2>
            </div>
            <p className="text-zk-gray mb-4">
              We use the same cryptographic proving system that powers Zcash's shielded transactions.
            </p>
            <ul className="space-y-2 text-sm text-zk-gray">
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Battle-tested since 2016</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Constant-size proofs (~200 bytes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Fast verification (~2ms)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Industry-standard security</span>
              </li>
            </ul>
          </div>

          <div className="bg-zk-dark/30 border border-[#F4B728]/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#F4B728]/20 rounded-xl">
                <svg className="w-6 h-6 text-[#F4B728]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="font-hatton text-2xl text-white">Privacy Innovation</h2>
            </div>
            <p className="text-zk-gray mb-4">
              Extending Zcash's privacy capabilities to new use cases beyond transactions.
            </p>
            <ul className="space-y-2 text-sm text-zk-gray">
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Age verification without revealing birthdate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Balance proofs without exposing amounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Anonymous voting and governance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F4B728] mt-1">✓</span>
                <span>Private credential verification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Use Cases for Zcash */}
        <div className="mb-16">
          <h2 className="font-hatton text-4xl text-white mb-8 text-center">
            Zcash-Powered Use Cases
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Use Case 1 */}
            <div className="bg-gradient-to-br from-[#F4B728]/10 to-zk-dark/30 border border-[#F4B728]/30 rounded-xl p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Shielded Balance Proofs</h3>
              <p className="text-sm text-zk-gray mb-4">
                Prove you have sufficient ZEC balance without revealing the exact amount or transaction history.
              </p>
              <Link href="/templates/balance-proof" className="text-[#F4B728] text-sm font-medium hover:underline">
                Try Template →
              </Link>
            </div>

            {/* Use Case 2 */}
            <div className="bg-gradient-to-br from-[#F4B728]/10 to-zk-dark/30 border border-[#F4B728]/30 rounded-xl p-6">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold text-white mb-2">Private DAO Voting</h3>
              <p className="text-sm text-zk-gray mb-4">
                Enable anonymous governance for Zcash DAOs with cryptographic vote verification.
              </p>
              <Link href="/templates/private-voting" className="text-[#F4B728] text-sm font-medium hover:underline">
                Try Template →
              </Link>
            </div>

            {/* Use Case 3 */}
            <div className="bg-gradient-to-br from-[#F4B728]/10 to-zk-dark/30 border border-[#F4B728]/30 rounded-xl p-6">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-white mb-2">Anonymous Reputation</h3>
              <p className="text-sm text-zk-gray mb-4">
                Build reputation systems for Zcash ecosystem without compromising user privacy.
              </p>
              <Link href="/templates/anonymous-reputation" className="text-[#F4B728] text-sm font-medium hover:underline">
                Try Template →
              </Link>
            </div>

            {/* Use Case 4 */}
            <div className="bg-gradient-to-br from-[#F4B728]/10 to-zk-dark/30 border border-[#F4B728]/30 rounded-xl p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">Range Proofs</h3>
              <p className="text-sm text-zk-gray mb-4">
                Prove values are within acceptable ranges for Zcash DeFi applications.
              </p>
              <Link href="/templates/range-proof" className="text-[#F4B728] text-sm font-medium hover:underline">
                Try Template →
              </Link>
            </div>

            {/* Use Case 5 */}
            <div className="bg-gradient-to-br from-[#F4B728]/10 to-zk-dark/30 border border-[#F4B728]/30 rounded-xl p-6">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-white mb-2">Age Verification</h3>
              <p className="text-sm text-zk-gray mb-4">
                Prove you meet age requirements for Zcash services without revealing your birthdate.
              </p>
              <Link href="/templates/age-verification" className="text-[#F4B728] text-sm font-medium hover:underline">
                Try Template →
              </Link>
            </div>

            {/* Use Case 6 */}
            <div className="bg-gradient-to-br from-[#F4B728]/10 to-zk-dark/30 border border-[#F4B728]/30 rounded-xl p-6">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-white mb-2">Private Token Swaps</h3>
              <p className="text-sm text-zk-gray mb-4">
                Enable confidential DEX swaps with ZEC while maintaining full privacy.
              </p>
              <Link href="/templates/token-swap" className="text-[#F4B728] text-sm font-medium hover:underline">
                Try Template →
              </Link>
            </div>
          </div>
        </div>

        {/* Why Zcash Section */}
        <div className="bg-gradient-to-br from-[#F4B728]/5 to-zk-dark/30 border border-[#F4B728]/30 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="font-hatton text-3xl text-white mb-6 text-center">
            Why Zcash Technology?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-[#F4B728] mb-3">Battle-Tested Security</h3>
              <p className="text-zk-gray mb-4">
                Zcash has been securing billions of dollars in shielded transactions since 2016. 
                The Groth16 proving system has undergone extensive audits and real-world testing.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#F4B728] mb-3">Privacy-First Philosophy</h3>
              <p className="text-zk-gray mb-4">
                Zcash pioneered privacy-preserving cryptocurrency. zkRune extends this philosophy 
                to enable privacy-first applications beyond payments.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#F4B728] mb-3">Efficient Proofs</h3>
              <p className="text-zk-gray mb-4">
                Groth16 generates compact proofs (~200 bytes) that verify in milliseconds, 
                making it perfect for both on-chain and off-chain applications.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#F4B728] mb-3">Growing Ecosystem</h3>
              <p className="text-zk-gray mb-4">
                Join the Zcash ecosystem of privacy-focused developers building the future 
                of confidential computing and private DeFi.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-zk-dark/30 border border-[#F4B728]/20 rounded-2xl p-12">
          <h2 className="font-hatton text-3xl text-white mb-4">
            Start Building with Zcash Privacy
          </h2>
          <p className="text-xl text-zk-gray mb-8 max-w-2xl mx-auto">
            Generate your first zero-knowledge proof in under 60 seconds. 
            No cryptography expertise required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/templates"
              className="px-8 py-4 bg-[#F4B728] text-black font-bold rounded-full hover:bg-[#F4B728]/90 transition-all hover:scale-105 inline-block"
            >
              Browse Templates →
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 border border-[#F4B728]/30 text-[#F4B728] font-medium rounded-full hover:border-[#F4B728] hover:bg-[#F4B728]/10 transition-all inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


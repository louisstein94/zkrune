"use client";

import RuneAnimation from "@/components/RuneAnimation";
import Navigation from "@/components/Navigation";
import StructuredData from "@/components/StructuredData";
import { generateOrganizationSchema, generateSoftwareApplicationSchema } from "@/lib/seo";
import FAQ from "@/components/FAQ";
import CTAShowcase from "@/components/CTAShowcase";
import InteractiveHeroDemo from "@/components/InteractiveHeroDemo";
import TrustBadges from "@/components/TrustBadges";
import TokenStatsBanner from "@/components/TokenStatsBanner";

export default function Home() {

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={[
        generateOrganizationSchema(),
        generateSoftwareApplicationSchema(),
      ]} />
      
    <main id="home" className="relative min-h-screen bg-zk-darker overflow-hidden">
      {/* Navigation */}
      <Navigation />
      
      {/* Noise Texture */}
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      {/* Gradient Orb Background */}
      <div className="absolute top-0 right-0 w-[60%] h-full overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-secondary/15 blur-[120px] animate-breathe" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-primary/8 blur-[100px]" />
      </div>


      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-16 py-20 pt-32 min-h-screen gap-12">
        {/* Left Side - Content */}
        <div className="max-w-2xl space-y-8 text-center lg:text-left">
          {/* Product Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
              <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
                Privacy Infrastructure
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-accent/40 bg-zk-accent/10 rounded-full backdrop-blur-sm">
              <span className="text-xs font-bold text-zk-accent uppercase tracking-wider">
                Groth16 ZK-SNARKs
              </span>
            </div>
            <a
              href="https://solscan.io/account/9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-zk-secondary/40 bg-zk-secondary/10 rounded-full backdrop-blur-sm hover:bg-zk-secondary/20 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-zk-secondary" />
              <span className="text-xs font-bold text-zk-secondary uppercase tracking-wider">
                Solana Mainnet Verified
              </span>
            </a>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h2 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
              Verify Without
              <br />
              <span className="text-zk-primary">Exposing</span>.
            </h2>
            <p className="text-lg md:text-xl text-zk-gray max-w-xl mx-auto lg:mx-0">
              Embeddable zero-knowledge verification for access, eligibility, and identity on <span className="text-zk-accent font-semibold">Solana</span>. Secrets never leave the device.
            </p>
            <p className="text-sm text-zk-primary/80 max-w-xl mx-auto lg:mx-0 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% client-side Groth16 proofs — no server, no data leakage
            </p>
          </div>

          {/* Enhanced Stats - Social Proof + Technical */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            <div className="group p-4 bg-zk-dark/40 border border-zk-gray/15 rounded-xl hover:border-zk-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="font-hatton text-3xl text-white">
                  0.44<span className="text-zk-primary">s</span>
                </p>
              </div>
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Avg Generation Time
              </p>
            </div>

            <div className="group p-4 bg-zk-dark/40 border border-zk-gray/15 rounded-xl hover:border-zk-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="font-hatton text-3xl text-white">
                  100<span className="text-zk-primary">%</span>
                </p>
              </div>
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Privacy Guarantee
              </p>
            </div>

            <div className="group p-4 bg-zk-dark/40 border border-zk-gray/15 rounded-xl hover:border-zk-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="font-hatton text-3xl text-white">
                  13<span className="text-zk-primary">/13</span>
                </p>
              </div>
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Real ZK Circuits
              </p>
            </div>

            <div className="group p-4 bg-zk-dark/40 border border-zk-gray/15 rounded-xl hover:border-zk-primary/30 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="font-hatton text-3xl text-white">
                  3.8<span className="text-zk-primary">K+</span>
                </p>
              </div>
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Proofs Generated
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <a
              href="/templates"
              className="px-8 py-4 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105 shadow-lg shadow-zk-primary/20 inline-block text-center"
            >
              Launch App →
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all inline-block text-center"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right Side - Interactive Demo + Rune Animation */}
        <div className="relative w-full lg:w-1/2 h-[400px] lg:h-[600px] flex flex-col items-center justify-center gap-8">
          <InteractiveHeroDemo />
          <p className="text-xs text-center text-zk-gray max-w-sm">
            Live demo: Watch how Zero-Knowledge Proofs protect your privacy
          </p>
        </div>
      </div>

      {/* Privacy-First Banner */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 md:p-12 bg-zk-dark/50 border border-zk-accent/20 rounded-3xl backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-zk-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-zk-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-hatton text-white mb-3">
                  Privacy Verification Infrastructure
                </h2>
                <p className="text-base md:text-lg text-zk-gray leading-relaxed mb-4">
                  Most verification systems require users to <strong className="text-white">hand over sensitive data</strong> — birthdates, wallet balances, credentials. Your data leaves your device and sits on someone else's server.
                </p>
                <p className="text-base md:text-lg text-white font-medium leading-relaxed">
                  zkRune proves claims in <span className="text-zk-primary font-bold">the user's browser</span>. Age, membership, balance thresholds — verified without exposing the underlying data. Ever.
                </p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-hatton text-zk-primary mb-1">13</p>
                <p className="text-xs md:text-sm text-zk-gray uppercase tracking-wider">Real Groth16 Circuits</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-hatton text-zk-primary mb-1">&lt;5s</p>
                <p className="text-xs md:text-sm text-zk-gray uppercase tracking-wider">Proof Generation</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-hatton text-zk-primary mb-1">0</p>
                <p className="text-xs md:text-sm text-zk-gray uppercase tracking-wider">Server Calls</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Layer Developer Funnel */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-hatton text-white mb-4">
              Prove with zkRune
            </h2>
            <p className="text-lg text-zk-gray max-w-2xl mx-auto">
              Three production-ready verification flows. Pick a claim, generate a proof, verify it — all client-side.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Claim 1: Age */}
            <a href="/templates/age-verification" className="group p-8 bg-zk-dark/40 border border-zk-primary/15 rounded-2xl hover:border-zk-primary/40 hover:bg-zk-dark/50 transition-all">
              <div className="w-16 h-16 bg-zk-primary/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-8 h-8 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-hatton text-white mb-3">
                Age Verification
              </h3>
              <p className="text-sm text-zk-gray leading-relaxed mb-4">
                Prove a user is 18+ without collecting their birthdate. Drop-in age gate for any app or community.
              </p>
              <p className="text-xs text-zk-primary font-medium">
                Try it now →
              </p>
            </a>

            {/* Claim 2: Membership */}
            <a href="/templates/membership-proof" className="group p-8 bg-zk-dark/40 border border-zk-accent/15 rounded-2xl hover:border-zk-accent/40 hover:bg-zk-dark/50 transition-all">
              <div className="w-16 h-16 bg-zk-accent/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-8 h-8 text-zk-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-hatton text-white mb-3">
                Membership Proof
              </h3>
              <p className="text-sm text-zk-gray leading-relaxed mb-4">
                Prove group membership without revealing identity. Gated communities, DAOs, and premium access.
              </p>
              <p className="text-xs text-zk-accent font-medium">
                Try it now →
              </p>
            </a>

            {/* Claim 3: Balance */}
            <a href="/templates/balance-proof" className="group p-8 bg-zk-dark/40 border border-zk-secondary/15 rounded-2xl hover:border-zk-secondary/40 hover:bg-zk-dark/50 transition-all">
              <div className="w-16 h-16 bg-zk-secondary/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <svg className="w-8 h-8 text-zk-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-hatton text-white mb-3">
                Balance Threshold
              </h3>
              <p className="text-sm text-zk-gray leading-relaxed mb-4">
                Prove a wallet holds at least X tokens without exposing the exact balance. Eligibility gates made private.
              </p>
              <p className="text-xs text-zk-secondary font-medium">
                Try it now →
              </p>
            </a>
          </div>

          {/* How It Works */}
          <div className="mt-12 p-6 bg-zk-darker/50 border border-white/5 rounded-2xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zk-primary/15 text-zk-primary font-hatton text-lg mb-3">1</div>
                <h4 className="text-sm font-bold text-white mb-2">User enters private data</h4>
                <p className="text-xs text-zk-gray">Birthdate, wallet balance, group secret — stays in their browser.</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zk-accent/15 text-zk-accent font-hatton text-lg mb-3">2</div>
                <h4 className="text-sm font-bold text-white mb-2">Proof generated client-side</h4>
                <p className="text-xs text-zk-gray">Groth16 zk-SNARK proves the claim without revealing the data.</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zk-secondary/15 text-zk-secondary font-hatton text-lg mb-3">3</div>
                <h4 className="text-sm font-bold text-white mb-2">Verifier checks the proof</h4>
                <p className="text-xs text-zk-gray">Your app or smart contract verifies in &lt;2ms. Grant or deny access.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* zkRune Token Utility */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zk-primary/10 border border-zk-primary/30 rounded-full mb-6">
              <span className="text-sm font-bold text-zk-primary uppercase tracking-wider">
                zkRUNE Token
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-hatton text-white mb-4">
              Real Utility, Real Value
            </h2>
            <p className="text-base text-zk-gray max-w-xl mx-auto">
              Governance, staking, marketplace access, and premium tiers — powered by a single token.
            </p>
          </div>

          <div className="mb-10">
            <TokenStatsBanner />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <a href="/governance" className="group p-6 bg-zk-dark/40 border border-zk-primary/15 rounded-2xl hover:border-zk-primary/40 hover:translate-y-[-2px] transition-all duration-300">
              <div className="w-12 h-12 bg-zk-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zk-primary/30 transition-colors">
                <svg className="w-6 h-6 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-hatton text-white mb-2">Governance</h3>
              <p className="text-xs text-zk-gray leading-relaxed">
                Vote on templates and protocol decisions with quadratic voting.
              </p>
            </a>

            <a href="/staking" className="group p-6 bg-zk-dark/40 border border-zk-secondary/15 rounded-2xl hover:border-zk-secondary/40 hover:translate-y-[-2px] transition-all duration-300">
              <div className="w-12 h-12 bg-zk-secondary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zk-secondary/30 transition-colors">
                <svg className="w-6 h-6 text-zk-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-hatton text-white mb-2">Staking</h3>
              <p className="text-xs text-zk-gray leading-relaxed">
                Up to 36% APY with 30-day to 1-year lock multipliers.
              </p>
            </a>

            <a href="/marketplace" className="group p-6 bg-zk-dark/40 border border-zk-primary/15 rounded-2xl hover:border-zk-primary/40 hover:translate-y-[-2px] transition-all duration-300">
              <div className="w-12 h-12 bg-zk-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zk-primary/30 transition-colors">
                <svg className="w-6 h-6 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-hatton text-white mb-2">Marketplace</h3>
              <p className="text-xs text-zk-gray leading-relaxed">
                Publish and sell custom circuits. Creators earn 95% of every sale.
              </p>
            </a>

            <a href="/premium" className="group p-6 bg-zk-dark/40 border border-zk-accent/15 rounded-2xl hover:border-zk-accent/40 hover:translate-y-[-2px] transition-all duration-300">
              <div className="w-12 h-12 bg-zk-accent/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zk-accent/30 transition-colors">
                <svg className="w-6 h-6 text-zk-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-hatton text-white mb-2">Premium</h3>
              <p className="text-xs text-zk-gray leading-relaxed">
                Burn tokens for unlimited proofs and white-label solutions.
              </p>
            </a>
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://solscan.io/token/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-zk-primary hover:text-zk-primary/80 transition-colors"
            >
              <span className="font-medium">View zkRUNE on Solscan</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <TrustBadges />

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA */}
      <CTAShowcase />

      {/* Tutorial Overlay removed for cleaner UX */}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 lg:px-16 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Tech Badge */}
          <div className="flex items-center gap-3 px-4 py-2 border border-zk-gray/20 bg-zk-dark/50 rounded-lg">
            <img src="/zcash-logo.png" alt="Zcash" className="w-6 h-6 opacity-70" />
            <div>
              <p className="text-xs font-bold text-zk-gray">Zcash Privacy</p>
              <p className="text-xs text-zk-gray/60">Technology Partner</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-12 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider opacity-60">
                Version
              </p>
              <p className="text-white">v1.2</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider opacity-60">
                Status
              </p>
              <p className="text-zk-primary">● All Systems Operational</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider opacity-60">
                Contract
              </p>
              <button
                onClick={() => {
                  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
                  navigator.clipboard.writeText(contractAddress);
                  alert('Contract address copied!');
                }}
                className="text-xs text-zk-accent font-mono hover:text-zk-primary transition-colors cursor-pointer"
                title="Click to copy"
              >
                {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.substring(0, 8)}...{process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.substring(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS.length - 5)}
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-zk-gray uppercase tracking-wider opacity-60 mb-1">Product</h4>
              <a href="/templates" className="text-zk-gray hover:text-zk-primary transition-colors">Templates</a>
              <a href="/install" className="text-zk-gray hover:text-zk-primary transition-colors">Install PWA</a>
              <a 
                href="https://github.com/louisstein94/zkrune/releases/download/v0.2.0-mobile/zkRune-v0.2.0-signed.apk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zk-secondary hover:text-zk-secondary/80 transition-colors font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Android APK
              </a>
              <a href="/zcash" className="text-zk-gray hover:text-zk-primary transition-colors">Zcash Integration</a>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-zk-gray uppercase tracking-wider opacity-60 mb-1">Resources</h4>
              <a href="/docs" className="text-zk-gray hover:text-zk-primary transition-colors">Documentation</a>
              <a href="/api-docs" className="text-zk-gray hover:text-zk-primary transition-colors">API Reference</a>
              <a href="/verify-proof" className="text-zk-gray hover:text-zk-primary transition-colors">Verify Proof</a>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-zk-gray uppercase tracking-wider opacity-60 mb-1">Community</h4>
              <a href="https://x.com/rune_zk" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
                Twitter
              </a>
              <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
                GitHub
              </a>
              <a href="https://x.com/legelsteinn" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
                Developer
              </a>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-zk-gray uppercase tracking-wider opacity-60 mb-1">Legal</h4>
              <a href="/terms" className="text-zk-gray hover:text-zk-primary transition-colors">
                Terms of Service
              </a>
              <a href="/privacy" className="text-zk-gray hover:text-zk-primary transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-zk-primary to-transparent" />
            <span className="text-xs text-zk-gray uppercase tracking-wider">Scroll</span>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}


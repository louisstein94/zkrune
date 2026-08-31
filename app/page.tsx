// Server Component — the contract-copy button is a small client island
// (see components/CopyContractAddress) so the rest of the page stays on
// the server render path for SEO + faster initial paint.

import Navigation from "@/components/Navigation";
import StructuredData from "@/components/StructuredData";
import { generateOrganizationSchema, generateSoftwareApplicationSchema } from "@/lib/seo";
import FAQ from "@/components/FAQ";
import CTAShowcase from "@/components/CTAShowcase";
import HeroLiveDemo from "@/components/HeroLiveDemo";
import TrustBadges from "@/components/TrustBadges";
import CopyContractAddress from "@/components/CopyContractAddress";

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
        <div className="max-w-2xl space-y-7 text-center lg:text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
              Zero-Knowledge Eligibility Infrastructure
            </span>
          </div>

          {/* Hero Text */}
          <div className="space-y-5">
            <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
              Private access to{" "}
              <span className="text-zk-primary">regulated markets</span>.
            </h1>
            <p className="text-lg md:text-xl text-zk-gray max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Prove age, membership, balance or an issuer-attested credential without handing over the data behind it. 14 production zero-knowledge circuits. SDK, widget, or hosted API.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-zk-gray/80 max-w-xl mx-auto lg:mx-0">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zk-secondary" />
                Mainnet on Solana · Ethereum · Sui · Base
              </span>
              <span className="hidden md:inline text-zk-gray/30">|</span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-zk-primary/80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Published trust model · Open source
              </span>
            </div>
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
                  14<span className="text-zk-primary">/14</span>
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
              <p className="text-[10px] text-zk-gray/50 mt-1">Testnet & Mainnet</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <a
              href="/docs"
              className="px-8 py-4 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105 shadow-lg shadow-zk-primary/20 inline-block text-center"
            >
              Start building →
            </a>
            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all inline-block text-center"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* Right Side - Live Demo */}
        <div className="relative w-full lg:w-1/2 flex items-center justify-center">
          <HeroLiveDemo />
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
                <p className="text-3xl md:text-4xl font-hatton text-zk-primary mb-1">14</p>
                <p className="text-xs md:text-sm text-zk-gray uppercase tracking-wider">Production Circuits</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-hatton text-zk-primary mb-1">&lt;5s</p>
                <p className="text-xs md:text-sm text-zk-gray uppercase tracking-wider">Proof Generation</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-hatton text-zk-primary mb-1">0</p>
                <p className="text-xs md:text-sm text-zk-gray uppercase tracking-wider">PII Retained</p>
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
              Production verification patterns
            </h2>
            <p className="text-lg text-zk-gray max-w-2xl mx-auto">
              Three ready-to-integrate flows from our 14-circuit library. Pick a claim, generate a proof, verify it — all client-side.
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

          {/* Private RWA Access — the compliance surface, not just another template */}
          <a
            href="/rwa"
            className="group mt-8 block p-8 bg-gradient-to-br from-zk-primary/10 to-purple-500/10 border border-zk-primary/25 rounded-2xl hover:border-zk-primary/50 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <p className="text-xs font-bold text-zk-primary uppercase tracking-wider mb-3">
                  Private RWA Access
                </p>
                <h3 className="text-2xl font-hatton text-white mb-3">
                  Eligibility for regulated offerings
                </h3>
                <p className="text-sm text-zk-gray leading-relaxed max-w-2xl">
                  An offering checks that an investor is accredited and in a jurisdiction it
                  serves, and learns neither. Afterwards a regulator can re-verify that every
                  admission met the stated policy — still without learning who was admitted.
                </p>
              </div>
              <span className="text-sm text-zk-primary font-medium whitespace-nowrap group-hover:translate-x-1 transition-transform">
                Run the demo &rarr;
              </span>
            </div>
          </a>

          {/* See All Templates Link */}
          <div className="mt-8 text-center">
            <a
              href="/templates"
              className="inline-flex items-center gap-2 text-sm text-zk-primary hover:text-zk-primary/80 transition-colors font-medium"
            >
              See all 14 circuits
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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

          {/* SDK Quick Start */}
          <div className="mt-12 p-6 bg-zk-dark/40 border border-zk-primary/15 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-zk-primary/15 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Integrate in 5 lines</h4>
            </div>
            <pre className="text-sm text-zk-gray bg-zk-darker/80 rounded-xl p-5 overflow-x-auto font-mono leading-relaxed">
              <code>{`npm install zkrune-sdk

import { ZkRune } from 'zkrune-sdk';

const zk = new ZkRune();
const { proof, publicSignals } = await zk.prove('age-verification', {
  birthYear: 1990,
  currentYear: 2026,
  minimumAge: 18,
});

const { isValid } = await zk.verifyRemote({
  circuitName: 'age-verification',
  proof,
  publicSignals,
});`}</code>
            </pre>
            <div className="mt-4 flex items-center gap-4">
              <a href="/docs" className="text-xs text-zk-primary hover:text-zk-primary/80 transition-colors font-medium">
                Full documentation →
              </a>
              <a href="/docs/api" className="text-xs text-zk-gray hover:text-zk-primary transition-colors font-medium">
                API Reference →
              </a>
            </div>
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
              <CopyContractAddress address={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''} />

            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-zk-gray uppercase tracking-wider opacity-60 mb-1">Product</h4>
              <a href="/templates" className="text-zk-gray hover:text-zk-primary transition-colors">Templates</a>
              <a href="/rwa" className="text-zk-gray hover:text-zk-primary transition-colors">Private RWA Access</a>
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
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-zk-gray uppercase tracking-wider opacity-60 mb-1">Resources</h4>
              <a href="/docs" className="text-zk-gray hover:text-zk-primary transition-colors">Documentation</a>
              <a href="/docs/api" className="text-zk-gray hover:text-zk-primary transition-colors">API Reference</a>
              <a href="/regulations" className="text-zk-gray hover:text-zk-primary transition-colors">Regulations</a>
              <a href="/trust" className="text-zk-gray hover:text-zk-primary transition-colors">Trust &amp; Security</a>
              <a href="/verify-proof" className="text-zk-gray hover:text-zk-primary transition-colors">Verify Proof</a>
              <a href="/changelog" className="text-zk-gray hover:text-zk-primary transition-colors">Changelog</a>
              <a href="/roadmap" className="text-zk-gray hover:text-zk-primary transition-colors">Roadmap</a>
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-zk-gray uppercase tracking-wider opacity-60 mb-1">Company</h4>
              <a href="/about" className="text-zk-gray hover:text-zk-primary transition-colors">
                About
              </a>
              <a href="https://x.com/rune_zk" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
                Twitter
              </a>
              <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
                GitHub
              </a>
              <a href="mailto:zkruneprotocol@gmail.com" className="text-zk-gray hover:text-zk-primary transition-colors">
                Contact
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


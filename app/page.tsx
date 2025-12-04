"use client";

import RuneAnimation from "@/components/RuneAnimation";
import Navigation from "@/components/Navigation";
import StructuredData from "@/components/StructuredData";
import { generateOrganizationSchema, generateSoftwareApplicationSchema } from "@/lib/seo";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import ComparisonTable from "@/components/ComparisonTable";
import EducationalBanner from "@/components/EducationalBanner";
import CTAShowcase from "@/components/CTAShowcase";
import WhatIsZkRune from "@/components/WhatIsZkRune";
import InteractiveHeroDemo from "@/components/InteractiveHeroDemo";
import FirstProofSection from "@/components/FirstProofSection";
import TutorialOverlay from "@/components/TutorialOverlay";
import TrustBadges from "@/components/TrustBadges";

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
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-secondary/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-primary/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>


      {/* Main Content */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-16 py-20 pt-32 min-h-screen gap-12">
        {/* Left Side - Content */}
        <div className="max-w-2xl space-y-8 text-center lg:text-left">
          {/* Zcash Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 border border-[#F4B728]/50 bg-[#F4B728]/10 rounded-full backdrop-blur-sm">
            <img src="/zcash-logo.png" alt="Zcash" className="w-5 h-5" />
            <span className="text-xs font-bold text-[#F4B728] uppercase tracking-wider">
              Powered by Zcash Privacy
            </span>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h2 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-tight text-white">
              Build Privacy
              <br />
              <span className="text-zk-primary">Without Code</span>.
            </h2>
            <p className="text-lg md:text-xl text-zk-gray max-w-xl mx-auto lg:mx-0">
              Visual Zero-Knowledge Proof Builder for <span className="text-[#F4B728] font-semibold">Zcash</span>. Create privacy-preserving applications without cryptography expertise.
            </p>
            <p className="text-sm text-[#F4B728]/80 max-w-xl mx-auto lg:mx-0 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Using Zcash's battle-tested Groth16 zk-SNARK technology
            </p>
          </div>

          {/* Enhanced Stats - Social Proof + Technical */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            <div className="group p-4 bg-zk-dark/30 border border-zk-gray/20 rounded-xl hover:border-zk-primary/50 transition-all">
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

            <div className="group p-4 bg-zk-dark/30 border border-zk-gray/20 rounded-xl hover:border-zk-primary/50 transition-all">
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

            <div className="group p-4 bg-zk-dark/30 border border-zk-gray/20 rounded-xl hover:border-zk-primary/50 transition-all">
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

            <div className="group p-4 bg-zk-dark/30 border border-zk-gray/20 rounded-xl hover:border-zk-primary/50 transition-all">
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
              className="px-8 py-4 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105 shadow-lg shadow-zk-primary/20 inline-block text-center"
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
          <div className="p-8 md:p-12 bg-gradient-to-br from-zk-primary/10 via-purple-500/10 to-zk-primary/5 border border-zk-primary/30 rounded-3xl backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-zk-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-hatton text-white mb-3">
                  Privacy Tools That Actually Respect Privacy
                </h2>
                <p className="text-base md:text-lg text-zk-gray leading-relaxed mb-4">
                  Most ZK platforms require <strong className="text-white">server-side proof generation</strong> - your sensitive data leaves your device and gets transmitted to their servers.
                </p>
                <p className="text-base md:text-lg text-white font-medium leading-relaxed">
                  zkRune generates proofs in <span className="text-zk-primary font-bold">YOUR browser</span>. Your secrets never leave your device. 100% client-side, always. True to Zcash's cypherpunk ethos.
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
              From Zero to Production in Hours
            </h2>
            <p className="text-lg text-zk-gray max-w-2xl mx-auto">
              Progressive learning path: Learn the concepts, experiment with templates, ship to production.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Layer 1: Learn */}
            <div className="group p-8 bg-zk-dark/30 border border-zk-primary/20 rounded-2xl hover:border-zk-primary/50 hover:bg-zk-dark/50 transition-all">
              <div className="w-16 h-16 bg-zk-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="mb-2 inline-block px-3 py-1 bg-zk-primary/10 rounded-full">
                <span className="text-2xl font-hatton text-zk-primary">01</span>
              </div>
              <h3 className="text-xl font-hatton text-white mb-3">
                Learn <span className="text-zk-gray text-sm">(5 minutes)</span>
              </h3>
              <p className="text-sm text-zk-gray leading-relaxed mb-4">
                <strong className="text-white">Visual Circuit Builder</strong> shows HOW zero-knowledge proofs work. Drag-drop interface, no cryptography background needed.
              </p>
              <p className="text-xs text-zk-primary font-medium">
                → First ZK proof in 5 minutes
              </p>
            </div>

            {/* Layer 2: Experiment */}
            <div className="group p-8 bg-zk-dark/30 border border-purple-500/20 rounded-2xl hover:border-purple-500/50 hover:bg-zk-dark/50 transition-all">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="mb-2 inline-block px-3 py-1 bg-purple-500/10 rounded-full">
                <span className="text-2xl font-hatton text-purple-400">02</span>
              </div>
              <h3 className="text-xl font-hatton text-white mb-3">
                Experiment <span className="text-zk-gray text-sm">(Templates)</span>
              </h3>
              <p className="text-sm text-zk-gray leading-relaxed mb-4">
                <strong className="text-white">13 Real Groth16 Circuits</strong> with production-ready use cases: voting, credentials, NFTs, token swaps. Copy-paste into your app.
              </p>
              <p className="text-xs text-purple-400 font-medium">
                → Real cryptographic proofs instantly
              </p>
            </div>

            {/* Layer 3: Build */}
            <div className="group p-8 bg-zk-dark/30 border border-[#F4B728]/20 rounded-2xl hover:border-[#F4B728]/50 hover:bg-zk-dark/50 transition-all">
              <div className="w-16 h-16 bg-[#F4B728]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-[#F4B728]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="mb-2 inline-block px-3 py-1 bg-[#F4B728]/10 rounded-full">
                <span className="text-2xl font-hatton text-[#F4B728]">03</span>
              </div>
              <h3 className="text-xl font-hatton text-white mb-3">
                Build <span className="text-zk-gray text-sm">(Production)</span>
              </h3>
              <p className="text-sm text-zk-gray leading-relaxed mb-4">
                <strong className="text-white">NPM SDK + Export</strong> ready. Install with npm, export circuits to production. Deploy privacy apps in hours, not months.
              </p>
              <p className="text-xs text-[#F4B728] font-medium">
                → Ship to production instantly
              </p>
            </div>
          </div>

          {/* Before/After Impact */}
          <div className="mt-12 p-6 bg-zk-darker/50 border border-white/5 rounded-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Before zkRune</h4>
                <ul className="space-y-2 text-sm text-zk-gray">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Months to learn ZK cryptography</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Server-side proofs = privacy risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Slow Zcash ecosystem growth</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-zk-primary uppercase tracking-wider mb-3">After zkRune</h4>
                <ul className="space-y-2 text-sm text-zk-gray">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-zk-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>5 minutes to first ZK proof</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-zk-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>True privacy (100% client-side)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-zk-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>More developers → Stronger ecosystem</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What is zkRune Section */}
      <WhatIsZkRune />

      {/* First Proof in 60 Seconds */}
      <FirstProofSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Trust Badges */}
      <TrustBadges />

      {/* FAQ Section */}
      <FAQ />

      {/* Educational Banner */}
      <EducationalBanner />

      {/* Final CTA */}
      <CTAShowcase />

      {/* Tutorial Overlay */}
      <TutorialOverlay />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 lg:px-16 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Zcash Badge */}
          <div className="flex items-center gap-3 px-4 py-2 border border-[#F4B728]/30 bg-[#F4B728]/5 rounded-lg">
            <img src="/zcash-logo.png" alt="Zcash" className="w-6 h-6" />
            <div>
              <p className="text-xs font-bold text-[#F4B728]">Built for Zcash</p>
              <p className="text-xs text-zk-gray">Privacy Technology</p>
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
              <a href="/builder" className="text-zk-gray hover:text-zk-primary transition-colors">Builder</a>
              <a href="/install" className="text-zk-gray hover:text-zk-primary transition-colors">Install App</a>
              <a href="/zcash" className="text-[#F4B728] hover:text-[#F4B728]/80 transition-colors font-medium">Zcash Integration</a>
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


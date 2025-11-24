"use client";

const CONTRACT_ADDRESS = "51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump";
import RuneAnimation from "@/components/RuneAnimation";
import Navigation from "@/components/Navigation";
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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              Zcash Powered
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
              Visual Zero-Knowledge Proof Builder for Zcash. Create privacy-preserving applications without cryptography expertise.
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
                  navigator.clipboard.writeText(CONTRACT_ADDRESS);
                  alert('Contract address copied!');
                }}
                className="text-xs text-zk-accent font-mono hover:text-zk-primary transition-colors cursor-pointer"
                title="Click to copy"
              >
                {CONTRACT_ADDRESS.substring(0, 8)}...{CONTRACT_ADDRESS.substring(CONTRACT_ADDRESS.length - 5)}
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-medium uppercase tracking-wider">
            <a href="/install" className="text-zk-primary hover:text-zk-primary/80 transition-colors">
              Install App
            </a>
            <a href="https://x.com/rune_zk" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
              Twitter
            </a>
            <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
              GitHub
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-zk-primary to-transparent" />
            <span className="text-xs text-zk-gray uppercase tracking-wider">Scroll</span>
          </div>
        </div>
      </footer>
    </main>
  );
}


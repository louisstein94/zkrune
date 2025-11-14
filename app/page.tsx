"use client";

import { useState, useEffect } from "react";
import RuneAnimation from "@/components/RuneAnimation";
import Navigation from "@/components/Navigation";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import ComparisonTable from "@/components/ComparisonTable";
import EducationalBanner from "@/components/EducationalBanner";
import CTAShowcase from "@/components/CTAShowcase";
import WhatIsZkRune from "@/components/WhatIsZkRune";

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
              ⚡ Zcash Powered
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

          {/* Real Stats - Technical Achievements */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-8 md:gap-12 pt-8">
            <div className="space-y-2 text-center lg:text-left">
              <p className="font-hatton text-3xl md:text-4xl text-white">
                0.44<span className="text-zk-primary">s</span>
              </p>
              <p className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Proof Generation
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-hatton text-4xl text-white">
                100<span className="text-zk-primary">%</span>
              </p>
              <p className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Privacy Guarantee
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-hatton text-4xl text-white">
                5<span className="text-zk-primary">/5</span>
              </p>
              <p className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Real ZK Circuits
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

        {/* Right Side - Rune Animation */}
        <div className="relative w-full lg:w-1/2 h-[400px] lg:h-[600px] flex items-center justify-center">
          <RuneAnimation />
        </div>
      </div>

      {/* What is zkRune Section */}
      <WhatIsZkRune />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ Section */}
      <FAQ />

      {/* Educational Banner */}
      <EducationalBanner />

      {/* Final CTA */}
      <CTAShowcase />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 lg:px-16 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-12 text-sm">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider opacity-60">
                Version
              </p>
              <p className="text-white">Beta 0.1</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-zk-gray uppercase tracking-wider opacity-60">
                Status
              </p>
              <p className="text-zk-primary">● All Systems Operational</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-medium uppercase tracking-wider">
            <a href="https://x.com/legelsteinn" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
              Developer
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


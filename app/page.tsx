"use client";

import { useState, useEffect } from "react";
import RuneAnimation from "@/components/RuneAnimation";

export default function Home() {
  const [proofsGenerated, setProofsGenerated] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  // Animated counters
  useEffect(() => {
    const proofsInterval = setInterval(() => {
      setProofsGenerated((prev) => (prev < 1234 ? prev + 23 : 1234));
    }, 50);

    const usersInterval = setInterval(() => {
      setActiveUsers((prev) => (prev < 100 ? prev + 2 : 100));
    }, 80);

    return () => {
      clearInterval(proofsInterval);
      clearInterval(usersInterval);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-zk-darker overflow-hidden">
      {/* Noise Texture */}
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      {/* Gradient Orb Background */}
      <div className="absolute top-0 right-0 w-[60%] h-full overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-secondary/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-primary/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-zk-primary">ᚱ</div>
            <h1 className="text-2xl font-hatton text-white">zkRune</h1>
          </div>
        </div>

        <nav className="flex items-center gap-8 text-sm font-medium uppercase tracking-wider">
          <a href="#docs" className="text-zk-gray hover:text-zk-primary transition-colors">
            Documentation
          </a>
          <a href="#templates" className="text-zk-gray hover:text-zk-primary transition-colors">
            Templates
          </a>
          <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
            GitHub
          </a>
        </nav>

        <button className="px-6 py-2 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105">
          Start Building
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-between px-16 py-20 min-h-[calc(100vh-100px)]">
        {/* Left Side - Content */}
        <div className="max-w-2xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              ⚡ Zcash Powered
            </span>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h2 className="font-hatton text-6xl leading-tight text-white">
              Build Privacy
              <br />
              <span className="text-zk-primary">Without Code</span>.
            </h2>
            <p className="text-xl text-zk-gray max-w-xl">
              Visual Zero-Knowledge Proof Builder for Zcash. Create privacy-preserving applications without cryptography expertise.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-12 pt-8">
            <div className="space-y-2">
              <p className="font-hatton text-4xl text-white">
                {proofsGenerated.toLocaleString()}
                <span className="text-zk-primary">+</span>
              </p>
              <p className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Proofs Generated
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-hatton text-4xl text-white">
                {activeUsers}
                <span className="text-zk-primary">+</span>
              </p>
              <p className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Active Users
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-hatton text-4xl text-white">
                5<span className="text-zk-primary">+</span>
              </p>
              <p className="text-sm font-medium text-zk-gray uppercase tracking-wider">
                Templates Ready
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 pt-4">
            <button className="px-8 py-4 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105 shadow-lg shadow-zk-primary/20">
              Try Free Templates
            </button>
            <button className="px-8 py-4 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Right Side - Rune Animation */}
        <div className="relative w-1/2 h-[600px] flex items-center justify-center">
          <RuneAnimation />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-16 py-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-12 text-sm">
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
          <div className="flex gap-6 text-sm font-medium uppercase tracking-wider">
            <a href="https://twitter.com/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
              Twitter
            </a>
            <a href="https://discord.gg/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
              Discord
            </a>
            <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-gray hover:text-zk-primary transition-colors">
              GitHub
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-zk-primary to-transparent" />
            <span className="text-xs text-zk-gray uppercase tracking-wider">Scroll</span>
          </div>
        </div>
      </footer>
    </main>
  );
}


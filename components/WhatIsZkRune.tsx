"use client";

// Premium Icons
function PrivacyIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" stroke="url(#privacy-gradient)" strokeWidth="1.5" fill="url(#privacy-gradient)" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" className="text-zk-primary" />
      <path d="M12 9v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-primary" />
      <defs>
        <linearGradient id="privacy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TrustIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-zk-primary" />
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="url(#trust-gradient)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="2" fill="currentColor" className="text-zk-primary" />
      <path d="M12 18v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zk-primary" />
      <defs>
        <linearGradient id="trust-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SpeedIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="url(#speed-gradient)" strokeWidth="1.5" strokeLinejoin="round" fill="url(#speed-gradient)" fillOpacity="0.1" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" className="text-zk-primary" />
      <defs>
        <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#6B4CFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function WhatIsZkRune() {
  return (
    <section className="relative py-24 px-16 bg-zk-dark/20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              Simple Explanation
            </span>
          </div>

          <h2 className="font-hatton text-5xl text-white mb-6">
            What is <span className="text-zk-primary">zkRune</span>?
          </h2>
        </div>

        {/* Simple Cards */}
        <div className="space-y-6">
          {/* Card 1 */}
          <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-zk-primary/10 rounded-2xl border border-zk-primary/20">
                <PrivacyIcon className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-hatton text-white mb-3">
                  Prove Things Without Revealing Secrets
                </h3>
                <p className="text-lg text-zk-gray leading-relaxed">
                  Imagine proving you're over 18 <span className="text-white">without showing your ID</span>. 
                  Or proving you have enough money <span className="text-white">without showing your bank balance</span>.
                  That's what zkRune does - using advanced math called "zero-knowledge proofs."
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-zk-secondary/10 rounded-2xl border border-zk-secondary/20">
                <TrustIcon className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-hatton text-white mb-3">
                  Privacy You Can Trust
                </h3>
                <p className="text-lg text-zk-gray leading-relaxed">
                  Your sensitive information <span className="text-white">never leaves your device</span>. 
                  The proof is mathematical - it can't be faked, and anyone can verify it. 
                  No need to trust us, <span className="text-zk-primary">trust the math</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-zk-accent/10 rounded-2xl border border-zk-accent/20">
                <SpeedIcon className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-2xl font-hatton text-white mb-3">
                  Simple to Use, Powerful Technology
                </h3>
                <p className="text-lg text-zk-gray leading-relaxed">
                  You don't need to be a cryptography expert. Just pick a template, 
                  fill in a simple form, and click a button. 
                  <span className="text-white">Your proof is ready in under 1 second</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Real-World Example */}
          <div className="mt-8 p-8 bg-gradient-to-br from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/30 rounded-2xl">
            <h3 className="text-xl font-hatton text-white mb-4">
              💡 Real-World Example:
            </h3>
            <p className="text-zk-gray leading-relaxed mb-4">
              You want to join an exclusive group that requires members to have at least $10,000 in savings.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="text-red-400">❌ Old way:</span>
                <span className="text-zk-gray">Show your bank statement (reveals exact balance, transactions, personal info)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-zk-primary">✅ zkRune way:</span>
                <span className="text-white">Generate a proof that says "I have $10,000+" - your exact balance stays secret!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


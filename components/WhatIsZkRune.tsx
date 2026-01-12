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
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/30 rounded-full mb-6">
          <div className="w-2 h-2 rounded-full bg-zk-primary" />
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              Simple Explanation
            </span>
          </div>

          <h2 className="font-hatton text-5xl text-white mb-6">
            What is <span className="text-zk-primary">zkRune</span>?
          </h2>
        </div>

      {/* Simple Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-zk-dark/40 border border-zk-gray/15 rounded-2xl p-6 hover:border-zk-primary/30 transition-all hover:translate-y-[-2px]">
          <div className="text-center">
            <div className="inline-block p-3 bg-zk-primary/10 rounded-xl border border-zk-primary/15 mb-4">
              <PrivacyIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-hatton text-white mb-3">
              Prove Without Revealing
            </h3>
            <p className="text-sm text-zk-gray leading-relaxed">
              Prove you're 18+ <span className="text-white/80">without showing ID</span>. 
              Prove you have funds <span className="text-white/80">without showing balance</span>.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-zk-dark/40 border border-zk-gray/15 rounded-2xl p-6 hover:border-zk-secondary/30 transition-all hover:translate-y-[-2px]">
          <div className="text-center">
            <div className="inline-block p-3 bg-zk-secondary/10 rounded-xl border border-zk-secondary/15 mb-4">
              <TrustIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-hatton text-white mb-3">
              Math-Based Trust
            </h3>
            <p className="text-sm text-zk-gray leading-relaxed">
              Data never leaves your device. 
              Mathematical proof can't be faked. 
              <span className="text-zk-primary/80">Trust the math, not us</span>.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-zk-dark/40 border border-zk-gray/15 rounded-2xl p-6 hover:border-zk-accent/30 transition-all hover:translate-y-[-2px]">
          <div className="text-center">
            <div className="inline-block p-3 bg-zk-accent/10 rounded-xl border border-zk-accent/15 mb-4">
              <SpeedIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-hatton text-white mb-3">
              Simple & Fast
            </h3>
            <p className="text-sm text-zk-gray leading-relaxed">
              No crypto knowledge needed. Pick template, fill form, click button.
              <span className="text-white/80"> Ready in 1 second</span>.
            </p>
          </div>
        </div>

        {/* Real-World Example */}
        <div className="md:col-span-2 lg:col-span-3 mt-2 p-6 md:p-8 bg-zk-dark/50 border border-zk-primary/20 rounded-2xl">
            <h3 className="text-xl font-hatton text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-zk-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Real-World Example:
            </h3>
            <p className="text-zk-gray leading-relaxed mb-4">
              You want to join an exclusive group that requires members to have at least $10,000 in savings.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="text-red-400 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Old way:
                </span>
                <span className="text-zk-gray">Show your bank statement (reveals exact balance, transactions, personal info)</span>
              </div>
              <div className="flex gap-3">
                <span className="text-zk-primary flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  zkRune way:
                </span>
                <span className="text-white">Generate a proof that says "I have $10,000+" - your exact balance stays secret!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


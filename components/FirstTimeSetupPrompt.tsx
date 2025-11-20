"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * First Time Setup Prompt
 * Shows after PWA installation to guide users through caching circuit files
 */
export default function FirstTimeSetupPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (installed PWA)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
    
    setIsStandalone(standalone);

    // Check if user has completed first-time setup
    const hasCompletedSetup = localStorage.getItem('zkrune_setup_completed');
    
    // Show prompt only if:
    // 1. App is installed (standalone)
    // 2. User hasn't completed setup
    // 3. Not on install page
    if (standalone && !hasCompletedSetup && !window.location.pathname.includes('/install')) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const handleComplete = () => {
    localStorage.setItem('zkrune_setup_completed', 'true');
    setShowPrompt(false);
  };

  const handleSkip = () => {
    // Don't mark as completed, but hide for this session
    sessionStorage.setItem('zkrune_setup_skipped', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !isStandalone) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-zk-darker to-zk-dark border-2 border-amber-500/30 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h2 className="font-hatton text-2xl text-white mb-2">
              Welcome to zkRune! 🎉
            </h2>
            <p className="text-sm text-amber-200/90">
              One more step to enable offline functionality
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-zk-gray hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-zk-darker/80 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-zk-gray mb-3">
              To use zkRune <span className="text-white font-medium">completely offline</span>, 
              you need to cache the circuit files first:
            </p>
            
            <div className="space-y-2">
              <div className="flex gap-2 items-start">
                <span className="text-amber-400 mt-0.5">▸</span>
                <span className="text-xs text-zk-gray">
                  Visit the <span className="text-amber-400 font-medium">Templates</span> page
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-amber-400 mt-0.5">▸</span>
                <span className="text-xs text-zk-gray">
                  Generate a test proof for each template you want to use offline
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-amber-400 mt-0.5">▸</span>
                <span className="text-xs text-zk-gray">
                  This downloads circuit files (~5MB each) to your device
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-200/90">
              ⚡ <span className="font-medium">Why?</span> Circuit files are large and cached on-demand. 
              After the first use, they're stored permanently for offline access.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/install"
            onClick={handleComplete}
            className="w-full px-6 py-3 bg-amber-500 text-zk-darker font-medium rounded-lg hover:bg-amber-400 transition-all text-center"
          >
            View Setup Guide
          </Link>
          
          <div className="flex gap-3">
            <Link
              href="/templates"
              onClick={handleComplete}
              className="flex-1 px-4 py-2 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all text-center text-sm"
            >
              Go to Templates
            </Link>
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2 text-zk-gray hover:text-white border border-zk-gray/30 rounded-lg transition-colors text-sm"
            >
              Skip for Now
            </button>
          </div>
        </div>

        <p className="text-xs text-zk-gray text-center mt-4">
          You can always access this guide from the 
          <Link href="/install" className="text-amber-400 hover:text-amber-300 ml-1">
            Install page
          </Link>
        </p>
      </div>
    </div>
  );
}


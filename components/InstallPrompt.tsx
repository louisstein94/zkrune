/**
 * PWA Install Prompt Component
 * Displays platform-specific installation instructions
 * Clean, responsive, and user-friendly
 */

'use client';

import { useInstallPrompt } from '@/lib/pwa/hooks/useInstallPrompt';
import { useState } from 'react';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall, dismissPrompt } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  // Don't show on desktop (unless installable)
  if (!isIOS && !isAndroid && !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      await promptInstall();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    dismissPrompt();
  };

  return (
    <>
      {/* Install Banner (Android / Installable browsers) */}
      {isInstallable && !showIOSInstructions && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
          <div className="bg-gradient-to-br from-zk-primary/20 to-zk-secondary/20 backdrop-blur-xl border border-zk-primary/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zk-primary/20 rounded-xl border border-zk-primary/30">
                <svg className="w-6 h-6 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className="font-hatton text-lg text-white mb-1">
                  Install zkRune App
                </h3>
                <p className="text-sm text-zk-gray mb-4">
                  Generate ZK proofs offline. Works even without internet.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleInstall}
                    className="px-4 py-2 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all text-sm"
                  >
                    Install Now
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-zk-gray hover:text-white transition-colors text-sm"
                  >
                    Not Now
                  </button>
                </div>
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
          </div>
        </div>
      )}

      {/* iOS Instructions (Manual) */}
      {isIOS && !isInstallable && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
          <div className="bg-gradient-to-br from-zk-primary/20 to-zk-secondary/20 backdrop-blur-xl border border-zk-primary/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zk-primary/20 rounded-xl border border-zk-primary/30">
                  <svg className="w-5 h-5 text-zk-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <h3 className="font-hatton text-lg text-white">
                  Install on iOS
                </h3>
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

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zk-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-zk-primary">1</span>
                </div>
                <p className="text-sm text-zk-gray">
                  Tap the <span className="text-white font-medium">Share button</span> (
                  <svg className="inline w-4 h-4 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                  </svg>
                  ) at the bottom of Safari
                </p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zk-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-zk-primary">2</span>
                </div>
                <p className="text-sm text-zk-gray">
                  Select <span className="text-white font-medium">"Add to Home Screen"</span>
                </p>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zk-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-zk-primary">3</span>
                </div>
                <p className="text-sm text-zk-gray">
                  Tap <span className="text-white font-medium">"Add"</span> to install zkRune
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-zk-primary/10 border border-zk-primary/20 rounded-lg">
              <p className="text-xs text-zk-gray">
                <span className="text-white">Pro tip:</span> Works 100% offline after installation!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal (if button clicked) */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-zk-dark border border-zk-primary/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-zk-primary/20 rounded-2xl border border-zk-primary/30 mb-4">
                <svg className="w-12 h-12 text-zk-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <h2 className="font-hatton text-2xl text-white mb-2">
                Install on iOS
              </h2>
              <p className="text-sm text-zk-gray">
                Follow these simple steps to install zkRune
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                  <span className="text-sm font-bold text-zk-primary">1</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Open in Safari</p>
                  <p className="text-sm text-zk-gray">Make sure you're using Safari browser</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                  <span className="text-sm font-bold text-zk-primary">2</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Tap Share Button</p>
                  <p className="text-sm text-zk-gray">Look for the share icon (
                    <svg className="inline w-4 h-4 mb-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                    </svg>
                  ) at the bottom</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                  <span className="text-sm font-bold text-zk-primary">3</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Add to Home Screen</p>
                  <p className="text-sm text-zk-gray">Select "Add to Home Screen" option</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                  <span className="text-sm font-bold text-zk-primary">4</span>
                </div>
                <div>
                  <p className="text-white font-medium mb-1">Confirm Installation</p>
                  <p className="text-sm text-zk-gray">Tap "Add" and you're done!</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zk-primary/10 border border-zk-primary/20 rounded-xl mb-6">
              <p className="text-sm text-zk-gray text-center">
                After installation, zkRune will work <span className="text-zk-primary font-medium">completely offline</span>!
              </p>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full px-6 py-3 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
}


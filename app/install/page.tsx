import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Install zkRune App | Mobile Installation Guide",
  description: "Learn how to install zkRune as a Progressive Web App on your iOS or Android device for offline ZK proof generation.",
};

export default function InstallPage() {
  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-24 pt-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse"></div>
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              Installation Guide
            </span>
          </div>
          
          <h1 className="font-hatton text-4xl md:text-5xl text-white mb-4">
            Install zkRune <span className="text-zk-primary">on Mobile</span>
          </h1>
          
          <p className="text-xl text-zk-gray max-w-2xl mx-auto">
            No app store needed. Install zkRune directly from your browser and generate ZK proofs completely offline.
          </p>
        </div>

        {/* Why PWA */}
        <div className="mb-16 p-8 bg-gradient-to-br from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/30 rounded-2xl">
          <h2 className="font-hatton text-2xl text-white mb-4">Why Progressive Web App?</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="text-zk-primary">✓</span>
              <span className="text-zk-gray">No app store approval needed</span>
            </div>
            <div className="flex gap-3">
              <span className="text-zk-primary">✓</span>
              <span className="text-zk-gray">Works 100% offline</span>
            </div>
            <div className="flex gap-3">
              <span className="text-zk-primary">✓</span>
              <span className="text-zk-gray">Instant updates</span>
            </div>
            <div className="flex gap-3">
              <span className="text-zk-primary">✓</span>
              <span className="text-zk-gray">Native app experience</span>
            </div>
            <div className="flex gap-3">
              <span className="text-zk-primary">✓</span>
              <span className="text-zk-gray">Zero data collection</span>
            </div>
            <div className="flex gap-3">
              <span className="text-zk-primary">✓</span>
              <span className="text-zk-gray">Cross-platform support</span>
            </div>
          </div>
        </div>

        {/* iOS Installation */}
        <div className="mb-12 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-zk-primary/20 rounded-xl border border-zk-primary/30">
              <svg className="w-8 h-8 text-zk-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <h2 className="font-hatton text-3xl text-white">iOS Installation</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                <span className="text-sm font-bold text-zk-primary">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Open in Safari</h3>
                <p className="text-zk-gray text-sm">
                  Visit zkrune.com using Safari browser on your iPhone or iPad. 
                  PWA installation only works in Safari on iOS.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                <span className="text-sm font-bold text-zk-primary">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Tap the Share Button</h3>
                <p className="text-zk-gray text-sm mb-2">
                  Look for the share icon (
                  <svg className="inline w-4 h-4 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                  </svg>
                  ) at the bottom of Safari.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                <span className="text-sm font-bold text-zk-primary">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Add to Home Screen</h3>
                <p className="text-zk-gray text-sm">
                  Scroll down and select "Add to Home Screen" from the share menu.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-primary/20 flex items-center justify-center border border-zk-primary/30">
                <span className="text-sm font-bold text-zk-primary">4</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Confirm Installation</h3>
                <p className="text-zk-gray text-sm">
                  Tap "Add" in the top right corner. The zkRune icon will appear on your home screen!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Android Installation */}
        <div className="mb-12 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-zk-secondary/20 rounded-xl border border-zk-secondary/30">
              <svg className="w-8 h-8 text-zk-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.6,11.48 L19.44,8.3 C19.5,8.17 19.5,8.02 19.44,7.88 C19.38,7.74 19.27,7.62 19.13,7.56 C18.86,7.42 18.54,7.53 18.4,7.8 L16.56,10.98 C15.47,10.5 14.26,10.23 13,10.23 C11.74,10.23 10.53,10.5 9.44,10.98 L7.6,7.8 C7.46,7.53 7.14,7.42 6.87,7.56 C6.73,7.62 6.62,7.74 6.56,7.88 C6.5,8.02 6.5,8.17 6.56,8.3 L8.4,11.48 C6.28,12.69 4.83,14.88 4.62,17.42 L21.38,17.42 C21.17,14.88 19.72,12.69 17.6,11.48 M10,15 C9.45,15 9,14.55 9,14 C9,13.45 9.45,13 10,13 C10.55,13 11,13.45 11,14 C11,14.55 10.55,15 10,15 M16,15 C15.45,15 15,14.55 15,14 C15,13.45 15.45,13 16,13 C16.55,13 17,13.45 17,14 C17,14.55 16.55,15 16,15 Z"/>
              </svg>
            </div>
            <h2 className="font-hatton text-3xl text-white">Android Installation</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-secondary/20 flex items-center justify-center border border-zk-secondary/30">
                <span className="text-sm font-bold text-zk-secondary">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Open in Chrome</h3>
                <p className="text-zk-gray text-sm">
                  Visit zkrune.com using Chrome browser on your Android device.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-secondary/20 flex items-center justify-center border border-zk-secondary/30">
                <span className="text-sm font-bold text-zk-secondary">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Wait for Install Banner</h3>
                <p className="text-zk-gray text-sm">
                  After browsing for ~30 seconds, an "Install app" banner will appear at the bottom.
                  Alternatively, tap the menu (⋮) and select "Install app" or "Add to Home screen".
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zk-secondary/20 flex items-center justify-center border border-zk-secondary/30">
                <span className="text-sm font-bold text-zk-secondary">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Tap Install</h3>
                <p className="text-zk-gray text-sm">
                  Tap the "Install" button. The app will be added to your home screen and app drawer!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How Offline Works */}
        <div className="mb-12 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
          <h2 className="font-hatton text-2xl text-white mb-6">How Offline Mode Works</h2>
          
          <div className="space-y-4 text-sm text-zk-gray">
            <p>
              zkRune uses <span className="text-white font-medium">Service Workers</span> and 
              <span className="text-white font-medium"> Cache API</span> to enable true offline functionality.
            </p>
            
            <div className="pl-4 border-l-2 border-zk-primary/30">
              <p className="mb-2 text-white font-medium">First Visit (Online Required):</p>
              <p>
                When you first visit zkRune, all necessary files are downloaded and cached locally on your device.
                This includes circuit files (WASM, zkey), verification keys, and the user interface.
              </p>
            </div>
            
            <div className="pl-4 border-l-2 border-zk-primary/30">
              <p className="mb-2 text-white font-medium">After Installation:</p>
              <p>
                Once cached, zkRune works completely offline. You can:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Generate ZK proofs with zero internet connection</li>
                <li>Access all templates and features</li>
                <li>Verify proofs locally</li>
                <li>Export proofs as JSON or code</li>
              </ul>
            </div>
            
            <div className="p-4 bg-zk-primary/10 border border-zk-primary/20 rounded-lg mt-4">
              <p className="text-xs text-zk-gray">
                <span className="text-zk-primary font-medium">Storage Used:</span> Approximately 10-15MB for all circuits and assets.
                Updates are downloaded automatically when you're back online.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
          <h2 className="font-hatton text-2xl text-white mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-2">Do I need an app store account?</h3>
              <p className="text-zk-gray text-sm">
                No! PWAs install directly from your browser. No App Store or Google Play required.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Will it use my phone storage?</h3>
              <p className="text-zk-gray text-sm">
                Yes, approximately 10-15MB for all circuits and assets. This is much smaller than typical native apps.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Can I use it on airplane mode?</h3>
              <p className="text-zk-gray text-sm">
                Absolutely! Once installed, zkRune works perfectly on airplane mode or with no internet connection.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">How do updates work?</h3>
              <p className="text-zk-gray text-sm">
                Updates happen automatically in the background when you're online. No manual updates needed.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">Is my data sent to servers?</h3>
              <p className="text-zk-gray text-sm">
                No! All proof generation happens locally on your device. Your private data never leaves your phone.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-2">How do I uninstall?</h3>
              <p className="text-zk-gray text-sm">
                <strong className="text-white">iOS:</strong> Long press the zkRune icon → Remove App<br/>
                <strong className="text-white">Android:</strong> Long press the zkRune icon → Uninstall
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gradient-to-br from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/30 rounded-2xl">
          <h2 className="font-hatton text-2xl text-white mb-4">
            Ready to Install?
          </h2>
          <p className="text-zk-gray mb-6">
            Visit zkRune on your mobile device and follow the steps above.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
          >
            Go to Home
          </a>
        </div>
      </div>
    </main>
  );
}


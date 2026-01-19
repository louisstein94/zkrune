"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="relative min-h-screen bg-zk-darker overflow-hidden">
      <Navigation />
      
      {/* Noise Texture */}
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      {/* Background */}
      <div className="absolute top-0 right-0 w-[60%] h-full overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-32 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-zk-gray hover:text-zk-primary transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-hatton text-4xl md:text-5xl text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-zk-gray">
            Last updated: January 19, 2026
          </p>
        </div>

        {/* Privacy First Banner */}
        <div className="mb-12 p-6 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Privacy by Design</h2>
              <p className="text-purple-200/80">
                zkRune is built with privacy as a core principle. All zero-knowledge proof generation 
                happens in your browser. Your private data never leaves your device.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">1. Introduction</h2>
            <p className="text-zk-gray leading-relaxed">
              This Privacy Policy explains how zkRune ("we", "our", or "us") handles information 
              when you use our zero-knowledge proof generation service. We are committed to protecting 
              your privacy and being transparent about our practices.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">2. Information We Do NOT Collect</h2>
            <p className="text-zk-gray leading-relaxed">
              Due to the client-side nature of our service, we do not collect:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li><strong className="text-white">Private inputs:</strong> Any data you enter to generate ZK proofs</li>
              <li><strong className="text-white">Secrets or private keys:</strong> Your cryptographic secrets remain on your device</li>
              <li><strong className="text-white">Proof contents:</strong> The actual proofs you generate</li>
              <li><strong className="text-white">Personal identifiers:</strong> We don't require accounts or personal information</li>
              <li><strong className="text-white">Wallet private keys:</strong> We never have access to your wallet keys</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">3. Information We May Collect</h2>
            <p className="text-zk-gray leading-relaxed">
              We may collect limited, non-personal information to improve the service:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li><strong className="text-white">Usage analytics:</strong> Aggregated, anonymous statistics about which features are used</li>
              <li><strong className="text-white">Error logs:</strong> Technical error information to fix bugs (no personal data)</li>
              <li><strong className="text-white">Public blockchain data:</strong> Wallet addresses when you interact with smart contracts (publicly visible on-chain)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">4. How ZK Proofs Work</h2>
            <p className="text-zk-gray leading-relaxed">
              Zero-knowledge proofs are generated entirely in your browser using WebAssembly. The process:
            </p>
            <ol className="list-decimal list-inside text-zk-gray space-y-2 mt-4">
              <li>You enter private inputs in your browser</li>
              <li>The proof is computed locally using Groth16 circuits</li>
              <li>Only the proof (not your private data) is generated</li>
              <li>You choose whether to share or submit the proof</li>
            </ol>
            <p className="text-zk-gray leading-relaxed mt-4">
              At no point does your private data leave your device. This is the fundamental privacy 
              guarantee of zero-knowledge cryptography.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">5. Blockchain Interactions</h2>
            <p className="text-zk-gray leading-relaxed">
              When you interact with the Solana blockchain through our service:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>Transactions are recorded on the public blockchain</li>
              <li>Wallet addresses involved in transactions are publicly visible</li>
              <li>We do not control or have special access to blockchain data</li>
              <li>zkRUNE token transactions follow standard Solana transparency</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">6. Cookies and Local Storage</h2>
            <p className="text-zk-gray leading-relaxed">
              We may use browser local storage to:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>Save your preferences (e.g., dark mode, tutorial completion)</li>
              <li>Cache circuit files for faster loading</li>
              <li>Store temporary proof data you're working on</li>
            </ul>
            <p className="text-zk-gray leading-relaxed mt-4">
              This data stays on your device and can be cleared through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">7. Third-Party Services</h2>
            <p className="text-zk-gray leading-relaxed">
              We may integrate with third-party services:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li><strong className="text-white">Solana RPC providers:</strong> To interact with the blockchain</li>
              <li><strong className="text-white">Analytics services:</strong> For anonymous usage statistics</li>
              <li><strong className="text-white">CDN providers:</strong> To serve static assets efficiently</li>
            </ul>
            <p className="text-zk-gray leading-relaxed mt-4">
              These services have their own privacy policies. We choose providers that respect user privacy.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">8. Data Security</h2>
            <p className="text-zk-gray leading-relaxed">
              Since your private data never leaves your device, the primary security responsibility 
              is on client-side protection. We implement:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>HTTPS encryption for all communications</li>
              <li>Content Security Policy headers</li>
              <li>Regular security audits of our code</li>
              <li>Open-source circuits for community review</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">9. Your Rights</h2>
            <p className="text-zk-gray leading-relaxed">
              Because we don't collect personal data, traditional data subject rights (access, 
              deletion, portability) don't apply in the conventional sense. However:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>You can clear local storage at any time through your browser</li>
              <li>You can use the service without providing any personal information</li>
              <li>You control all data on your device</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">10. Children's Privacy</h2>
            <p className="text-zk-gray leading-relaxed">
              Our service is not directed at children under 13. We do not knowingly collect 
              information from children. If you believe a child has provided us with information, 
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">11. Changes to This Policy</h2>
            <p className="text-zk-gray leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by updating the "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">12. Contact Us</h2>
            <p className="text-zk-gray leading-relaxed">
              If you have questions about this Privacy Policy, please reach out:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>
                <a href="https://x.com/rune_zk" target="_blank" rel="noopener noreferrer" className="text-zk-primary hover:underline">
                  Twitter/X: @rune_zk
                </a>
              </li>
              <li>
                <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-primary hover:underline">
                  GitHub: louisstein94/zkrune
                </a>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/terms" className="text-zk-gray hover:text-zk-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="text-zk-gray hover:text-zk-primary transition-colors">
              Home
            </Link>
            <Link href="/docs" className="text-zk-gray hover:text-zk-primary transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

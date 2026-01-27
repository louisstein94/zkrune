'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Simple Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">zk</span>
            </div>
            <span className="text-xl font-bold text-white">zkRune</span>
          </Link>
          <nav className="flex gap-6">
            <Link href="/templates" className="text-slate-400 hover:text-white transition-colors">Templates</Link>
            <Link href="/download" className="text-slate-400 hover:text-white transition-colors">Download</Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: January 27, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-slate-300">
              zkRune ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we handle information when you use our mobile application and web services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Zero-Knowledge Architecture</h2>
            <p className="text-slate-300">
              <strong className="text-cyan-400">zkRune is designed with privacy as a core principle.</strong> Our 
              zero-knowledge proof system operates entirely on your device:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>All ZK proofs are generated 100% client-side (in your browser or app)</li>
              <li>Your private data (birthdates, balances, credentials) never leaves your device</li>
              <li>We cannot see, access, or store your sensitive information</li>
              <li>Proofs are cryptographically verified without revealing underlying data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-white mt-6 mb-3">3.1 Information We DO NOT Collect</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Private keys or wallet seed phrases</li>
              <li>Personal identification documents</li>
              <li>Birthdates or ages used in proofs</li>
              <li>Account balances or transaction amounts</li>
              <li>Voting choices or credentials</li>
            </ul>

            <h3 className="text-xl font-medium text-white mt-6 mb-3">3.2 Information We May Collect</h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>Public Wallet Addresses:</strong> When you connect a wallet (optional)</li>
              <li><strong>Usage Analytics:</strong> Anonymous app usage statistics</li>
              <li><strong>Device Information:</strong> Device type, OS version for compatibility</li>
              <li><strong>Crash Reports:</strong> Anonymous error reports to improve stability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How We Use Information</h2>
            <p className="text-slate-300">Any information collected is used solely to:</p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Provide and improve our services</li>
              <li>Fix bugs and improve app performance</li>
              <li>Communicate important updates (if you opt-in)</li>
              <li>Comply with legal requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Storage & Security</h2>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li>Sensitive data is stored only on your device using secure storage</li>
              <li>We use industry-standard encryption for any data transmission</li>
              <li>No sensitive data is stored on our servers</li>
              <li>You can delete all local data by uninstalling the app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Third-Party Services</h2>
            <p className="text-slate-300">We may use third-party services that have their own privacy policies:</p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li><strong>Solana Network:</strong> Blockchain transactions are public</li>
              <li><strong>Helius RPC:</strong> For Solana network connectivity</li>
              <li><strong>Expo:</strong> For app updates and notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p className="text-slate-300">You have the right to:</p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Access any personal data we hold about you</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of analytics collection</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p className="text-slate-300">
              Our services are not intended for children under 13. We do not knowingly collect 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-slate-300">
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="text-slate-300">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc list-inside text-slate-300 mt-4 space-y-2">
              <li>Twitter: <a href="https://x.com/rune_zk" className="text-cyan-400 hover:underline">@rune_zk</a></li>
              <li>GitHub: <a href="https://github.com/louisstein94/zkrune" className="text-cyan-400 hover:underline">zkrune</a></li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

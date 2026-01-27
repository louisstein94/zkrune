'use client';

import { Header } from '@/components/Header';
import Link from 'next/link';

export default function DownloadPage() {
  const appVersion = '0.2.0';
  const apkSize = '97 MB';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center">
            <span className="text-4xl font-bold text-white">zk</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">zkRune Mobile</h1>
          <p className="text-xl text-slate-400">Privacy-first ZK proofs on Solana</p>
        </div>

        {/* Android Download */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.523 2.047a.5.5 0 0 0-.7.033l-1.636 1.79a7.987 7.987 0 0 0-6.374 0L7.177 2.08a.5.5 0 0 0-.7-.033.5.5 0 0 0-.034.7l1.39 1.522A7.956 7.956 0 0 0 4 10.5v.5h16v-.5a7.956 7.956 0 0 0-3.833-6.231l1.39-1.522a.5.5 0 0 0-.034-.7zM8.5 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm7 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7H4z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Android</h2>
              <p className="text-slate-400">Version {appVersion} • {apkSize}</p>
            </div>
          </div>

          <a 
            href="https://github.com/louisstein94/zkrune/releases/download/v0.2.0-mobile/zkRune-v0.2.0-signed.apk"
            className="block w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-center py-4 px-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity mb-6"
          >
            ⬇️ Download APK
          </a>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Installation Instructions:</h3>
            <ol className="text-sm text-slate-400 space-y-2">
              <li>1. Download the APK file</li>
              <li>2. Open your device Settings → Security</li>
              <li>3. Enable "Install from unknown sources" or "Install unknown apps"</li>
              <li>4. Open the downloaded APK and tap Install</li>
              <li>5. Launch zkRune and enjoy privacy!</li>
            </ol>
          </div>
        </div>

        {/* iOS Coming Soon */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 mb-8 opacity-60">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-600/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-400">iOS</h2>
              <p className="text-slate-500">Coming Soon</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            iOS version is in development. Follow us on Twitter for updates.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-medium text-white mb-1">100% Private</h3>
            <p className="text-sm text-slate-400">ZK proofs generated on-device</p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-medium text-white mb-1">Fast Proofs</h3>
            <p className="text-sm text-slate-400">Generate proofs in seconds</p>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">💎</div>
            <h3 className="font-medium text-white mb-1">Solana Native</h3>
            <p className="text-sm text-slate-400">Built for Solana ecosystem</p>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-emerald-400 text-xl">✓</span>
            <div>
              <h3 className="font-medium text-emerald-400 mb-1">Verified & Signed</h3>
              <p className="text-sm text-slate-400">
                This APK is signed with our official release key. 
                SHA-256: <code className="text-xs bg-slate-800 px-1 rounded">zkrune-release.keystore</code>
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 text-center space-x-4">
          <Link href="/privacy" className="text-cyan-400 hover:underline text-sm">
            Privacy Policy
          </Link>
          <span className="text-slate-600">•</span>
          <a href="https://github.com/louisstein94/zkrune" className="text-cyan-400 hover:underline text-sm">
            Source Code
          </a>
          <span className="text-slate-600">•</span>
          <a href="https://x.com/rune_zk" className="text-cyan-400 hover:underline text-sm">
            Twitter
          </a>
        </div>
      </main>
    </div>
  );
}

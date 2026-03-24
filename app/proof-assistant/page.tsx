'use client';

import Link from 'next/link';
import ProofAssistant from '@/components/ProofAssistant';

export default function ProofAssistantPage() {
  return (
    <main className="min-h-screen bg-zk-darker">
      {/* Header */}
      <header className="border-b border-white/5 px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">←</span>
            <div className="flex items-center gap-2">
              <img src="/zkrune-log.png" alt="zkRune" className="h-6 w-auto" />
              <span className="text-xl font-hatton text-white">zkRune</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="px-3 py-1.5 text-xs border border-zinc-700/40 text-zinc-400 rounded-lg hover:text-white hover:border-zinc-600 transition-all"
            >
              Templates
            </Link>
            <Link
              href="/builder"
              className="px-3 py-1.5 text-xs border border-zinc-700/40 text-zinc-400 rounded-lg hover:text-white hover:border-zinc-600 transition-all"
            >
              Visual Builder
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full mb-4">
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-violet-300 text-xs font-medium">AI-Powered</span>
          </div>
          <h1 className="font-hatton text-4xl text-white mb-3">
            zkBlink
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Describe what you want to prove — zkBlink will craft the proof and generate a shareable Solana Blink. No technical knowledge required.
          </p>
        </div>

        <div className="h-[calc(100vh-20rem)]">
          <ProofAssistant />
        </div>
      </div>
    </main>
  );
}

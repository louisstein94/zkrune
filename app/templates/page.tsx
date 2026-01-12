"use client";

import Navigation from "@/components/Navigation";
import TemplateGallery from "@/components/TemplateGallery";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="pt-28 pb-16">
        {/* Solana Privacy Hack Banner */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 mb-8">
          <div className="p-6 bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-zk-primary/20 border border-purple-500/40 rounded-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🏆</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Solana Privacy Hack 2026</h3>
                  <p className="text-sm text-zk-gray">Build privacy tooling with real ZK proofs</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-xs font-medium text-purple-400">
                  Private Payments
                </span>
                <span className="px-3 py-1.5 bg-zk-primary/20 border border-zk-primary/40 rounded-full text-xs font-medium text-zk-primary">
                  Private Launchpads
                </span>
                <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-medium text-amber-400">
                  Open Track
                </span>
              </div>
            </div>
          </div>
        </div>

        <TemplateGallery />
      </div>
    </main>
  );
}

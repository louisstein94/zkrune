"use client";

import Navigation from "@/components/Navigation";
import TemplateGallery from "@/components/TemplateGallery";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="pt-28 pb-16">
        {/* Product Banner */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 mb-8">
          <div className="p-6 bg-gradient-to-r from-zk-primary/15 via-zk-primary/5 to-purple-500/15 border border-zk-primary/30 rounded-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-zk-primary animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold text-white">Verification Templates</h3>
                  <p className="text-sm text-zk-gray">Production Groth16 circuits for privacy-preserving verification</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-zk-primary/20 border border-zk-primary/40 rounded-full text-xs font-medium text-zk-primary">
                  Access
                </span>
                <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-xs font-medium text-purple-400">
                  Eligibility
                </span>
                <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-medium text-amber-400">
                  Governance
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

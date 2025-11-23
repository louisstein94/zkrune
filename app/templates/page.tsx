"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import TemplateGallery from "@/components/TemplateGallery";

export default function TemplatesPage() {
  const [highlightTemplateId, setHighlightTemplateId] = useState<string | undefined>();

  useEffect(() => {
    // Check if tutorial is active
    const tutorialActive = localStorage.getItem('zkrune_tutorial_active');
    const tutorialStep = localStorage.getItem('zkrune_tutorial_step');
    
    // If tutorial is active and on step 2 (templates page), highlight age-verification
    if (tutorialActive === 'true' && tutorialStep === '2') {
      setHighlightTemplateId('age-verification');
    }
  }, []);

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="pt-24 px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
              <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                ZK Proof Templates
              </span>
            </div>

            <h1 className="font-hatton text-6xl text-white mb-4">
              Choose Your <span className="text-zk-primary">Template</span>
            </h1>
            <p className="text-xl text-zk-gray max-w-2xl mx-auto">
              All 10 templates powered by real Groth16 zk-SNARK circuits. 
              Generate cryptographic proofs in under 1 second.
            </p>
          </div>
        </div>
      </div>

      {/* Template Gallery */}
      <TemplateGallery highlightTemplateId={highlightTemplateId} />
    </main>
  );
}


"use client";

import Navigation from "@/components/Navigation";
import CircuitCanvas from "@/components/circuit-builder/CircuitCanvas";

export default function BuilderPage() {
  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />
      
      <div className="pt-20">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zk-gray/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="font-hatton text-3xl text-white mb-1">
                Visual Circuit Builder
              </h1>
              <p className="text-sm text-zk-gray">
                Design custom zero-knowledge circuits with drag & drop
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary transition-all text-sm">
                Save Circuit
              </button>
              <button className="px-4 py-2 bg-zk-secondary/20 border border-zk-secondary/30 text-zk-secondary rounded-lg hover:bg-zk-secondary/30 transition-all text-sm">
                Test Circuit
              </button>
              <button className="px-4 py-2 bg-zk-primary text-zk-darker rounded-lg hover:bg-zk-primary/90 transition-all text-sm font-medium">
                Compile & Deploy
              </button>
            </div>
          </div>
        </div>

        {/* Circuit Builder */}
        <CircuitCanvas />
      </div>
    </main>
  );
}


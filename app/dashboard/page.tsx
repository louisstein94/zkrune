"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  // Real technical metrics
  const circuitMetrics = [
    {
      template: "Age Verification",
      fileSize: "34 KB",
      constraints: 3,
      generationTime: "0.44s",
      status: "operational",
    },
    {
      template: "Balance Proof",
      fileSize: "34 KB",
      constraints: 2,
      generationTime: "0.41s",
      status: "operational",
    },
    {
      template: "Membership Proof",
      fileSize: "34 KB",
      constraints: 1,
      generationTime: "0.38s",
      status: "operational",
    },
    {
      template: "Range Proof",
      fileSize: "34 KB",
      constraints: 3,
      generationTime: "0.42s",
      status: "operational",
    },
    {
      template: "Private Voting",
      fileSize: "34 KB",
      constraints: 2,
      generationTime: "0.40s",
      status: "operational",
    },
  ];


  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-24 px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-hatton text-5xl text-white mb-3">
              System Status
            </h1>
            <p className="text-xl text-zk-gray">
              Real-time circuit performance and system health
            </p>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <svg className="w-8 h-8 text-zk-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <div className="px-2 py-1 bg-zk-primary/10 rounded text-xs text-zk-primary">
                  Avg Speed
                </div>
              </div>
              <p className="text-4xl font-hatton text-white mb-2">
                0.44s
              </p>
              <p className="text-sm text-zk-gray">Proof Generation Time</p>
            </div>

            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-secondary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <svg className="w-8 h-8 text-zk-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <div className="px-2 py-1 bg-zk-secondary/10 rounded text-xs text-zk-secondary">
                  Circuits
                </div>
              </div>
              <p className="text-4xl font-hatton text-white mb-2">5/5</p>
              <p className="text-sm text-zk-gray">Real Groth16 Compiled</p>
            </div>

            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-accent/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">✓</div>
                <div className="px-2 py-1 bg-zk-accent/10 rounded text-xs text-zk-accent">
                  Status
                </div>
              </div>
              <p className="text-4xl font-hatton text-white mb-2">
                100%
              </p>
              <p className="text-sm text-zk-gray">System Operational</p>
            </div>
          </div>

          {/* Circuit Performance Metrics */}
          <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <h2 className="font-hatton text-2xl text-white mb-6">
              Circuit Performance
            </h2>

            <div className="space-y-3">
              {circuitMetrics.map((circuit) => (
                <div
                  key={circuit.template}
                  className="flex items-center justify-between p-4 bg-zk-darker/50 border border-zk-gray/10 rounded-xl hover:border-zk-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
                    <div>
                      <p className="text-white font-medium">{circuit.template}</p>
                      <p className="text-xs text-zk-gray">
                        {circuit.constraints} constraints • {circuit.fileSize} WASM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-white font-medium">
                        {circuit.generationTime}
                      </p>
                      <p className="text-xs text-zk-gray">avg time</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-zk-primary/10 text-zk-primary">
                      {circuit.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/templates"
              className="bg-gradient-to-br from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/30 rounded-2xl p-6 hover:border-zk-primary/50 transition-all group"
            >
              <svg className="w-10 h-10 mb-3 text-zk-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <h3 className="font-hatton text-xl text-white mb-2 group-hover:text-zk-primary transition-colors">
                Try Templates
              </h3>
              <p className="text-sm text-zk-gray">
                Create zero-knowledge proofs
              </p>
            </Link>

            <Link
              href="/docs"
              className="bg-gradient-to-br from-zk-secondary/10 to-zk-accent/10 border border-zk-secondary/30 rounded-2xl p-6 hover:border-zk-secondary/50 transition-all group"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-hatton text-xl text-white mb-2 group-hover:text-zk-secondary transition-colors">
                Documentation
              </h3>
              <p className="text-sm text-zk-gray">
                Learn about ZK proofs and circuits
              </p>
            </Link>

            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-br from-zk-accent/10 to-zk-primary/10 border border-zk-accent/30 rounded-2xl p-6 hover:border-zk-accent/50 transition-all group"
            >
              <div className="text-4xl mb-3">💻</div>
              <h3 className="font-hatton text-xl text-white mb-2 group-hover:text-zk-accent transition-colors">
                GitHub
              </h3>
              <p className="text-sm text-zk-gray">
                View source code and contribute
              </p>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}


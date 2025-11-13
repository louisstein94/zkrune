"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProofs: 0,
    todayProofs: 0,
    successRate: 0,
  });

  // Mock data - would come from database
  const recentProofs = [
    {
      id: "1",
      template: "Age Verification",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: "success",
      hash: "0x1a2b3c4d...",
    },
    {
      id: "2",
      template: "Balance Proof",
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: "success",
      hash: "0x5e6f7g8h...",
    },
    {
      id: "3",
      template: "Membership Proof",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "success",
      hash: "0x9i0j1k2l...",
    },
  ];

  useEffect(() => {
    // Animate stats
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalProofs: prev.totalProofs < 1234 ? prev.totalProofs + 23 : 1234,
        todayProofs: prev.todayProofs < 45 ? prev.todayProofs + 1 : 45,
        successRate: prev.successRate < 99.8 ? prev.successRate + 0.5 : 99.8,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const minutes = Math.floor(
      (Date.now() - new Date(timestamp).getTime()) / 1000 / 60
    );
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-24 px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-hatton text-5xl text-white mb-3">
              Dashboard
            </h1>
            <p className="text-xl text-zk-gray">
              Track your zero-knowledge proofs and analytics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">📊</div>
                <div className="px-2 py-1 bg-zk-primary/10 rounded text-xs text-zk-primary">
                  All Time
                </div>
              </div>
              <p className="text-4xl font-hatton text-white mb-2">
                {stats.totalProofs.toLocaleString('en-US')}
              </p>
              <p className="text-sm text-zk-gray">Total Proofs Generated</p>
            </div>

            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-secondary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">⚡</div>
                <div className="px-2 py-1 bg-zk-secondary/10 rounded text-xs text-zk-secondary">
                  Today
                </div>
              </div>
              <p className="text-4xl font-hatton text-white mb-2">{stats.todayProofs}</p>
              <p className="text-sm text-zk-gray">Proofs Today</p>
            </div>

            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-6 hover:border-zk-accent/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">✓</div>
                <div className="px-2 py-1 bg-zk-accent/10 rounded text-xs text-zk-accent">
                  Success
                </div>
              </div>
              <p className="text-4xl font-hatton text-white mb-2">
                {stats.successRate.toFixed(1)}%
              </p>
              <p className="text-sm text-zk-gray">Success Rate</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <h2 className="font-hatton text-2xl text-white mb-6">
              Recent Proofs
            </h2>

            <div className="space-y-3">
              {recentProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="flex items-center justify-between p-4 bg-zk-darker/50 border border-zk-gray/10 rounded-xl hover:border-zk-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        proof.status === "success"
                          ? "bg-zk-primary"
                          : "bg-zk-accent"
                      }`}
                    />
                    <div>
                      <p className="text-white font-medium">{proof.template}</p>
                      <p className="text-xs text-zk-gray">
                        {formatTimeAgo(proof.timestamp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <code className="text-xs text-zk-gray font-mono">
                      {proof.hash}
                    </code>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        proof.status === "success"
                          ? "bg-zk-primary/10 text-zk-primary"
                          : "bg-zk-accent/10 text-zk-accent"
                      }`}
                    >
                      {proof.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for no proofs */}
            {recentProofs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔮</div>
                <p className="text-xl text-white font-hatton mb-2">
                  No proofs yet
                </p>
                <p className="text-zk-gray mb-6">
                  Generate your first ZK proof to see it here
                </p>
                <Link
                  href="/#templates"
                  className="inline-block px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all"
                >
                  Browse Templates
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/#templates"
              className="bg-gradient-to-br from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/30 rounded-2xl p-6 hover:border-zk-primary/50 transition-all group"
            >
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-hatton text-xl text-white mb-2 group-hover:text-zk-primary transition-colors">
                Generate New Proof
              </h3>
              <p className="text-sm text-zk-gray">
                Browse templates and create your next ZK proof
              </p>
            </Link>

            <div className="bg-gradient-to-br from-zk-secondary/10 to-zk-accent/10 border border-zk-secondary/30 rounded-2xl p-6 hover:border-zk-secondary/50 transition-all group cursor-pointer">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-hatton text-xl text-white mb-2 group-hover:text-zk-secondary transition-colors">
                Learn More
              </h3>
              <p className="text-sm text-zk-gray">
                Explore documentation and tutorials
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


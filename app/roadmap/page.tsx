"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";

const phases = [
  {
    id: 1,
    label: "Phase 1",
    title: "Core Infrastructure",
    period: "Q4 2025 – Q1 2026",
    status: "completed",
    color: "zk-primary",
    colorHex: "#6366F1",
    items: [
      { text: "Groth16 zk-SNARK circuit infrastructure", done: true },
      { text: "13 production-ready verification circuits", done: true },
      { text: "100% client-side proof generation", done: true },
      { text: "Visual Circuit Builder", done: true },
      { text: "Verification template gallery", done: true },
      { text: "NPM SDK & CLI published", done: true },
      { text: "PWA + Android APK", done: true },
      { text: "Hosted proof verification API", done: true },
    ],
  },
  {
    id: 2,
    label: "Phase 2",
    title: "Token & Product Launch",
    period: "Q1 2026 – Q2 2026",
    status: "active",
    color: "zk-accent",
    colorHex: "#8B5CF6",
    items: [
      { text: "zkRUNE token launched on Solana", done: true },
      { text: "Template marketplace live (95% to creators)", done: true },
      { text: "Premium tiers with burn mechanism", done: true },
      { text: "Mobile ZK Wallet — Android APK", done: true },
      { text: "Trusted Setup Ceremony completed (multi-party)", done: true },
      { text: "Pre-audit security hardening", done: true },
      { text: "Trust model published (production / self-asserted / experimental)", done: true },
      { text: "Groth16 Verifier deployed on Solana mainnet", done: true },
      { text: "Staking program mainnet migration", done: false },
    ],
  },
  {
    id: 3,
    label: "Phase 3",
    title: "Prove with zkRune",
    period: "Q3 – Q4 2026",
    status: "upcoming",
    color: "zk-secondary",
    colorHex: "#34D399",
    items: [
      { text: "Embeddable verification widget (script-tag integration)", done: true },
      { text: "First 3 integrations onboarded", done: false },
      { text: "On-chain data source for balance proof (Solana RPC)", done: true },
      { text: "Issuer / registry model for membership proof", done: true },
      { text: "3rd party security audit", done: false },
      { text: "iOS app", done: false },
      { text: "Integration docs & developer portal", done: true },
      { text: "Self-asserted → attested upgrade path for age proof", done: false },
    ],
  },
  {
    id: 4,
    label: "Phase 4",
    title: "Scale & Ecosystem",
    period: "2027+",
    status: "future",
    color: "zk-gray",
    colorHex: "#9CA3AF",
    items: [
      { text: "Cross-chain proof verification (Ethereum, Base)", done: false },
      { text: "ZK credential standard (W3C compatible)", done: false },
      { text: "On-chain governance with quadratic voting", done: false },
      { text: "Enterprise SDK & white-label solutions", done: false },
      { text: "Developer grants program", done: false },
      { text: "Advanced circuit types (recursive SNARKs)", done: false },
      { text: "Decentralized proof relay network", done: false },
      { text: "Institutional privacy tooling", done: false },
    ],
  },
];

const statusMeta = {
  completed: {
    label: "Completed",
    badge: "bg-zk-primary/15 text-zk-primary border-zk-primary/30",
    dot: "bg-zk-primary",
  },
  active: {
    label: "In Progress",
    badge: "bg-zk-accent/15 text-zk-accent border-zk-accent/30",
    dot: "bg-zk-accent animate-pulse",
  },
  upcoming: {
    label: "Upcoming",
    badge: "bg-zk-secondary/10 text-zk-secondary border-zk-secondary/30",
    dot: "bg-zk-secondary",
  },
  future: {
    label: "Future",
    badge: "bg-zk-gray/10 text-zk-gray border-zk-gray/30",
    dot: "bg-zk-gray",
  },
};

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen bg-zk-darker overflow-hidden">
      <Navigation />

      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-zk-primary/5 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="noise-texture absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zk-primary/10 border border-zk-primary/30 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-sm font-bold text-zk-primary uppercase tracking-wider">
              Public Roadmap
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-6xl text-white mb-5">
            Product
            <br />
            <span className="text-zk-primary">Roadmap</span>
          </h1>
          <p className="text-lg text-zk-gray max-w-2xl mx-auto leading-relaxed">
            From core verification infrastructure to embeddable privacy tooling.
            Here is what we shipped, what we are building, and what comes next.
          </p>
        </div>

        {/* Progress bar overview */}
        <div className="mb-20 p-6 bg-zk-dark/50 border border-white/5 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-zk-gray uppercase tracking-wider">Overall Progress</span>
            <span className="text-sm font-bold text-zk-primary">Phase 2 / 4</span>
          </div>
          <div className="h-2 bg-zk-darker rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zk-primary via-zk-accent to-zk-secondary/50 transition-all duration-1000"
              style={{ width: "45%" }}
            />
          </div>
          <div className="flex justify-between mt-3">
            {phases.map((p) => (
              <span
                key={p.id}
                className={`text-xs font-medium ${
                  p.status === "completed"
                    ? "text-zk-primary"
                    : p.status === "active"
                    ? "text-purple-400"
                    : "text-zk-gray/40"
                }`}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-zk-primary/50 via-purple-500/30 to-transparent" />

          <div className="space-y-16">
            {phases.map((phase, idx) => {
              const meta = statusMeta[phase.status as keyof typeof statusMeta];
              const isRight = idx % 2 === 0;
              const completedCount = phase.items.filter((i) => i.done).length;
              const pct = Math.round((completedCount / phase.items.length) * 100);

              return (
                <div
                  key={phase.id}
                  className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                    isRight ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 top-8 -translate-x-1/2 z-10">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-zk-darker"
                      style={{ backgroundColor: phase.colorHex }}
                    />
                  </div>

                  {/* Spacer for alternating layout on desktop */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Card */}
                  <div className="ml-16 md:ml-0 md:w-1/2">
                    <div
                      className="group p-6 md:p-8 bg-zk-dark/60 border rounded-2xl backdrop-blur-sm hover:bg-zk-dark/80 transition-all duration-300"
                      style={{ borderColor: `${phase.colorHex}20` }}
                    >
                      {/* Phase header */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${meta.badge}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs text-zk-gray/60 font-mono mb-1">{phase.period}</p>
                          <h2 className="font-hatton text-2xl text-white">
                            <span style={{ color: phase.colorHex }}>{phase.label}:</span>{" "}
                            {phase.title}
                          </h2>
                        </div>

                        {/* Circle progress */}
                        <div className="relative w-14 h-14 flex-shrink-0">
                          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              fill="none"
                              stroke="rgba(255,255,255,0.05)"
                              strokeWidth="4"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="22"
                              fill="none"
                              stroke={phase.colorHex}
                              strokeWidth="4"
                              strokeDasharray={`${(pct / 100) * 138.2} 138.2`}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <span
                            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                            style={{ color: phase.colorHex }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <ul className="space-y-2.5">
                        {phase.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span
                              className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: item.done
                                  ? `${phase.colorHex}20`
                                  : "rgba(255,255,255,0.04)",
                                border: `1px solid ${
                                  item.done ? `${phase.colorHex}60` : "rgba(255,255,255,0.08)"
                                }`,
                              }}
                            >
                              {item.done ? (
                                <svg
                                  className="w-2.5 h-2.5"
                                  fill="none"
                                  viewBox="0 0 10 10"
                                  style={{ stroke: phase.colorHex }}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1.5 5l2.5 2.5 4.5-4" />
                                </svg>
                              ) : (
                                <span
                                  className="w-1 h-1 rounded-full bg-zk-gray/30"
                                />
                              )}
                            </span>
                            <span
                              className={`text-sm leading-relaxed ${
                                item.done ? "text-white" : "text-zk-gray/60"
                              }`}
                            >
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 p-8 md:p-10 bg-gradient-to-br from-zk-primary/10 to-purple-500/10 border border-zk-primary/25 rounded-3xl text-center">
          <h3 className="font-hatton text-2xl md:text-3xl text-white mb-3">
            Start Integrating
          </h3>
          <p className="text-zk-gray mb-8 max-w-xl mx-auto">
            Add privacy-preserving verification to your app today.
            SDK, hosted verifier, and integration docs are ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/docs"
              className="px-8 py-3 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
            >
              Read Integration Guide
            </Link>
            <a
              href="https://x.com/rune_zk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all"
            >
              Follow Updates
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

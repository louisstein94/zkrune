"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";

const groups = [
  {
    id: "shipped",
    title: "Shipped",
    status: "shipped",
    color: "zk-primary",
    colorHex: "#6366F1",
    blurb: "Live today and usable in production.",
    items: [
      "Groth16 zk-SNARK circuit infrastructure",
      "14 production-ready verification circuits",
      "100% client-side proof generation",
      "Visual Circuit Builder",
      "Verification template gallery",
      "NPM SDK & CLI published",
      "Hosted proof verification API",
      "Embeddable verification widget (script-tag integration)",
      "Groth16 verifier deployed on Solana mainnet",
      "Cross-chain proof verification (Ethereum, Base)",
      "On-chain data source for balance proof",
      "Issuer / registry model for membership proof",
      "Trust model published (production / self-asserted / experimental)",
      "Integration docs & developer portal",
      "PWA + Android APK",
    ],
  },
  {
    id: "building",
    title: "In Progress",
    status: "building",
    color: "zk-accent",
    colorHex: "#8B5CF6",
    blurb: "Actively being worked on. Not ready to depend on yet.",
    items: [
      "Multi-party trusted setup re-ceremony (13 of 14 production circuits are currently single-party)",
      "Third-party security audit",
      "Self-asserted to attested upgrade path for age proof",
      "Enterprise SDK and white-label distribution",
    ],
  },
  {
    id: "exploring",
    title: "Exploring",
    status: "exploring",
    color: "zk-gray",
    colorHex: "#9CA3AF",
    blurb: "Under investigation. No commitment implied.",
    items: [
      "Eligibility circuits for regulated and tokenized assets",
      "Selective disclosure for auditor and regulator review",
      "Recursive SNARKs for advanced circuit composition",
      "W3C zero-knowledge credential standard",
      "Verification on additional L2s",
      "iOS application",
    ],
  },
];

const statusMeta = {
  shipped: {
    label: "Shipped",
    badge: "bg-zk-primary/15 text-zk-primary border-zk-primary/30",
    dot: "bg-zk-primary",
  },
  building: {
    label: "In Progress",
    badge: "bg-zk-accent/15 text-zk-accent border-zk-accent/30",
    dot: "bg-zk-accent animate-pulse",
  },
  exploring: {
    label: "Exploring",
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
            What is live today, what we are actively building, and what we are
            still investigating. We do not publish dates, because we would rather
            be accurate than early.
          </p>
        </div>

        {/* Trust disclosure */}
        <div className="mb-20 p-6 bg-zk-accent/5 border border-zk-accent/25 rounded-2xl backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-zk-accent animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-zk-accent uppercase tracking-wider mb-2">
                Current trust status
              </h2>
              <p className="text-sm text-zk-gray leading-relaxed">
                13 of 14 production circuits are compiled from a single-party
                trusted setup. A fresh multi-party re-ceremony is pending and is our
                current priority. Until it completes, treat soundness as depending on
                that setup, and read the{" "}
                <Link href="/trust" className="text-zk-accent hover:underline">
                  trust model
                </Link>{" "}
                and{" "}
                <Link href="/ceremony" className="text-zk-accent hover:underline">
                  ceremony status
                </Link>{" "}
                before relying on a proof in an adversarial setting.
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-zk-primary/50 via-purple-500/30 to-transparent" />

          <div className="space-y-16">
            {groups.map((group, idx) => {
              const meta = statusMeta[group.status as keyof typeof statusMeta];
              const isRight = idx % 2 === 0;

              return (
                <div
                  key={group.id}
                  className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                    isRight ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 top-8 -translate-x-1/2 z-10">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-zk-darker"
                      style={{ backgroundColor: group.colorHex }}
                    />
                  </div>

                  {/* Spacer for alternating layout on desktop */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Card */}
                  <div className="ml-16 md:ml-0 md:w-1/2">
                    <div
                      className="group p-6 md:p-8 bg-zk-dark/60 border rounded-2xl backdrop-blur-sm hover:bg-zk-dark/80 transition-all duration-300"
                      style={{ borderColor: `${group.colorHex}20` }}
                    >
                      {/* Group header */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${meta.badge}`}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <h2
                            className="font-hatton text-2xl text-white mb-2"
                            style={{ color: group.colorHex }}
                          >
                            {group.title}
                          </h2>
                          <p className="text-sm text-zk-gray/70 leading-relaxed">
                            {group.blurb}
                          </p>
                        </div>

                        <span
                          className="flex-shrink-0 text-xs font-mono px-2.5 py-1 rounded-full border"
                          style={{
                            color: group.colorHex,
                            borderColor: `${group.colorHex}40`,
                            backgroundColor: `${group.colorHex}10`,
                          }}
                        >
                          {group.items.length}
                        </span>
                      </div>

                      {/* Items */}
                      <ul className="space-y-2.5">
                        {group.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span
                              className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: `${group.colorHex}90` }}
                            />
                            <span className="text-sm leading-relaxed text-zk-gray">
                              {item}
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

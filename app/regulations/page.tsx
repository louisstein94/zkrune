// Public matrix of EU/UK regulations × the zkRune circuits and
// integration paths that address them. Data lives in lib/regulations.ts
// — this file is rendering only. Adding a regulation means editing one
// data entry; no code change here.

import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import {
  CATEGORY_BLURBS,
  CATEGORY_ORDER,
  STATUS_LABELS,
  getRegulationsByCategory,
  type Regulation,
  type RegulationStatus,
} from "@/lib/regulations";

export const metadata: Metadata = {
  title: "Regulations — zkRune",
  description:
    "How zkRune maps to EU and UK regulations: AI Act, DSA, eIDAS 2.0, MiCA, DORA, NIS2, GDPR, UK Online Safety Act. One privacy-preserving architecture, many compliance surfaces.",
  alternates: { canonical: "https://zkrune.com/regulations" },
  openGraph: {
    title: "Regulations — zkRune",
    description:
      "How zkRune resolves the EU's data-minimisation vs. logging-mandate paradox across the AI Act, DSA, eIDAS 2.0, MiCA, DORA, NIS2, GDPR, and UK Online Safety Act.",
    url: "https://zkrune.com/regulations",
    siteName: "zkRune",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Regulations — zkRune",
    description:
      "How zkRune maps to EU and UK regulations: AI Act, DSA, eIDAS 2.0, MiCA, DORA, NIS2, GDPR.",
    images: ["/og-image.png"],
  },
};

const STATUS_STYLES: Record<RegulationStatus, string> = {
  "binding": "bg-zk-secondary/15 text-zk-secondary border-zk-secondary/30",
  "transposing": "bg-zk-accent/15 text-zk-accent border-zk-accent/30",
  "rolling-out": "bg-zk-primary/15 text-zk-primary border-zk-primary/30",
  "in-draft": "bg-zk-gray/15 text-zk-gray border-zk-gray/30",
};

function StatusBadge({ status }: { status: RegulationStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/10 bg-zk-darker/60 text-[11px] font-mono text-zk-gray">
      {children}
    </span>
  );
}

function RegulationCard({ regulation }: { regulation: Regulation }) {
  return (
    <article
      id={regulation.slug}
      className="p-6 md:p-7 rounded-2xl border border-white/10 bg-zk-dark/50 hover:border-zk-primary/30 transition-colors"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold text-zk-primary uppercase tracking-[0.2em] mb-1">
            {regulation.shortName}
          </p>
          <h3 className="font-hatton text-xl md:text-2xl text-white">
            {regulation.name}
          </h3>
          <p className="text-xs text-zk-gray/70 mt-1 font-mono">
            {regulation.jurisdiction} · {regulation.bindingDate}
          </p>
        </div>
        <StatusBadge status={regulation.status} />
      </header>

      <div className="space-y-4 text-sm leading-relaxed">
        <div>
          <p className="text-[11px] font-bold text-zk-gray uppercase tracking-[0.2em] mb-1">
            The paradox
          </p>
          <p className="text-zk-gray">{regulation.problem}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold text-zk-primary uppercase tracking-[0.2em] mb-1">
            How zkRune helps
          </p>
          <p className="text-white">{regulation.zkRuneFit}</p>
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-bold text-zk-gray uppercase tracking-[0.2em] mb-2">
            Mapped circuits
          </p>
          <div className="flex flex-wrap gap-1.5">
            {regulation.mappedCircuits.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-zk-gray uppercase tracking-[0.2em] mb-2">
            Integration paths
          </p>
          <div className="flex flex-wrap gap-1.5">
            {regulation.integrationPaths.map((p) => (
              <Chip key={p}>{p}</Chip>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs">
        {regulation.goesDeeper && (
          <a
            href={regulation.goesDeeper.href}
            className="text-zk-primary hover:text-zk-primary/80 transition-colors font-medium"
          >
            {regulation.goesDeeper.label} →
          </a>
        )}
        <a
          href={regulation.externalReference.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zk-gray hover:text-zk-primary transition-colors"
        >
          {regulation.externalReference.label} ↗
        </a>
        <span className="ml-auto text-zk-gray/40 font-mono text-[10px]">
          reviewed {regulation.lastReviewed}
        </span>
      </footer>
    </article>
  );
}

export default function RegulationsPage() {
  const grouped = getRegulationsByCategory();

  return (
    <main className="relative min-h-screen bg-zk-darker text-white overflow-hidden font-dm-sans">
      <Navigation />

      <div className="noise-texture absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[60%] h-[700px] overflow-hidden pointer-events-none">
        <div className="absolute top-28 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-primary/10 blur-[120px]" />
        <div className="absolute top-56 right-1/3 w-[400px] h-[400px] rounded-full bg-zk-accent/8 blur-[100px]" />
      </div>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pt-36 pb-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
              Regulations
            </span>
          </div>
          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white max-w-4xl">
            One architecture,<br />
            <span className="text-zk-primary">many compliance surfaces.</span>
          </h1>
          <p className="text-lg text-zk-gray max-w-3xl leading-relaxed">
            Almost every new EU regulation creates the same paradox: <em>log
            every decision</em> on one side, <em>store no personal data</em>{" "}
            on the other. zkRune is the cryptographic architecture that
            satisfies both at once. This page maps the major regulations to
            the circuits and integration paths that address them.
          </p>
          <p className="text-sm text-zk-gray/70 max-w-3xl">
            Mapping is informational — not a legal opinion. Cite the linked
            regulator sources and consult counsel before claiming compliance.
          </p>
        </div>
      </section>

      {/* MATRIX */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 pb-20 max-w-5xl mx-auto">
        <div className="space-y-14">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category];
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <header className="mb-6">
                  <h2 className="font-hatton text-2xl md:text-3xl text-white mb-2">
                    {category}
                  </h2>
                  <p className="text-sm text-zk-gray max-w-3xl">
                    {CATEGORY_BLURBS[category]}
                  </p>
                </header>
                <div className="space-y-5">
                  {items.map((reg) => (
                    <RegulationCard key={reg.slug} regulation={reg} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="font-hatton text-3xl md:text-4xl text-white">
            Compliance-driven evaluation?
          </h2>
          <p className="text-zk-gray max-w-2xl mx-auto">
            We work directly with privacy officers, DPOs, and compliance leads
            on regulation-specific integrations. The fastest path is a 30-minute
            technical session.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:zkruneprotocol@gmail.com?subject=zkRune%20compliance%20session"
              className="px-8 py-3 bg-zk-primary text-white font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105"
            >
              Email compliance@
            </a>
            <a
              href="/enterprise"
              className="px-8 py-3 border border-zk-primary/30 text-zk-primary font-medium rounded-full hover:border-zk-primary hover:bg-zk-primary/10 transition-all"
            >
              EU AI Act mapping →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

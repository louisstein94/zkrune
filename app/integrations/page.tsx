import type { Metadata } from "next";
import {
  integrations,
  getIntegrationsByCategory,
  CATEGORY_ORDER,
  CATEGORY_BLURBS,
} from "@/lib/integrations";
import { IntegrationGrid } from "@/components/integrations/IntegrationGrid";

export const metadata: Metadata = {
  title: "zkRune across Agents and Browsers — Integrations",
  description:
    "Privacy verification reference designs across the agent economy and browser surfaces. One ZK layer, two markets.",
  alternates: { canonical: "https://zkrune.com/integrations" },
};

const referenceCount = integrations.filter((i) => i.tier === "Reference").length;
const conceptCount = integrations.filter((i) => i.tier === "Concept").length;

export default function IntegrationsIndex() {
  const grouped = getIntegrationsByCategory();

  return (
    <>
      <section className="px-6 md:px-12 lg:px-16 pt-32 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-primary/40 bg-zk-primary/10 rounded-full backdrop-blur-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            <span className="text-xs font-bold text-zk-primary uppercase tracking-wider">
              Reference designs
            </span>
          </div>

          <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
            zkRune across
            <br />
            <span className="text-zk-primary">agents and browsers</span>.
          </h1>
          <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
            One ZK layer, two surfaces. Embedded as a primitive in the agent
            economy — x402 endpoints, AI marketplaces, onchain creators.
            Surfaced as a browser-native proof in the consumer web — wallets,
            extensions, every place a site asks for personal data.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-zk-gray">
            <span>
              <span className="text-white font-semibold">
                {referenceCount}
              </span>{" "}
              reference design{referenceCount !== 1 ? "s" : ""}
            </span>
            <span>
              <span className="text-white font-semibold">{conceptCount}</span>{" "}
              concept{conceptCount !== 1 ? "s" : ""}
            </span>
            <span>
              Posting one a day — share via{" "}
              <a
                href="https://x.com/zkrune"
                target="_blank"
                rel="noreferrer"
                className="text-zk-primary hover:underline"
              >
                @zkrune
              </a>
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-20">
        <div className="max-w-7xl mx-auto space-y-16">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category];
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="font-hatton text-2xl md:text-3xl text-white">
                    {category}
                  </h2>
                  <span className="text-xs uppercase tracking-[0.18em] text-zk-gray/70">
                    {items.length}{" "}
                    integration{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-zk-gray max-w-3xl mb-6 leading-relaxed">
                  {CATEGORY_BLURBS[category]}
                </p>
                <IntegrationGrid integrations={items} />
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 pb-24">
        <div className="max-w-3xl mx-auto p-8 bg-zk-dark/40 border border-zk-gray/15 rounded-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-zk-gray/70 mb-3">
            Note on tiers
          </p>
          <p className="text-sm text-zk-gray leading-relaxed">
            <span className="text-white font-semibold">Reference</span> means
            the integration is a community-built design, not an official
            partnership — the ZK proof and on-chain verification steps are real
            zkRune infrastructure, while the partner-side call may be simulated
            for demo purposes. <span className="text-white font-semibold">Concept</span>{" "}
            means a proposed architecture, open for collaboration. We are not
            affiliated with any of the projects listed unless explicitly noted.
          </p>
          <a
            href="mailto:zkruneprotocol@gmail.com?subject=Integration%20with%20zkRune"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-zk-primary to-zk-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Build one with us
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
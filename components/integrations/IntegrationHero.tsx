import type { Integration } from "@/lib/integrations";
import { TierBadge } from "./TierBadge";
import { ChainBadge } from "./ChainBadge";

export function IntegrationHero({
  integration,
}: {
  integration: Integration;
}) {
  return (
    <section className="relative px-6 md:px-12 lg:px-16 pt-32 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <ChainBadge chain={integration.chain} />
          <TierBadge tier={integration.tier} />
        </div>

        <h1 className="font-hatton text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
          {integration.name}
        </h1>
        <p className="text-lg md:text-xl text-zk-gray max-w-3xl leading-relaxed">
          {integration.tagline}
        </p>

        <p className="mt-6 text-base text-white/80 max-w-3xl leading-relaxed">
          {integration.description}
        </p>

        {integration.links && (
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {integration.links.site && (
              <a
                href={integration.links.site}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zk-gray/20 rounded-lg text-zk-gray hover:text-white hover:border-zk-primary/40 transition-colors"
              >
                Website
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
            {integration.links.x && (
              <a
                href={integration.links.x}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zk-gray/20 rounded-lg text-zk-gray hover:text-white hover:border-zk-primary/40 transition-colors"
              >
                X / Twitter
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
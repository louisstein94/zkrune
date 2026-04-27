import Link from "next/link";
import type { Integration } from "@/lib/integrations";
import { TierBadge } from "./TierBadge";
import { ChainBadge } from "./ChainBadge";

export function IntegrationCard({ integration }: { integration: Integration }) {
  const href = `/integrations/${integration.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col h-full p-6 bg-zk-dark/40 border border-zk-gray/15 rounded-2xl hover:border-zk-primary/40 hover:bg-zk-dark/60 transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-5">
        <ChainBadge chain={integration.chain} />
        <TierBadge tier={integration.tier} />
      </div>

      <h3 className="font-hatton text-2xl text-white mb-2">
        {integration.name}
      </h3>
      <p className="text-sm text-zk-gray mb-5 leading-relaxed">
        {integration.tagline}
      </p>

      <div className="mt-auto pt-4 border-t border-zk-gray/10">
        <p className="text-xs uppercase tracking-wider text-zk-gray/70 mb-2">
          Use case
        </p>
        <p className="text-sm text-white/90 mb-4">{integration.useCase}</p>

        <span className="inline-flex items-center gap-1 text-sm text-zk-primary group-hover:text-white transition-colors">
          Open integration
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
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
        </span>
      </div>
    </Link>
  );
}
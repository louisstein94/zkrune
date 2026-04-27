import type { IntegrationTier } from "@/data/integrations";

const STYLES: Record<IntegrationTier, string> = {
  Reference:
    "border-zk-primary/40 bg-zk-primary/10 text-zk-primary",
  Concept: "border-zk-gray/30 bg-zk-gray/10 text-zk-gray",
};

export function TierBadge({ tier }: { tier: IntegrationTier }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-[0.18em] ${STYLES[tier]}`}
    >
      {tier}
    </span>
  );
}
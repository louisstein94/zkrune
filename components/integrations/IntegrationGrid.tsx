import type { Integration } from "@/lib/integrations";
import { IntegrationCard } from "./IntegrationCard";

export function IntegrationGrid({
  integrations,
}: {
  integrations: Integration[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.slug} integration={integration} />
      ))}
    </div>
  );
}
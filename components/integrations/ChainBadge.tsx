import type { IntegrationChain } from "@/data/integrations";

const STYLES: Record<IntegrationChain, string> = {
  Solana: "border-purple-400/40 bg-purple-500/10 text-purple-300",
  Sui: "border-cyan-400/40 bg-cyan-500/10 text-cyan-300",
  Base: "border-blue-400/40 bg-blue-500/10 text-blue-300",
  "SKALE on Base": "border-blue-400/40 bg-blue-500/10 text-blue-300",
  "Cross-chain": "border-zk-accent/40 bg-zk-accent/10 text-zk-accent",
};

export function ChainBadge({ chain }: { chain: IntegrationChain }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 border rounded-full text-[10px] font-medium uppercase tracking-wider ${STYLES[chain]}`}
    >
      {chain}
    </span>
  );
}
export type IntegrationTier = "Reference" | "Concept";
export type IntegrationChain =
  | "Solana"
  | "Sui"
  | "Base"
  | "SKALE on Base"
  | "Cross-chain";

export interface Integration {
  slug: string;
  name: string;
  tagline: string;
  chain: IntegrationChain;
  tier: IntegrationTier;
  useCase: string;
  description: string;
  links?: {
    site?: string;
    x?: string;
  };
  hasDemo?: boolean;
}

export const integrations: Integration[] = [
  {
    slug: "xona",
    name: "Xona Agent",
    tagline: "Creative AI on x402, gated by zkRune.",
    chain: "SKALE on Base",
    tier: "Reference",
    useCase: "Age-proof gated x402 image generation",
    description:
      "Xona Agent serves premium AI image and video generation through x402 micro-payments. zkRune adds a privacy-preserving eligibility gate in front of any Xona endpoint — users prove they are 18+ (or licensed, jurisdictionally allowed, brand-approved) without exposing the underlying identity.",
    links: {
      site: "https://xona-agent.com",
      x: "https://x.com/xona_agent",
    },
    hasDemo: true,
  },
  {
    slug: "dexter",
    name: "Dexter",
    tagline: "ZK-eligibility for marketplace listings.",
    chain: "Solana",
    tier: "Concept",
    useCase: "Private buyer eligibility for x402 marketplaces",
    description:
      "Dexter is the marketplace layer for x402 services and AI agents. zkRune lets buyers prove eligibility — region, license, age, KYB tier — without exposing their wallet history or identity to the seller, the marketplace, or any indexer.",
    hasDemo: false,
  },
  {
    slug: "payai",
    name: "PayAI",
    tagline: "Private creator-payment routing.",
    chain: "Solana",
    tier: "Concept",
    useCase: "Proof-of-jurisdiction for payouts",
    description:
      "PayAI handles agent-to-agent and creator payments on Solana. zkRune adds a jurisdictional proof layer: a creator proves they are paying out into a permitted jurisdiction without revealing the actual country, while PayAI gets a regulator-shaped audit trail.",
    hasDemo: false,
  },
  {
    slug: "relai",
    name: "RelAI",
    tagline: "ZK reputation for AI relay agents.",
    chain: "Solana",
    tier: "Concept",
    useCase: "Anonymous reputation for relay agents",
    description:
      "RelAI relays prompts and tools between agents. zkRune lets a relay prove it has served N successful jobs above a quality threshold, without leaking which jobs, which counterparties, or which prompts. Anonymous reputation, verifiable on-chain.",
    hasDemo: false,
  },
  {
    slug: "x402",
    name: "x402 Protocol",
    tagline: "A ZK middleware spec for any paid endpoint.",
    chain: "Cross-chain",
    tier: "Concept",
    useCase: "Generic ZK gate for x402 endpoints",
    description:
      "x402 is a payment protocol — it answers who pays. zkRune adds the orthogonal answer to who is allowed. A reference middleware spec wraps any x402 endpoint with a zkRune verifier check, so payment and eligibility are enforced together at the HTTP layer.",
    hasDemo: false,
  },
  {
    slug: "erc-8004",
    name: "ERC-8004 Agent Identity",
    tagline: "ZK-augmented agent passports on Base.",
    chain: "Base",
    tier: "Concept",
    useCase: "Selective disclosure for agent identity",
    description:
      "ERC-8004 gives autonomous agents an on-chain identity primitive. zkRune extends it with selective-disclosure proofs — an agent reveals it is licensed, audited, or paid up, without exposing its full credential graph. Same passport, fewer leaks.",
    hasDemo: false,
  },
  {
    slug: "syra",
    name: "Syra",
    tagline: "Private creative-asset licensing.",
    chain: "Solana",
    tier: "Concept",
    useCase: "Proof of license without revealing identity",
    description:
      "Syra licenses creative assets between agents and creators. zkRune lets a downstream user prove they hold a valid license to remix or redistribute an asset without revealing which license, which contract, or which wallet — and the licensor still gets a verifiable usage trail.",
    hasDemo: false,
  },
];

export function getIntegration(slug: string): Integration | undefined {
  return integrations.find((i) => i.slug === slug);
}
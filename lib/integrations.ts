export type IntegrationTier = "Reference" | "Concept";
export type IntegrationCategory = "Agent Economy" | "Browser & Wallet";
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
  category: IntegrationCategory;
  useCase: string;
  description: string;
  links?: {
    site?: string;
    x?: string;
  };
  hasDemo?: boolean;
}

export const CATEGORY_ORDER: IntegrationCategory[] = [
  "Agent Economy",
  "Browser & Wallet",
];

export const CATEGORY_BLURBS: Record<IntegrationCategory, string> = {
  "Agent Economy":
    "Privacy gates for x402 endpoints, AI marketplaces, and onchain creators. The B2B surface — embedded as a primitive in services agents already use.",
  "Browser & Wallet":
    "Browser-native ZK primitives — replace data uploads and PII forms with proofs. The B2C surface — wherever a website asks the user for something a circuit can answer.",
};

export const integrations: Integration[] = [
  {
    slug: "xona",
    name: "Xona Agent",
    tagline: "Creative AI on x402, gated by zkRune.",
    chain: "SKALE on Base",
    tier: "Reference",
    category: "Agent Economy",
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
    category: "Agent Economy",
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
    category: "Agent Economy",
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
    category: "Agent Economy",
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
    category: "Agent Economy",
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
    category: "Agent Economy",
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
    category: "Agent Economy",
    useCase: "Proof of license without revealing identity",
    description:
      "Syra licenses creative assets between agents and creators. zkRune lets a downstream user prove they hold a valid license to remix or redistribute an asset without revealing which license, which contract, or which wallet — and the licensor still gets a verifiable usage trail.",
    hasDemo: false,
  },
  {
    slug: "brave",
    name: "Brave Browser",
    tagline: "ZK proofs as a browser-native primitive.",
    chain: "Cross-chain",
    tier: "Concept",
    category: "Browser & Wallet",
    useCase: "Native ZK eligibility inside the browser and wallet",
    description:
      "Brave already ships privacy-first defaults, a multi-chain wallet across Solana and EVM, and prior ZK research around login and age verification. zkRune fits as a browser-native ZK primitive: Brave Wallet proves balance, NFT, or membership claims without exposing addresses, and a 'Zero-Knowledge Browsing' mode delivers proofs to verification prompts instead of personal data.",
    links: {
      site: "https://brave.com",
    },
    hasDemo: false,
  },
  {
    slug: "browser-agent",
    name: "ZK Form-Fill Agent",
    tagline: "An extension that pastes proofs instead of personal data.",
    chain: "Cross-chain",
    tier: "Concept",
    category: "Browser & Wallet",
    useCase: "Drop-in eligibility wherever a site asks for it",
    description:
      "When a site requests age, balance, jurisdiction, license, or membership, the extension intercepts the form and replaces the data with a zkRune proof. Same primitive across age-gates, KYC checkpoints, eligibility forms, and credential checks. Adjacent to Reclaim Protocol and zkPass; the differentiator is 13 production circuits and live multi-chain on-chain verifiers.",
    hasDemo: false,
  },
];

export function getIntegration(slug: string): Integration | undefined {
  return integrations.find((i) => i.slug === slug);
}

export function getIntegrationsByCategory(): Record<
  IntegrationCategory,
  Integration[]
> {
  const grouped: Record<IntegrationCategory, Integration[]> = {
    "Agent Economy": [],
    "Browser & Wallet": [],
  };
  for (const integration of integrations) {
    grouped[integration.category].push(integration);
  }
  return grouped;
}
// zkRune Token Configuration
// Solana SPL Token integration

export const ZKRUNE_TOKEN = {
  // Token mint address (Solana mainnet - Pump.fun)
  MINT_ADDRESS: process.env.NEXT_PUBLIC_ZKRUNE_MINT || '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump',
  
  // Token decimals
  DECIMALS: 6,
  
  // Token symbol
  SYMBOL: 'zkRUNE',
  
  // Token name
  NAME: 'zkRune Token',
  
  // Burn address (Solana system program null address)
  BURN_ADDRESS: '11111111111111111111111111111111',
  
  // Treasury address for marketplace fees (operational reserve)
  TREASURY_ADDRESS: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '',

  // Staking reward vault — token account that funds staker rewards.
  // Platform fees are routed here so stakers earn from marketplace activity.
  REWARD_VAULT_ADDRESS: process.env.NEXT_PUBLIC_REWARD_VAULT_ADDRESS || '',
  
  // Staking program address
  STAKING_PROGRAM: process.env.NEXT_PUBLIC_STAKING_PROGRAM || '',

  // Stake vault authority wallet (owner of the vault ATA).
  // Set NEXT_PUBLIC_STAKE_VAULT_AUTHORITY to the authority's base58 public key.
  // The actual token account is derived on-chain: getAssociatedTokenAddress(mint, authority).
  STAKE_VAULT_AUTHORITY: process.env.NEXT_PUBLIC_STAKE_VAULT_AUTHORITY || '',
} as const;

// Total token supply — burn thresholds are derived from this.
export const TOTAL_SUPPLY = 1_000_000_000;

// Premium feature tiers — burn amounts expressed as basis points of total supply.
//   Builder  = 1 bps  (0.01%)  = 100,000 zkRUNE
//   Pro      = 5 bps  (0.05%)  = 500,000 zkRUNE
//   Protocol = 20 bps (0.20%)  = 2,000,000 zkRUNE
export const PREMIUM_TIERS = {
  FREE: {
    name: 'Free',
    burnBps: 0,
    burnRequired: 0,
    features: [
      'Basic ZK proof generation',
      '5 proofs per day',
      'Community privacy templates',
      'Public verification only',
    ],
    proofLimit: 5,
    templateAccess: 'community',
  },
  BUILDER: {
    name: 'Builder',
    burnBps: 1,
    burnRequired: Math.floor(TOTAL_SUPPLY * 1 / 10_000),
    features: [
      'Unlimited proof generation',
      'All privacy templates',
      'Private off-chain verification',
      'SDK API access',
      'Proof batching',
    ],
    proofLimit: -1,
    templateAccess: 'all',
  },
  PRO: {
    name: 'Pro',
    burnBps: 5,
    burnRequired: Math.floor(TOTAL_SUPPLY * 5 / 10_000),
    features: [
      'Everything in Builder',
      'Custom circuit deployment',
      'Private transaction builder',
      'Multi-proof composition',
      'Encrypted proof storage',
    ],
    proofLimit: -1,
    templateAccess: 'all',
    customCircuits: true,
  },
  PROTOCOL: {
    name: 'Protocol',
    burnBps: 20,
    burnRequired: Math.floor(TOTAL_SUPPLY * 20 / 10_000),
    features: [
      'Everything in Pro',
      'Private RPC relay',
      'Confidential smart contract toolkit',
      'On-chain privacy vault',
      'Dedicated verification infra',
      'Custom compliance modules',
    ],
    proofLimit: -1,
    templateAccess: 'all',
    customCircuits: true,
    privateRelay: true,
  },
} as const;

export type PremiumTier = keyof typeof PREMIUM_TIERS;

// Recalculate burn thresholds against a live circulating supply.
export function getBurnRequired(tier: PremiumTier, circulatingSupply?: number): number {
  const supply = circulatingSupply ?? TOTAL_SUPPLY;
  const bps = PREMIUM_TIERS[tier].burnBps;
  return Math.floor(supply * bps / 10_000);
}

// Governance configuration
export const GOVERNANCE_CONFIG = {
  // Minimum tokens to create a proposal
  MIN_TOKENS_TO_PROPOSE: 1000,
  
  // Minimum tokens to vote
  MIN_TOKENS_TO_VOTE: 10,
  
  // Voting period in days
  VOTING_PERIOD_DAYS: 7,
  
  // Quorum percentage (minimum participation)
  QUORUM_PERCENTAGE: 10,
  
  // Proposal types
  PROPOSAL_TYPES: ['template', 'feature', 'parameter', 'treasury'] as const,
} as const;

export type ProposalType = typeof GOVERNANCE_CONFIG.PROPOSAL_TYPES[number];

// Staking configuration
export const STAKING_CONFIG = {
  // Lock periods (in days) and their multipliers
  LOCK_PERIODS: [
    { days: 30, multiplier: 1.0, name: 'Flexible' },
    { days: 90, multiplier: 1.5, name: '3 Months' },
    { days: 180, multiplier: 2.0, name: '6 Months' },
    { days: 365, multiplier: 3.0, name: '1 Year' },
  ],
  
  // Base APY percentage (fallback, actual is dynamic on-chain)
  BASE_APY: 12,
  
  // Maximum APY with bonuses (cap)
  MAX_APY: 36,
  
  // Minimum APY floor
  MIN_APY: 5,
  
  // Yearly emission for rewards (1M tokens)
  YEARLY_EMISSION: 1_000_000,
  
  // Minimum stake amount
  MIN_STAKE: 100,
  
  // Early withdrawal penalty (50%)
  EARLY_WITHDRAWAL_PENALTY: 50,
} as const;

// Marketplace configuration
export const MARKETPLACE_CONFIG = {
  // Platform fee percentage
  PLATFORM_FEE: 5,
  
  // Creator share percentage
  CREATOR_SHARE: 95,

  // Percentage of platform fee routed to staking reward vault.
  // Remainder stays in treasury for operations.
  // 100 = all fees go to stakers, 0 = all fees stay in treasury.
  REWARD_POOL_SHARE: 100,
  
  // Minimum template price in zkRUNE
  MIN_TEMPLATE_PRICE: 10,
  
  // Featured listing cost in zkRUNE (burned)
  FEATURED_LISTING_COST: 50,
  
  // Template categories
  CATEGORIES: [
    'identity',
    'finance',
    'voting',
    'gaming',
    'social',
    'enterprise',
    'other',
  ] as const,
} as const;

export type MarketplaceCategory = typeof MARKETPLACE_CONFIG.CATEGORIES[number];

// Helper functions
export function formatTokenAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseTokenAmount(displayAmount: number): bigint {
  return BigInt(Math.floor(displayAmount * Math.pow(10, ZKRUNE_TOKEN.DECIMALS)));
}

export function displayTokenAmount(rawAmount: bigint): number {
  return Number(rawAmount) / Math.pow(10, ZKRUNE_TOKEN.DECIMALS);
}


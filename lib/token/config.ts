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
  
  // Treasury address for marketplace fees
  TREASURY_ADDRESS: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '',
  
  // Staking program address
  STAKING_PROGRAM: process.env.NEXT_PUBLIC_STAKING_PROGRAM || '',
} as const;

// Premium feature tiers
export const PREMIUM_TIERS = {
  FREE: {
    name: 'Free',
    burnRequired: 0,
    features: [
      'Basic proof generation',
      '5 proofs per day',
      'Community templates',
      'Basic export',
    ],
    proofLimit: 5,
    templateAccess: 'community',
  },
  BUILDER: {
    name: 'Builder',
    burnRequired: 100, // 100 zkRUNE tokens
    features: [
      'Unlimited proof generation',
      'All templates',
      'Priority circuit loading',
      'Code export',
      'API access',
    ],
    proofLimit: -1, // unlimited
    templateAccess: 'all',
  },
  PRO: {
    name: 'Pro',
    burnRequired: 500, // 500 zkRUNE tokens
    features: [
      'Everything in Builder',
      'Custom circuit builder',
      'Gasless proofs',
      'Priority support',
      'Early access to new features',
    ],
    proofLimit: -1,
    templateAccess: 'all',
    gaslessProofs: true,
  },
  ENTERPRISE: {
    name: 'Enterprise',
    burnRequired: 2000, // 2000 zkRUNE tokens
    features: [
      'Everything in Pro',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    proofLimit: -1,
    templateAccess: 'all',
    gaslessProofs: true,
    whiteLabel: true,
  },
} as const;

export type PremiumTier = keyof typeof PREMIUM_TIERS;

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
  
  // Base APY percentage
  BASE_APY: 12,
  
  // Maximum APY with bonuses
  MAX_APY: 36,
  
  // Minimum stake amount
  MIN_STAKE: 100,
} as const;

// Marketplace configuration
export const MARKETPLACE_CONFIG = {
  // Platform fee percentage (goes to treasury)
  PLATFORM_FEE: 5,
  
  // Creator share percentage
  CREATOR_SHARE: 95,
  
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


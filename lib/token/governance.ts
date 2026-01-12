// zkRune Governance System
// Vote on community templates and features

import { GOVERNANCE_CONFIG, type ProposalType } from './config';

export interface Proposal {
  id: string;
  type: ProposalType;
  title: string;
  description: string;
  creator: string;
  createdAt: Date;
  endsAt: Date;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  voterCount: number;
  quorumReached: boolean;
  // For template proposals
  templateData?: {
    name: string;
    circuitCode?: string;
    category?: string;
  };
  // For feature proposals
  featureData?: {
    featureName: string;
    specification?: string;
  };
}

export interface Vote {
  proposalId: string;
  voter: string;
  support: boolean;
  weight: number;
  timestamp: Date;
}

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  totalVoters: number;
  totalVotesCast: number;
}

// Local storage keys
const PROPOSALS_KEY = 'zkrune_governance_proposals';
const VOTES_KEY = 'zkrune_governance_votes';

// Get all proposals
export function getProposals(): Proposal[] {
  // Always return default proposals on SSR for initial render
  if (typeof window === 'undefined') return getDefaultProposals();

  try {
    const stored = localStorage.getItem(PROPOSALS_KEY);
    if (!stored) {
      // Initialize with default proposals
      const defaults = getDefaultProposals();
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    
    const proposals = JSON.parse(stored);
    // If empty, return defaults
    if (proposals.length === 0) {
      const defaults = getDefaultProposals();
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    
    return proposals.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      endsAt: new Date(p.endsAt),
    }));
  } catch {
    return getDefaultProposals();
  }
}

// Get active proposals only
export function getActiveProposals(): Proposal[] {
  const proposals = getProposals();
  const now = new Date();
  return proposals.filter(p => p.status === 'active' && p.endsAt > now);
}

// Get a single proposal by ID
export function getProposal(id: string): Proposal | null {
  const proposals = getProposals();
  return proposals.find(p => p.id === id) || null;
}

// Create a new proposal
export function createProposal(
  creator: string,
  type: ProposalType,
  title: string,
  description: string,
  additionalData?: Proposal['templateData'] | Proposal['featureData']
): Proposal {
  const now = new Date();
  const endsAt = new Date(now.getTime() + GOVERNANCE_CONFIG.VOTING_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  const proposal: Proposal = {
    id: `prop_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type,
    title,
    description,
    creator,
    createdAt: now,
    endsAt,
    status: 'active',
    votesFor: 0,
    votesAgainst: 0,
    voterCount: 0,
    quorumReached: false,
  };

  if (type === 'template' && additionalData) {
    proposal.templateData = additionalData as Proposal['templateData'];
  } else if (type === 'feature' && additionalData) {
    proposal.featureData = additionalData as Proposal['featureData'];
  }

  // Save proposal
  const proposals = getProposals();
  proposals.unshift(proposal);
  saveProposals(proposals);

  return proposal;
}

// Cast a vote
export function castVote(
  proposalId: string,
  voter: string,
  support: boolean,
  tokenBalance: number
): { success: boolean; error?: string } {
  // Check minimum tokens
  if (tokenBalance < GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE) {
    return {
      success: false,
      error: `Minimum ${GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE} zkRUNE required to vote`,
    };
  }

  // Check if already voted
  const votes = getVotes();
  const existingVote = votes.find(v => v.proposalId === proposalId && v.voter === voter);
  if (existingVote) {
    return { success: false, error: 'Already voted on this proposal' };
  }

  // Get proposal
  const proposals = getProposals();
  const proposalIndex = proposals.findIndex(p => p.id === proposalId);
  if (proposalIndex === -1) {
    return { success: false, error: 'Proposal not found' };
  }

  const proposal = proposals[proposalIndex];
  
  // Check if voting is still open
  if (proposal.status !== 'active' || new Date() > proposal.endsAt) {
    return { success: false, error: 'Voting has ended for this proposal' };
  }

  // Calculate vote weight (quadratic voting)
  const weight = Math.sqrt(tokenBalance);

  // Record vote
  const vote: Vote = {
    proposalId,
    voter,
    support,
    weight,
    timestamp: new Date(),
  };
  votes.push(vote);
  saveVotes(votes);

  // Update proposal
  if (support) {
    proposal.votesFor += weight;
  } else {
    proposal.votesAgainst += weight;
  }
  proposal.voterCount += 1;
  
  // Check quorum (simplified - would need total supply in production)
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  proposal.quorumReached = totalVotes >= 100; // Simplified threshold

  proposals[proposalIndex] = proposal;
  saveProposals(proposals);

  return { success: true };
}

// Get user's votes
export function getUserVotes(voter: string): Vote[] {
  const votes = getVotes();
  return votes.filter(v => v.voter === voter);
}

// Check if user has voted on a proposal
export function hasVoted(proposalId: string, voter: string): boolean {
  const votes = getVotes();
  return votes.some(v => v.proposalId === proposalId && v.voter === voter);
}

// Get governance statistics
export function getGovernanceStats(): GovernanceStats {
  const proposals = getProposals();
  const votes = getVotes();
  const uniqueVoters = new Set(votes.map(v => v.voter));

  return {
    totalProposals: proposals.length,
    activeProposals: proposals.filter(p => p.status === 'active').length,
    passedProposals: proposals.filter(p => p.status === 'passed').length,
    totalVoters: uniqueVoters.size,
    totalVotesCast: votes.length,
  };
}

// Finalize proposals that have ended
export function finalizeEndedProposals(): void {
  const proposals = getProposals();
  const now = new Date();
  let updated = false;

  proposals.forEach((proposal, index) => {
    if (proposal.status === 'active' && proposal.endsAt <= now) {
      const passed = proposal.quorumReached && proposal.votesFor > proposal.votesAgainst;
      proposals[index].status = passed ? 'passed' : 'rejected';
      updated = true;
    }
  });

  if (updated) {
    saveProposals(proposals);
  }
}

// Helper functions
function getVotes(): Vote[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(VOTES_KEY);
    if (!stored) return [];
    
    const votes = JSON.parse(stored);
    return votes.map((v: any) => ({
      ...v,
      timestamp: new Date(v.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveProposals(proposals: Proposal[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
}

function saveVotes(votes: Vote[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

// Default proposals for demo - Solana Privacy Hack focused
function getDefaultProposals(): Proposal[] {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threedays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fivedays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'prop_privacy_1',
      type: 'feature',
      title: 'Solana SPL Token Private Transfers',
      description: 'Implement private SPL token transfers using ZK proofs. Users can send tokens without revealing amounts or wallet addresses publicly. Perfect for salary payments, donations, and confidential business transactions on Solana.',
      creator: 'zkRune Core',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endsAt: weekFromNow,
      status: 'active',
      votesFor: 2450,
      votesAgainst: 120,
      voterCount: 89,
      quorumReached: true,
      featureData: {
        featureName: 'Private SPL Transfers',
        specification: 'Use Groth16 proofs to verify token ownership and transfer validity without revealing amounts.',
      },
    },
    {
      id: 'prop_privacy_2',
      type: 'template',
      title: 'Anonymous DAO Voting Template',
      description: 'A template for Solana DAOs to conduct anonymous votes. Prove voting eligibility based on token holdings without revealing your wallet or exact balance. Prevents voter coercion and bribery.',
      creator: 'Privacy Advocate',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endsAt: fivedays,
      status: 'active',
      votesFor: 1890,
      votesAgainst: 340,
      voterCount: 156,
      quorumReached: true,
      templateData: {
        name: 'Anonymous DAO Voting',
        category: 'voting',
      },
    },
    {
      id: 'prop_privacy_3',
      type: 'feature',
      title: 'Confidential Token Launchpad',
      description: 'Build a private token launchpad where participants can prove they meet requirements (holding period, token amount, etc.) without revealing their identity. Ideal for fair launches without front-running.',
      creator: 'DeFi Builder',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endsAt: threedays,
      status: 'active',
      votesFor: 1560,
      votesAgainst: 280,
      voterCount: 78,
      quorumReached: true,
      featureData: {
        featureName: 'Confidential Launchpad',
        specification: 'ZK proofs for allocation eligibility without wallet address exposure.',
      },
    },
    {
      id: 'prop_privacy_4',
      type: 'template',
      title: 'Private Credit Score Proof',
      description: 'Prove your on-chain credit worthiness for undercollateralized lending without revealing transaction history. Essential for privacy-preserving DeFi on Solana.',
      creator: 'Solana DeFi',
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: 'passed',
      votesFor: 3200,
      votesAgainst: 450,
      voterCount: 234,
      quorumReached: true,
      templateData: {
        name: 'Private Credit Score',
        category: 'finance',
      },
    },
    {
      id: 'prop_privacy_5',
      type: 'feature',
      title: 'Gasless Proof Verification via Relayers',
      description: 'Enable users to verify proofs without paying gas. Relayers submit transactions on behalf of users, with costs covered by the protocol. Improves UX for privacy features.',
      creator: 'UX Team',
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      status: 'executed',
      votesFor: 4100,
      votesAgainst: 200,
      voterCount: 312,
      quorumReached: true,
      featureData: {
        featureName: 'Gasless Verification',
        specification: 'Implement meta-transactions for proof submission.',
      },
    },
  ];
}


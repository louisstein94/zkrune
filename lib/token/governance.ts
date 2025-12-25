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
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PROPOSALS_KEY);
    if (!stored) return getDefaultProposals();
    
    const proposals = JSON.parse(stored);
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

// Default proposals for demo
function getDefaultProposals(): Proposal[] {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'prop_demo_1',
      type: 'template',
      title: 'Add KYC Verification Template',
      description: 'A new template for privacy-preserving KYC verification that proves identity attributes without revealing personal information. Uses zero-knowledge proofs to verify age, nationality, and accreditation status.',
      creator: 'zkRune Team',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endsAt: weekFromNow,
      status: 'active',
      votesFor: 1250,
      votesAgainst: 180,
      voterCount: 42,
      quorumReached: true,
      templateData: {
        name: 'KYC Verification',
        category: 'identity',
      },
    },
    {
      id: 'prop_demo_2',
      type: 'feature',
      title: 'Multi-chain Proof Verification',
      description: 'Enable verification of zkRune proofs on multiple blockchains including Ethereum, Polygon, and Cosmos. This will expand the utility of zkRune proofs across the broader web3 ecosystem.',
      creator: 'Community Member',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'active',
      votesFor: 890,
      votesAgainst: 320,
      voterCount: 67,
      quorumReached: true,
      featureData: {
        featureName: 'Multi-chain Verification',
        specification: 'Deploy verifier contracts on EVM chains and integrate with IBC for Cosmos.',
      },
    },
    {
      id: 'prop_demo_3',
      type: 'template',
      title: 'Proof of Reserves Template',
      description: 'Create a template for exchanges and custodians to prove solvency without revealing exact holdings. Critical for transparency in the crypto ecosystem.',
      creator: 'DeFi Builder',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      status: 'passed',
      votesFor: 2100,
      votesAgainst: 450,
      voterCount: 128,
      quorumReached: true,
      templateData: {
        name: 'Proof of Reserves',
        category: 'finance',
      },
    },
  ];
}


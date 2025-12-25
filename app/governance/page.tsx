'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);
import {
  getProposals,
  getActiveProposals,
  getGovernanceStats,
  castVote,
  hasVoted,
  createProposal,
  finalizeEndedProposals,
  type Proposal,
  type GovernanceStats,
} from '@/lib/token/governance';
import { GOVERNANCE_CONFIG } from '@/lib/token/config';

export default function GovernancePage() {
  const { publicKey, connected } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'create'>('active');
  const [userTokenBalance, setUserTokenBalance] = useState(1000); // Demo balance
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    finalizeEndedProposals();
    loadData();
  }, [activeTab]);

  function loadData() {
    const allProposals = activeTab === 'active' ? getActiveProposals() : getProposals();
    setProposals(allProposals);
    setStats(getGovernanceStats());
  }

  async function handleVote(proposalId: string, support: boolean) {
    if (!publicKey) return;

    setIsLoading(true);
    const result = castVote(proposalId, publicKey.toBase58(), support, userTokenBalance);
    
    if (result.success) {
      loadData();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  }

  function getStatusColor(status: Proposal['status']) {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'passed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'executed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  function getTimeRemaining(endsAt: Date): string {
    const now = new Date();
    const diff = endsAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#00FFA3]">
            zkRune
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/premium" className="text-gray-400 hover:text-white transition">
              Premium
            </Link>
            <Link href="/marketplace" className="text-gray-400 hover:text-white transition">
              Marketplace
            </Link>
            <Link href="/staking" className="text-gray-400 hover:text-white transition">
              Staking
            </Link>
            <WalletMultiButton className="!bg-[#6B4CFF] hover:!bg-[#5a3de6]" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Governance
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Vote on community templates and protocol features. Your zkRUNE tokens give you voting power.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalProposals}</div>
              <div className="text-gray-400 text-sm">Total Proposals</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#00FFA3]">{stats.activeProposals}</div>
              <div className="text-gray-400 text-sm">Active</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.passedProposals}</div>
              <div className="text-gray-400 text-sm">Passed</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.totalVoters}</div>
              <div className="text-gray-400 text-sm">Unique Voters</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'active'
                ? 'bg-[#00FFA3] text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Active Proposals
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-[#00FFA3] text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Proposals
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'create'
                ? 'bg-[#6B4CFF] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Create Proposal
          </button>
        </div>

        {/* Content */}
        {activeTab === 'create' ? (
          <CreateProposalForm
            connected={connected}
            publicKey={publicKey?.toBase58()}
            tokenBalance={userTokenBalance}
            onSuccess={() => {
              setActiveTab('active');
              loadData();
            }}
          />
        ) : (
          <div className="space-y-4">
            {proposals.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400">No proposals found</p>
              </div>
            ) : (
              proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  userAddress={publicKey?.toBase58()}
                  onVote={handleVote}
                  isLoading={isLoading}
                />
              ))
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How Governance Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-[#00FFA3] font-medium mb-2">Voting Power</div>
              <p className="text-gray-400">
                Your voting power is calculated using quadratic voting: sqrt(token_balance). 
                This ensures fairer representation.
              </p>
            </div>
            <div>
              <div className="text-[#00FFA3] font-medium mb-2">Requirements</div>
              <p className="text-gray-400">
                Minimum {GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE} zkRUNE to vote. 
                Minimum {GOVERNANCE_CONFIG.MIN_TOKENS_TO_PROPOSE} zkRUNE to create proposals.
              </p>
            </div>
            <div>
              <div className="text-[#00FFA3] font-medium mb-2">Voting Period</div>
              <p className="text-gray-400">
                Proposals are open for {GOVERNANCE_CONFIG.VOTING_PERIOD_DAYS} days. 
                Quorum of {GOVERNANCE_CONFIG.QUORUM_PERCENTAGE}% participation required.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProposalCard({
  proposal,
  userAddress,
  onVote,
  isLoading,
}: {
  proposal: Proposal;
  userAddress?: string;
  onVote: (id: string, support: boolean) => void;
  isLoading: boolean;
}) {
  const userHasVoted = userAddress ? hasVoted(proposal.id, userAddress) : false;
  const totalVotes = proposal.votesFor + proposal.votesAgainst;
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 50;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${
              proposal.type === 'template' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
              proposal.type === 'feature' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}>
              {proposal.type.toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${
              proposal.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              proposal.status === 'passed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-purple-500/20 text-purple-400 border-purple-500/30'
            }`}>
              {proposal.status.toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>{proposal.status === 'active' ? getTimeRemaining(proposal.endsAt) : 'Ended'}</div>
          <div>{proposal.voterCount} voters</div>
        </div>
      </div>

      <p className="text-gray-400 mb-4 line-clamp-2">{proposal.description}</p>

      {/* Vote Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400">For: {proposal.votesFor.toFixed(1)}</span>
          <span className="text-red-400">Against: {proposal.votesAgainst.toFixed(1)}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400"
            style={{ width: `${forPercentage}%` }}
          />
        </div>
        {proposal.quorumReached && (
          <div className="text-xs text-[#00FFA3] mt-1">Quorum reached</div>
        )}
      </div>

      {/* Vote Buttons */}
      {proposal.status === 'active' && (
        <div className="flex gap-3">
          {userHasVoted ? (
            <div className="text-gray-400 text-sm py-2">You have already voted on this proposal</div>
          ) : userAddress ? (
            <>
              <button
                onClick={() => onVote(proposal.id, true)}
                disabled={isLoading}
                className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
              >
                Vote For
              </button>
              <button
                onClick={() => onVote(proposal.id, false)}
                disabled={isLoading}
                className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
              >
                Vote Against
              </button>
            </>
          ) : (
            <div className="text-gray-400 text-sm py-2">Connect wallet to vote</div>
          )}
        </div>
      )}
    </div>
  );
}

function getTimeRemaining(endsAt: Date): string {
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

function CreateProposalForm({
  connected,
  publicKey,
  tokenBalance,
  onSuccess,
}: {
  connected: boolean;
  publicKey?: string;
  tokenBalance: number;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<'template' | 'feature'>('template');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [featureName, setFeatureName] = useState('');

  const canCreate = tokenBalance >= GOVERNANCE_CONFIG.MIN_TOKENS_TO_PROPOSE;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !canCreate) return;

    const additionalData = type === 'template'
      ? { name: templateName, category: 'other' as const }
      : { featureName };

    createProposal(publicKey, type, title, description, additionalData);
    onSuccess();
  }

  if (!connected) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to create proposals</p>
        <WalletMultiButton className="!bg-[#6B4CFF] hover:!bg-[#5a3de6]" />
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <p className="text-gray-400 mb-2">
          You need at least {GOVERNANCE_CONFIG.MIN_TOKENS_TO_PROPOSE} zkRUNE to create proposals
        </p>
        <p className="text-sm text-gray-500">Your balance: {tokenBalance} zkRUNE</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Create New Proposal</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Proposal Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('template')}
              className={`px-4 py-2 rounded-lg transition ${
                type === 'template'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              Template
            </button>
            <button
              type="button"
              onClick={() => setType('feature')}
              className={`px-4 py-2 rounded-lg transition ${
                type === 'feature'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              Feature
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00FFA3] focus:outline-none"
            placeholder="Proposal title..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00FFA3] focus:outline-none resize-none"
            placeholder="Describe your proposal in detail..."
          />
        </div>

        {type === 'template' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00FFA3] focus:outline-none"
              placeholder="e.g., KYC Verification"
            />
          </div>
        )}

        {type === 'feature' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Feature Name</label>
            <input
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00FFA3] focus:outline-none"
              placeholder="e.g., Multi-chain Verification"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-[#00FFA3] text-black font-semibold rounded-lg hover:bg-[#00cc82] transition"
        >
          Submit Proposal
        </button>
      </div>
    </form>
  );
}


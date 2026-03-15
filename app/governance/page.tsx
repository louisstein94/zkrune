'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGovernance, type Proposal } from '@/lib/hooks/useGovernance';
import { useSolana } from '@/lib/hooks/useSolana';
import { GOVERNANCE_CONFIG } from '@/lib/token/config';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function GovernancePage() {
  const { publicKey, connected } = useWallet();
  const { zkruneBalance } = useSolana();
  const {
    proposals,
    isLoading: hookLoading,
    error,
    fetchProposals,
    createProposal,
    castVote,
    hasVoted: checkHasVoted,
    getStats,
    activeProposals,
  } = useGovernance();

  const [activeTab, setActiveTab] = useState<'active' | 'all' | 'create'>('active');
  const [isVoting, setIsVoting] = useState(false);

  const tokenBalance = zkruneBalance?.uiAmount ?? 0;
  const stats = getStats();

  useEffect(() => {
    if (activeTab === 'active') {
      fetchProposals('active');
    } else if (activeTab === 'all') {
      fetchProposals();
    }
  }, [activeTab, fetchProposals]);

  const displayedProposals = activeTab === 'active' ? activeProposals : proposals;

  async function handleVote(proposalId: string, support: boolean) {
    if (!publicKey) return;

    setIsVoting(true);
    try {
      const result = await castVote(proposalId, publicKey.toBase58(), support, tokenBalance);
      if (!result.success) {
        alert(result.error);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to vote');
    }
    setIsVoting(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#6366F1]">
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
            <WalletMultiButton className="!bg-[#6366F1] hover:!bg-[#5b4bd4] !text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Governance</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Vote on community templates and protocol features. Your zkRUNE tokens give you voting power.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalProposals}</div>
              <div className="text-gray-400 text-sm">Total Proposals</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#6366F1]">{stats.activeProposals}</div>
              <div className="text-gray-400 text-sm">Active</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.passedProposals}</div>
              <div className="text-gray-400 text-sm">Passed</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400">{stats.totalVoters}</div>
              <div className="text-gray-400 text-sm">Unique Voters</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'active'
                ? 'bg-[#6366F1] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Active Proposals
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-[#6366F1] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All Proposals
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'create'
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Create Proposal
          </button>
        </div>

        {activeTab === 'create' ? (
          <CreateProposalForm
            connected={connected}
            publicKey={publicKey?.toBase58()}
            tokenBalance={tokenBalance}
            onSubmit={async (type, title, description, creator, additionalData) => {
              const result = await createProposal(type, title, description, creator, additionalData);
              if (result.success) {
                setActiveTab('active');
              } else {
                alert(result.error);
              }
            }}
          />
        ) : hookLoading ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <div className="animate-spin w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading proposals...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedProposals.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400">No proposals found</p>
              </div>
            ) : (
              displayedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  userAddress={publicKey?.toBase58()}
                  onVote={handleVote}
                  isLoading={isVoting}
                  checkHasVoted={checkHasVoted}
                />
              ))
            )}
          </div>
        )}

        <div className="mt-12 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How Governance Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-[#6366F1] font-medium mb-2">Voting Power</div>
              <p className="text-gray-400">
                Your voting power is calculated using quadratic voting: sqrt(token_balance).
                This ensures fairer representation.
              </p>
            </div>
            <div>
              <div className="text-[#6366F1] font-medium mb-2">Requirements</div>
              <p className="text-gray-400">
                Minimum {GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE} zkRUNE to vote.
                Minimum {GOVERNANCE_CONFIG.MIN_TOKENS_TO_PROPOSE} zkRUNE to create proposals.
              </p>
            </div>
            <div>
              <div className="text-[#6366F1] font-medium mb-2">Voting Period</div>
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
  checkHasVoted,
}: {
  proposal: Proposal;
  userAddress?: string;
  onVote: (id: string, support: boolean) => void;
  isLoading: boolean;
  checkHasVoted: (proposalId: string, voter: string) => Promise<boolean>;
}) {
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (userAddress) {
      checkHasVoted(proposal.id, userAddress).then(setVoted);
    }
  }, [userAddress, proposal.id, checkHasVoted]);

  const totalVotes = proposal.votes_for + proposal.votes_against;
  const forPercentage = totalVotes > 0 ? (proposal.votes_for / totalVotes) * 100 : 50;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${
              proposal.type === 'template' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' :
              proposal.type === 'feature' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}>
              {proposal.type.toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${
              proposal.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              proposal.status === 'passed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              proposal.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-violet-500/20 text-violet-400 border-violet-500/30'
            }`}>
              {proposal.status.toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white">{proposal.title}</h3>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>{getTimeRemaining(proposal.ends_at)}</div>
          <div>{proposal.voter_count} voters</div>
        </div>
      </div>

      <p className="text-gray-400 mb-4 line-clamp-2">{proposal.description}</p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400">For: {Number(proposal.votes_for).toFixed(1)}</span>
          <span className="text-red-400">Against: {Number(proposal.votes_against).toFixed(1)}</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400"
            style={{ width: `${forPercentage}%` }}
          />
        </div>
        {proposal.quorum_reached && (
          <div className="text-xs text-[#6366F1] mt-1">Quorum reached</div>
        )}
      </div>

      {proposal.status === 'active' && (
        <div className="flex gap-3">
          {voted ? (
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

function getTimeRemaining(endsAt: string): string {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end.getTime() - now.getTime();

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
  onSubmit,
}: {
  connected: boolean;
  publicKey?: string;
  tokenBalance: number;
  onSubmit: (
    type: 'template' | 'feature',
    title: string,
    description: string,
    creator: string,
    additionalData?: Record<string, unknown>,
  ) => Promise<void>;
}) {
  const [type, setType] = useState<'template' | 'feature'>('template');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [featureName, setFeatureName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canCreate = tokenBalance >= GOVERNANCE_CONFIG.MIN_TOKENS_TO_PROPOSE;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !canCreate || submitting) return;

    setSubmitting(true);
    const additionalData = type === 'template'
      ? { name: templateName, category: 'other' }
      : { featureName };

    await onSubmit(type, title, description, publicKey, additionalData);
    setTitle('');
    setDescription('');
    setTemplateName('');
    setFeatureName('');
    setSubmitting(false);
  }

  if (!connected) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to create proposals</p>
        <WalletMultiButton className="!bg-[#6366F1] hover:!bg-[#5b4bd4] !text-white" />
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <p className="text-gray-400 mb-2">
          You need at least {GOVERNANCE_CONFIG.MIN_TOKENS_TO_PROPOSE} zkRUNE to create proposals
        </p>
        <p className="text-sm text-gray-500">Your balance: {tokenBalance.toLocaleString()} zkRUNE</p>
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
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
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
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#6366F1] focus:outline-none"
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
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#6366F1] focus:outline-none resize-none"
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
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#6366F1] focus:outline-none"
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
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#6366F1] focus:outline-none"
              placeholder="e.g., Multi-chain Verification"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#5b4bd4] transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </div>
    </form>
  );
}

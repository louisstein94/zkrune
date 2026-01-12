import { useState, useEffect, useCallback } from 'react';

export interface Proposal {
  id: string;
  type: 'template' | 'feature' | 'parameter';
  title: string;
  description: string;
  creator: string;
  created_at: string;
  ends_at: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votes_for: number;
  votes_against: number;
  voter_count: number;
  quorum_reached: boolean;
  template_data?: any;
  feature_data?: any;
}

export interface Vote {
  id: string;
  proposal_id: string;
  voter: string;
  support: boolean;
  weight: number;
  created_at: string;
}

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  totalVoters: number;
}

export function useGovernance() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);

      const response = await fetch(`/api/governance/proposals?${params}`);
      const data = await response.json();

      if (data.success) {
        setProposals(data.data);
      } else {
        setError(data.error || 'Failed to fetch proposals');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProposal = useCallback(async (
    type: Proposal['type'],
    title: string,
    description: string,
    creator: string,
    additionalData?: any
  ) => {
    try {
      const response = await fetch('/api/governance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          description,
          creator,
          templateData: type === 'template' ? additionalData : undefined,
          featureData: type === 'feature' ? additionalData : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchProposals();
        return { success: true, proposal: data.data };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchProposals]);

  const castVote = useCallback(async (
    proposalId: string,
    voter: string,
    support: boolean,
    tokenBalance: number
  ) => {
    try {
      const response = await fetch('/api/governance/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, voter, support, tokenBalance }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchProposals();
        return { success: true, weight: data.weight };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchProposals]);

  const getUserVotes = useCallback(async (voter: string): Promise<Vote[]> => {
    try {
      const response = await fetch(`/api/governance/votes?voter=${voter}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  }, []);

  const hasVoted = useCallback(async (proposalId: string, voter: string): Promise<boolean> => {
    const votes = await getUserVotes(voter);
    return votes.some(v => v.proposal_id === proposalId);
  }, [getUserVotes]);

  const getStats = useCallback((): GovernanceStats => {
    return {
      totalProposals: proposals.length,
      activeProposals: proposals.filter(p => p.status === 'active').length,
      passedProposals: proposals.filter(p => p.status === 'passed').length,
      totalVoters: proposals.reduce((sum, p) => sum + p.voter_count, 0),
    };
  }, [proposals]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return {
    proposals,
    isLoading,
    error,
    fetchProposals,
    createProposal,
    castVote,
    getUserVotes,
    hasVoted,
    getStats,
    activeProposals: proposals.filter(p => p.status === 'active' && new Date(p.ends_at) > new Date()),
  };
}

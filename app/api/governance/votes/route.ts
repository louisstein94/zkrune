import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { GOVERNANCE_CONFIG } from '@/lib/token/config';

// GET votes for a proposal or by voter
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const proposalId = searchParams.get('proposalId');
  const voter = searchParams.get('voter');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: [],
      source: 'mock',
    });
  }

  try {
    let query = supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false });

    if (proposalId) {
      query = query.eq('proposal_id', proposalId);
    }

    if (voter) {
      query = query.eq('voter', voter);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: any) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// POST - Cast a vote
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { proposalId, voter, support, tokenBalance } = body;

    // Validate required fields
    if (!proposalId || !voter || support === undefined || !tokenBalance) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: proposalId, voter, support, tokenBalance',
      }, { status: 400 });
    }

    // Check minimum tokens
    if (tokenBalance < GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE) {
      return NextResponse.json({
        success: false,
        error: `Minimum ${GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE} zkRUNE required to vote`,
      }, { status: 400 });
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('voter', voter)
      .single();

    if (existingVote) {
      return NextResponse.json({
        success: false,
        error: 'Already voted on this proposal',
      }, { status: 400 });
    }

    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({
        success: false,
        error: 'Proposal not found',
      }, { status: 404 });
    }

    // Check if voting is still open
    if (proposal.status !== 'active' || new Date() > new Date(proposal.ends_at)) {
      return NextResponse.json({
        success: false,
        error: 'Voting has ended for this proposal',
      }, { status: 400 });
    }

    // Calculate vote weight (quadratic voting)
    const weight = Math.sqrt(tokenBalance);

    // Insert vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        proposal_id: proposalId,
        voter,
        support,
        weight,
      });

    if (voteError) throw voteError;

    // Update proposal votes
    const newVotesFor = support ? proposal.votes_for + weight : proposal.votes_for;
    const newVotesAgainst = !support ? proposal.votes_against + weight : proposal.votes_against;
    const newVoterCount = proposal.voter_count + 1;
    const totalVotes = newVotesFor + newVotesAgainst;
    const quorumReached = totalVotes >= 100; // Simplified threshold

    const { error: updateError } = await supabase
      .from('proposals')
      .update({
        votes_for: newVotesFor,
        votes_against: newVotesAgainst,
        voter_count: newVoterCount,
        quorum_reached: quorumReached,
      })
      .eq('id', proposalId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      weight,
    });
  } catch (error: any) {
    console.error('Error casting vote:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

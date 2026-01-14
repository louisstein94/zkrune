import { NextRequest, NextResponse } from 'next/server';
import { GOVERNANCE_CONFIG } from '@/lib/token/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Vote {
  id: string;
  proposal_id: string;
  voter: string;
  support: boolean;
  weight: number;
  created_at: string;
}

interface Proposal {
  id: string;
  status: string;
  ends_at: string;
  votes_for: number;
  votes_against: number;
  voter_count: number;
}

function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

async function supabaseFetch(endpoint: string, options?: RequestInit) {
  return fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': supabaseKey!,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

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
    let url = 'votes?select=*&order=created_at.desc';
    
    if (proposalId) {
      url += `&proposal_id=eq.${proposalId}`;
    }
    if (voter) {
      url += `&voter=eq.${voter}`;
    }

    const response = await supabaseFetch(url);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
    
    const data: Vote[] = await response.json();

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching votes:', error);
    return NextResponse.json({
      success: true,
      data: [],
      source: 'fallback',
    });
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
    const existingRes = await supabaseFetch(
      `votes?proposal_id=eq.${proposalId}&voter=eq.${voter}&select=id`
    );
    const existingVotes: Vote[] = await existingRes.json();
    
    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Already voted on this proposal',
      }, { status: 400 });
    }

    // Get proposal
    const proposalRes = await supabaseFetch(`proposals?id=eq.${proposalId}&select=*`);
    const proposals: Proposal[] = await proposalRes.json();
    const proposal = proposals[0];

    if (!proposal) {
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
    const voteRes = await supabaseFetch('votes', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        proposal_id: proposalId,
        voter,
        support,
        weight,
      }),
    });

    if (!voteRes.ok) throw new Error('Failed to cast vote');

    // Update proposal votes
    const newVotesFor = support ? proposal.votes_for + weight : proposal.votes_for;
    const newVotesAgainst = !support ? proposal.votes_against + weight : proposal.votes_against;
    const newVoterCount = proposal.voter_count + 1;
    const totalVotes = newVotesFor + newVotesAgainst;
    const quorumReached = totalVotes >= 100;

    await supabaseFetch(`proposals?id=eq.${proposalId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        votes_for: newVotesFor,
        votes_against: newVotesAgainst,
        voter_count: newVoterCount,
        quorum_reached: quorumReached,
      }),
    });

    return NextResponse.json({
      success: true,
      weight,
    });
  } catch (error: unknown) {
    console.error('Error casting vote:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

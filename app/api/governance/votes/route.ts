import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { GOVERNANCE_CONFIG, ZKRUNE_TOKEN } from '@/lib/token/config';
import { verifyAuth } from '@/lib/auth/verifyWalletSignature';
import {
  isSupabaseServerConfigured,
  supabaseServerFetch,
} from '@/lib/supabase/serverClient';

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

function requireSupabase() {
  if (!isSupabaseServerConfigured()) {
    throw new Error('Supabase not configured');
  }
}

const supabaseFetch = supabaseServerFetch;

export async function GET(request: NextRequest) {
  try {
    requireSupabase();
  } catch {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const proposalId = searchParams.get('proposalId');
  const voter = searchParams.get('voter');

  try {
    let url = 'votes?select=*&order=created_at.desc';
    if (proposalId) url += `&proposal_id=eq.${proposalId}`;
    if (voter) url += `&voter=eq.${voter}`;

    const response = await supabaseFetch(url);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const data: Vote[] = await response.json();

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: unknown) {
    console.error('Error fetching votes:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSupabase();
  } catch {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { proposalId, voter, support, signedMessage, signature } = body;

    if (!proposalId || !voter || support === undefined || !signedMessage || !signature) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: proposalId, voter, support, signedMessage, signature',
      }, { status: 400 });
    }

    if (!verifyAuth(
      { wallet: voter, signedMessage, signature },
      'vote',
      { proposalId, support: support ? '1' : '0' },
    )) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired wallet signature',
      }, { status: 401 });
    }

    // P3-02: fetch voter balance from RPC. Fail the request on RPC error
    // instead of silently defaulting to 0 — that would let a single RPC
    // outage (or upstream rate limiting) censor all votes while whales
    // would be told they don't meet the minimum.
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const mintPubkey = new PublicKey(ZKRUNE_TOKEN.MINT_ADDRESS);
    const voterPubkey = new PublicKey(voter);
    let tokenBalance: number;
    try {
      const ata = getAssociatedTokenAddressSync(mintPubkey, voterPubkey);
      const accountInfo = await connection.getTokenAccountBalance(ata);
      tokenBalance = accountInfo.value.uiAmount ?? 0;
    } catch (rpcError: unknown) {
      // Distinguish "token account does not exist" (balance = 0) from
      // "RPC unreachable" (unknown balance, must fail closed).
      const message = rpcError instanceof Error ? rpcError.message : String(rpcError);
      const accountMissing = /could not find account|account not found|Invalid param|AccountNotFound/i.test(message);
      if (!accountMissing) {
        console.error('[votes] RPC balance lookup failed:', rpcError);
        return NextResponse.json(
          {
            success: false,
            error: 'Unable to verify token balance. Please try again.',
          },
          { status: 503 },
        );
      }
      tokenBalance = 0;
    }

    if (tokenBalance < GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE) {
      return NextResponse.json({
        success: false,
        error: `Minimum ${GOVERNANCE_CONFIG.MIN_TOKENS_TO_VOTE} zkRUNE required to vote`,
      }, { status: 400 });
    }

    const proposalRes = await supabaseFetch(`proposals?id=eq.${proposalId}&select=*`);
    const proposals: Proposal[] = await proposalRes.json();
    const proposal = proposals[0];

    if (!proposal) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 });
    }

    if (proposal.status !== 'active' || new Date() > new Date(proposal.ends_at)) {
      return NextResponse.json({
        success: false,
        error: 'Voting has ended for this proposal',
      }, { status: 400 });
    }

    const weight = Math.sqrt(tokenBalance);

    // P3-04: quorum as a percentage of total staked supply.
    // GOVERNANCE_CONFIG.QUORUM_PERCENTAGE = 10 means 10% of staked supply.
    // We fetch the current total_staked from staking_positions and compute
    // the threshold at cast time — this keeps the check in sync with TVL.
    const stakingRes = await supabaseFetch(
      'staking_positions?is_active=eq.true&select=amount',
    );
    let totalStaked = 0;
    if (stakingRes.ok) {
      const positions: Array<{ amount: number }> = await stakingRes.json();
      totalStaked = positions.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    }
    // sqrt-weight quorum threshold: cap at 10% of sqrt(totalStaked) as a
    // rough equivalent. When totalStaked is unknown, fall back to an
    // absolute floor so voting still functions on a fresh deployment.
    const quorumThreshold = Math.max(
      Math.sqrt(totalStaked) * (GOVERNANCE_CONFIG.QUORUM_PERCENTAGE / 100),
      10, // minimum quorum weight — prevents zero-stake bootstrap from 0 quorum
    );

    // P3-03: atomic cast_vote RPC — single transaction inserts the vote row
    // and updates proposal aggregates, preventing lost updates under
    // concurrent requests. Returns updated tallies and quorum state.
    const rpcRes = await supabaseFetch('rpc/cast_vote', {
      method: 'POST',
      body: JSON.stringify({
        p_proposal_id: proposalId,
        p_voter: voter,
        p_support: support,
        p_weight: weight,
        p_quorum_threshold: quorumThreshold,
      }),
    });

    if (!rpcRes.ok) {
      const errBody = await rpcRes.text();
      // Supabase returns 409 / error text for unique_violation (double vote).
      if (/unique|duplicate|23505/i.test(errBody)) {
        return NextResponse.json(
          { success: false, error: 'Already voted on this proposal' },
          { status: 400 },
        );
      }
      console.error('[votes] cast_vote RPC failed:', errBody);
      return NextResponse.json(
        { success: false, error: 'Failed to cast vote' },
        { status: 500 },
      );
    }

    const rpcResult = await rpcRes.json();
    const tallies = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;

    return NextResponse.json({
      success: true,
      weight,
      quorumReached: tallies?.quorum_reached ?? false,
      votesFor: tallies?.votes_for ?? 0,
      votesAgainst: tallies?.votes_against ?? 0,
    });
  } catch (error: unknown) {
    console.error('Error casting vote:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

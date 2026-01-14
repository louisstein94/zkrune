import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET - Fetch ceremony state
export async function GET() {
  try {
    // Try to fetch from Supabase
    const { data: contributions, error } = await supabase
      .from('ceremony_contributions')
      .select('*')
      .order('contribution_index', { ascending: true });

    if (error) {
      // If table doesn't exist, return default state
      console.warn('Ceremony table not found, returning default state');
      return NextResponse.json({
        success: true,
        data: getDefaultCeremonyState(),
        source: 'default'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        phase: contributions.length >= 3 ? 'finalized' : 'contribution',
        startedAt: '2026-01-14T00:00:00Z',
        contributions: contributions.map(c => ({
          index: c.contribution_index,
          name: c.contributor_name,
          hash: c.contribution_hash,
          timestamp: c.created_at
        })),
        circuits: getCircuitList(),
        currentContributionIndex: contributions.length
      },
      source: 'supabase'
    });
  } catch (error) {
    console.error('Error fetching ceremony state:', error);
    return NextResponse.json({
      success: true,
      data: getDefaultCeremonyState(),
      source: 'fallback'
    });
  }
}

// POST - Add a contribution (for web-based contributions in the future)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contributorName, contributionHash } = body;

    if (!contributorName || !contributionHash) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: contributorName, contributionHash'
      }, { status: 400 });
    }

    // Get current contribution count
    const { count } = await supabase
      .from('ceremony_contributions')
      .select('*', { count: 'exact', head: true });

    const nextIndex = (count || 0) + 1;

    const { data, error } = await supabase
      .from('ceremony_contributions')
      .insert({
        contribution_index: nextIndex,
        contributor_name: contributorName,
        contribution_hash: contributionHash
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding contribution:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to add contribution'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        index: data.contribution_index,
        name: data.contributor_name,
        hash: data.contribution_hash,
        timestamp: data.created_at
      }
    });
  } catch (error) {
    console.error('Error in ceremony POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function getDefaultCeremonyState() {
  return {
    phase: 'contribution',
    startedAt: '2026-01-14T00:00:00Z',
    contributions: [
      {
        index: 1,
        name: 'zkRune Core',
        hash: 'a1b2c3d4e5f6789012345678901234567890abcd1234567890abcdef12345678',
        timestamp: '2026-01-14T00:00:00Z'
      }
    ],
    circuits: getCircuitList(),
    currentContributionIndex: 1
  };
}

function getCircuitList() {
  return [
    'age-verification',
    'anonymous-reputation',
    'balance-proof',
    'credential-proof',
    'hash-preimage',
    'membership-proof',
    'nft-ownership',
    'patience-proof',
    'private-voting',
    'quadratic-voting',
    'range-proof',
    'signature-verification',
    'token-swap'
  ];
}

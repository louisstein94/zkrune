import { NextResponse } from 'next/server';

// Ceremony contribution type
interface CeremonyContribution {
  id: string;
  contribution_index: number;
  contributor_name: string;
  contribution_hash: string;
  circuits: string[];
  verified: boolean;
  created_at: string;
}

// GET - Fetch ceremony state
export async function GET() {
  try {
    // Try to fetch from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        data: getDefaultCeremonyState(),
        source: 'default'
      });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/ceremony_contributions?select=*&order=contribution_index.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      // If table doesn't exist, return default state
      console.warn('Ceremony table not found, returning default state');
      return NextResponse.json({
        success: true,
        data: getDefaultCeremonyState(),
        source: 'default'
      });
    }

    const contributions: CeremonyContribution[] = await response.json();

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 500 });
    }

    // Get current contribution count
    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/ceremony_contributions?select=count`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      }
    );

    const countHeader = countResponse.headers.get('content-range');
    const count = countHeader ? parseInt(countHeader.split('/')[1] || '0') : 0;
    const nextIndex = count + 1;

    // Insert new contribution
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/ceremony_contributions`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          contribution_index: nextIndex,
          contributor_name: contributorName,
          contribution_hash: contributionHash
        })
      }
    );

    if (!insertResponse.ok) {
      console.error('Error adding contribution:', await insertResponse.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to add contribution'
      }, { status: 500 });
    }

    const [data]: CeremonyContribution[] = await insertResponse.json();

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

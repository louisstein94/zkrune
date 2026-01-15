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

// GET - Fetch ceremony state (storage-based for real contribution count)
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        data: getDefaultCeremonyState(),
        source: 'default'
      });
    }

    // Check if ceremony is finalized (look for _final.zkey files)
    let isFinalized = false;
    const finalCheckResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/list/ceremony-zkeys/age-verification`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    let realContributionCount = 0;
    if (finalCheckResponse.ok) {
      const files = await finalCheckResponse.json();
      const zkeyFiles = files.filter((f: { name: string }) => f.name.endsWith('.zkey'));
      
      // Check for final zkey
      isFinalized = zkeyFiles.some((f: { name: string }) => f.name.includes('_final.zkey'));
      
      if (zkeyFiles.length > 0) {
        // Find highest index (excluding final)
        const indices = zkeyFiles
          .filter((f: { name: string }) => !f.name.includes('_final'))
          .map((f: { name: string }) => {
            const match = f.name.match(/_(\d+)\.zkey$/);
            return match ? parseInt(match[1]) : 0;
          });
        realContributionCount = indices.length > 0 ? Math.max(...indices) : 0;
      }
    }
    
    // Ceremony finalization details
    const CEREMONY_BEACON = '6ca3952b1a006bea69b40bac4c78a862ca475e90e1edb570d9610cbe18d0a8bc';
    const CEREMONY_FINALIZED_AT = '2026-01-15T12:04:15Z';

    // Get contributions from DB
    const dbResponse = await fetch(
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

    let contributions: CeremonyContribution[] = [];
    if (dbResponse.ok) {
      contributions = await dbResponse.json();
    }

    // Determine phase
    let phase: string;
    if (isFinalized) {
      phase = 'finalized';
    } else if (realContributionCount >= 5) {
      phase = 'ready_to_finalize';
    } else {
      phase = 'contribution';
    }

    return NextResponse.json({
      success: true,
      data: {
        phase,
        status: isFinalized ? 'FINALIZED' : 'ACCEPTING_CONTRIBUTIONS',
        startedAt: '2026-01-14T00:00:00Z',
        finalizedAt: isFinalized ? CEREMONY_FINALIZED_AT : undefined,
        beacon: isFinalized ? CEREMONY_BEACON : undefined,
        beaconSource: isFinalized ? 'drand.cloudflare.com' : undefined,
        contributions: contributions.map(c => ({
          index: c.contribution_index,
          name: c.contributor_name,
          hash: c.contribution_hash,
          timestamp: c.created_at
        })),
        circuits: getCircuitList(),
        currentContributionIndex: realContributionCount,
        realZkeyCount: realContributionCount,
        dbRecordCount: contributions.length,
        requiredContributions: 5
      },
      source: 'storage+db'
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

    // Generate UUID for the contribution
    const id = crypto.randomUUID();

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
          id,
          contribution_index: nextIndex,
          contributor_name: contributorName,
          contribution_hash: contributionHash,
          circuits: [
            'age-verification', 'anonymous-reputation', 'balance-proof',
            'credential-proof', 'hash-preimage', 'membership-proof',
            'nft-ownership', 'patience-proof', 'private-voting',
            'quadratic-voting', 'range-proof', 'signature-verification', 'token-swap'
          ],
          verified: true
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

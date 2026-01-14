import { NextRequest, NextResponse } from 'next/server';
import { GOVERNANCE_CONFIG } from '@/lib/token/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Proposal {
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
  template_data: unknown;
  feature_data: unknown;
}

function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

// GET all proposals
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  // If Supabase is not configured, return mock data
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: getMockProposals(),
      source: 'mock',
    });
  }

  try {
    let url = `${supabaseUrl}/rest/v1/proposals?select=*&order=created_at.desc`;
    
    if (status) {
      url += `&status=eq.${status}`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data: Proposal[] = await response.json();

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({
      success: true,
      data: getMockProposals(),
      source: 'fallback',
    });
  }
}

// POST - Create new proposal
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { type, title, description, creator, templateData, featureData } = body;

    // Validate required fields
    if (!type || !title || !description || !creator) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type, title, description, creator',
      }, { status: 400 });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + GOVERNANCE_CONFIG.VOTING_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const response = await fetch(`${supabaseUrl}/rest/v1/proposals`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        type,
        title,
        description,
        creator,
        ends_at: endsAt.toISOString(),
        template_data: templateData || null,
        feature_data: featureData || null,
      })
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const [data]: Proposal[] = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error('Error creating proposal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

// Mock data fallback
function getMockProposals(): Proposal[] {
  const now = new Date();
  return [
    {
      id: 'prop_privacy_1',
      type: 'feature',
      title: 'Solana SPL Token Private Transfers',
      description: 'Implement private SPL token transfers using ZK proofs.',
      creator: 'zkRune Core',
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      votes_for: 2450,
      votes_against: 120,
      voter_count: 89,
      quorum_reached: true,
      template_data: null,
      feature_data: null,
    },
    {
      id: 'prop_privacy_2',
      type: 'template',
      title: 'Anonymous DAO Voting Template',
      description: 'A template for Solana DAOs to conduct anonymous votes.',
      creator: 'Privacy Advocate',
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      votes_for: 1890,
      votes_against: 340,
      voter_count: 156,
      quorum_reached: true,
      template_data: null,
      feature_data: null,
    },
  ];
}

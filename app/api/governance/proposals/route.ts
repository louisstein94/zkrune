import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { GOVERNANCE_CONFIG } from '@/lib/token/config';

// GET all proposals
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const creator = searchParams.get('creator');

  // If Supabase is not configured, return mock data
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: getMockProposals(),
      source: 'mock',
    });
  }

  try {
    let query = supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (creator) {
      query = query.eq('creator', creator);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: any) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
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

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        type,
        title,
        description,
        creator,
        ends_at: endsAt.toISOString(),
        template_data: templateData || null,
        feature_data: featureData || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// Mock data fallback
function getMockProposals() {
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
    },
  ];
}

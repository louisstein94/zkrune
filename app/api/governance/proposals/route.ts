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

function requireSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
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

async function finalizeExpiredProposals() {
  const now = new Date().toISOString();
  const res = await supabaseFetch(
    `proposals?status=eq.active&ends_at=lt.${now}&select=id,votes_for,votes_against,quorum_reached`
  );
  if (!res.ok) return;

  const expired: Proposal[] = await res.json();
  for (const p of expired) {
    const newStatus = p.quorum_reached && p.votes_for > p.votes_against ? 'passed' : 'rejected';
    await supabaseFetch(`proposals?id=eq.${p.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    requireSupabase();
  } catch {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    await finalizeExpiredProposals();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let url = 'proposals?select=*&order=created_at.desc';
    if (status) {
      url += `&status=eq.${status}`;
    }

    const response = await supabaseFetch(url, { next: { revalidate: 30 } } as RequestInit);
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data: Proposal[] = await response.json();

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: unknown) {
    console.error('Error fetching proposals:', error);
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
    const { type, title, description, creator, templateData, featureData } = body;

    if (!type || !title || !description || !creator) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: type, title, description, creator',
      }, { status: 400 });
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + GOVERNANCE_CONFIG.VOTING_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const response = await supabaseFetch('proposals', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        type,
        title,
        description,
        creator,
        ends_at: endsAt.toISOString(),
        template_data: templateData || null,
        feature_data: featureData || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const [data]: Proposal[] = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error creating proposal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

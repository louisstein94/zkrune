import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface BurnHistory {
  id: string;
  wallet: string;
  amount: number;
  tier: string;
  transaction_signature: string;
  created_at: string;
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

// GET burn history
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: [],
      totalBurned: 0,
      source: 'mock',
    });
  }

  try {
    let url = `burn_history?select=*&order=created_at.desc&limit=${limit}`;
    
    if (wallet) {
      url += `&wallet=eq.${wallet}`;
    }

    const response = await supabaseFetch(url);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const data: BurnHistory[] = await response.json();

    // Calculate total burned
    const totalBurned = (data || []).reduce((sum, record) => sum + record.amount, 0);

    return NextResponse.json({
      success: true,
      data: data || [],
      totalBurned,
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching burn history:', error);
    return NextResponse.json({
      success: true,
      data: [],
      totalBurned: 0,
      source: 'fallback',
    });
  }
}

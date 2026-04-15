import { NextRequest, NextResponse } from 'next/server';
import {
  isSupabaseServerConfigured,
  supabaseServerFetch,
} from '@/lib/supabase/serverClient';

interface BurnHistory {
  id: string;
  wallet: string;
  amount: number;
  tier: string;
  transaction_signature: string;
  created_at: string;
}

const isSupabaseConfigured = isSupabaseServerConfigured;
const supabaseFetch = supabaseServerFetch;

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

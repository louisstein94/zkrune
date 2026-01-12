import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

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
    let query = supabase
      .from('burn_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (wallet) {
      query = query.eq('wallet', wallet);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate total burned
    const totalBurned = (data || []).reduce((sum, record) => sum + record.amount, 0);

    return NextResponse.json({
      success: true,
      data: data || [],
      totalBurned,
      source: 'supabase',
    });
  } catch (error: any) {
    console.error('Error fetching burn history:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { PREMIUM_TIERS, type PremiumTier } from '@/lib/token/config';

// GET premium status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({
      success: false,
      error: 'Wallet address required',
    }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: {
        wallet,
        tier: 'FREE',
        total_burned: 0,
        features: PREMIUM_TIERS.FREE.features,
      },
      source: 'mock',
    });
  }

  try {
    const { data, error } = await supabase
      .from('premium_status')
      .select('*')
      .eq('wallet', wallet)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        data: {
          wallet,
          tier: 'FREE',
          total_burned: 0,
          features: PREMIUM_TIERS.FREE.features,
        },
        source: 'supabase',
      });
    }

    // Check if premium has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({
        success: true,
        data: {
          ...data,
          tier: 'FREE',
          features: PREMIUM_TIERS.FREE.features,
          expired: true,
        },
        source: 'supabase',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        features: PREMIUM_TIERS[data.tier as PremiumTier]?.features || PREMIUM_TIERS.FREE.features,
      },
      source: 'supabase',
    });
  } catch (error: any) {
    console.error('Error fetching premium status:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// POST - Burn tokens for premium upgrade
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { wallet, amount, targetTier, transactionSignature } = body;

    // Validate required fields
    if (!wallet || !amount || !targetTier || !transactionSignature) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: wallet, amount, targetTier, transactionSignature',
      }, { status: 400 });
    }

    // Validate tier
    if (!PREMIUM_TIERS[targetTier as PremiumTier]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid target tier',
      }, { status: 400 });
    }

    // Get current status
    const { data: currentStatus } = await supabase
      .from('premium_status')
      .select('*')
      .eq('wallet', wallet)
      .single();

    const currentBurned = currentStatus?.total_burned || 0;
    const newTotalBurned = currentBurned + amount;

    // Determine achieved tier based on total burned
    let achievedTier: PremiumTier = 'FREE';
    if (newTotalBurned >= PREMIUM_TIERS.ENTERPRISE.burnRequired) {
      achievedTier = 'ENTERPRISE';
    } else if (newTotalBurned >= PREMIUM_TIERS.PRO.burnRequired) {
      achievedTier = 'PRO';
    } else if (newTotalBurned >= PREMIUM_TIERS.BUILDER.burnRequired) {
      achievedTier = 'BUILDER';
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    // Upsert premium status
    const { error: statusError } = await supabase
      .from('premium_status')
      .upsert({
        wallet,
        tier: achievedTier,
        total_burned: newTotalBurned,
        unlocked_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      }, {
        onConflict: 'wallet',
      });

    if (statusError) throw statusError;

    // Add to burn history
    const { error: historyError } = await supabase
      .from('burn_history')
      .insert({
        wallet,
        amount,
        tier: achievedTier,
        transaction_signature: transactionSignature,
      });

    if (historyError) throw historyError;

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        tier: achievedTier,
        total_burned: newTotalBurned,
        amount_burned: amount,
        features: PREMIUM_TIERS[achievedTier].features,
      },
    });
  } catch (error: any) {
    console.error('Error processing burn:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

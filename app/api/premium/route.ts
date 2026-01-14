import { NextRequest, NextResponse } from 'next/server';
import { PREMIUM_TIERS, type PremiumTier } from '@/lib/token/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface PremiumStatus {
  id: string;
  wallet: string;
  tier: PremiumTier;
  total_burned: number;
  unlocked_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
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
    const response = await supabaseFetch(`premium_status?wallet=eq.${wallet}&select=*`);
    const data: PremiumStatus[] = await response.json();
    const status = data[0];

    if (!status) {
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
    if (status.expires_at && new Date(status.expires_at) < new Date()) {
      return NextResponse.json({
        success: true,
        data: {
          ...status,
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
        ...status,
        features: PREMIUM_TIERS[status.tier]?.features || PREMIUM_TIERS.FREE.features,
      },
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching premium status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
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
    const statusRes = await supabaseFetch(`premium_status?wallet=eq.${wallet}&select=*`);
    const statuses: PremiumStatus[] = await statusRes.json();
    const currentStatus = statuses[0];

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
    if (currentStatus) {
      // Update existing
      await supabaseFetch(`premium_status?wallet=eq.${wallet}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tier: achievedTier,
          total_burned: newTotalBurned,
          unlocked_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        }),
      });
    } else {
      // Insert new
      await supabaseFetch('premium_status', {
        method: 'POST',
        body: JSON.stringify({
          wallet,
          tier: achievedTier,
          total_burned: newTotalBurned,
          unlocked_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        }),
      });
    }

    // Add to burn history
    await supabaseFetch('burn_history', {
      method: 'POST',
      body: JSON.stringify({
        wallet,
        amount,
        tier: achievedTier,
        transaction_signature: transactionSignature,
      }),
    });

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
  } catch (error: unknown) {
    console.error('Error processing burn:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { MARKETPLACE_CONFIG } from '@/lib/token/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function supabaseFetch(endpoint: string) {
  return fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': supabaseKey!,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const [purchasesRes, distributionsRes] = await Promise.all([
      supabaseFetch('purchases?select=platform_fee,reward_vault_amount,treasury_amount,fee_destination,created_at'),
      supabaseFetch('treasury_distributions?select=amount,destination,created_at&order=created_at.desc'),
    ]);

    const purchases = await purchasesRes.json();
    const distributions = await distributionsRes.json();

    const totalPlatformFees = (purchases || []).reduce(
      (sum: number, p: { platform_fee: number }) => sum + (p.platform_fee || 0), 0,
    );

    const totalToRewardVault = (purchases || []).reduce(
      (sum: number, p: { reward_vault_amount?: number }) => sum + (p.reward_vault_amount || 0), 0,
    );

    const totalToTreasury = (purchases || []).reduce(
      (sum: number, p: { treasury_amount?: number }) => sum + (p.treasury_amount || 0), 0,
    );

    const manualDistributions = (distributions || []).reduce(
      (sum: number, d: { amount: number }) => sum + d.amount, 0,
    );

    return NextResponse.json({
      success: true,
      data: {
        config: {
          platformFeePercent: MARKETPLACE_CONFIG.PLATFORM_FEE,
          rewardPoolSharePercent: MARKETPLACE_CONFIG.REWARD_POOL_SHARE,
          treasurySharePercent: 100 - MARKETPLACE_CONFIG.REWARD_POOL_SHARE,
        },
        totals: {
          platformFeesCollected: totalPlatformFees,
          routedToRewardVault: totalToRewardVault,
          routedToTreasury: totalToTreasury,
          manualDistributions,
          totalPurchases: (purchases || []).length,
        },
        recentDistributions: (distributions || []).slice(0, 20),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

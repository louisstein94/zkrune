import { NextRequest, NextResponse } from 'next/server';
import { STAKING_CONFIG } from '@/lib/token/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface StakingPosition {
  id: string;
  staker: string;
  amount: number;
  lock_period_days: number;
  multiplier: number;
  staked_at: string;
  unlocks_at: string;
  last_claim_at: string;
  total_claimed: number;
  is_active: boolean;
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

// GET staking positions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const staker = searchParams.get('staker');
  const activeOnly = searchParams.get('activeOnly') === 'true';

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: [],
      stats: {
        totalStaked: 0,
        totalStakers: 0,
        averageAPY: STAKING_CONFIG.BASE_APY,
        totalRewardsPaid: 0,
      },
      source: 'mock',
    });
  }

  try {
    let url = 'staking_positions?select=*&order=staked_at.desc';
    
    if (staker) {
      url += `&staker=eq.${staker}`;
    }
    if (activeOnly) {
      url += '&is_active=eq.true';
    }

    const response = await supabaseFetch(url);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const data: StakingPosition[] = await response.json();

    // Calculate stats
    const activePositions = (data || []).filter(p => p.is_active);
    const uniqueStakers = new Set(activePositions.map(p => p.staker));
    const totalStaked = activePositions.reduce((sum, p) => sum + p.amount, 0);
    const totalRewardsPaid = (data || []).reduce((sum, p) => sum + p.total_claimed, 0);

    let weightedAPY = 0;
    activePositions.forEach(pos => {
      const effectiveAPY = Math.min(STAKING_CONFIG.BASE_APY * pos.multiplier, STAKING_CONFIG.MAX_APY);
      weightedAPY += pos.amount * effectiveAPY;
    });
    const averageAPY = totalStaked > 0 ? weightedAPY / totalStaked : STAKING_CONFIG.BASE_APY;

    return NextResponse.json({
      success: true,
      data: data || [],
      stats: {
        totalStaked,
        totalStakers: uniqueStakers.size,
        averageAPY,
        totalRewardsPaid,
      },
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching staking positions:', error);
    return NextResponse.json({
      success: true,
      data: [],
      stats: {
        totalStaked: 0,
        totalStakers: 0,
        averageAPY: STAKING_CONFIG.BASE_APY,
        totalRewardsPaid: 0,
      },
      source: 'fallback',
    });
  }
}

// POST - Create a new stake
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { staker, amount, lockPeriodDays } = body;

    // Validate required fields
    if (!staker || !amount || !lockPeriodDays) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: staker, amount, lockPeriodDays',
      }, { status: 400 });
    }

    // Validate minimum stake
    if (amount < STAKING_CONFIG.MIN_STAKE) {
      return NextResponse.json({
        success: false,
        error: `Minimum stake is ${STAKING_CONFIG.MIN_STAKE} zkRUNE`,
      }, { status: 400 });
    }

    // Find lock period config
    const lockConfig = STAKING_CONFIG.LOCK_PERIODS.find(lp => lp.days === lockPeriodDays);
    if (!lockConfig) {
      return NextResponse.json({
        success: false,
        error: 'Invalid lock period',
      }, { status: 400 });
    }

    const now = new Date();
    const unlocksAt = new Date(now.getTime() + lockPeriodDays * 24 * 60 * 60 * 1000);

    const response = await supabaseFetch('staking_positions', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        staker,
        amount,
        lock_period_days: lockPeriodDays,
        multiplier: lockConfig.multiplier,
        unlocks_at: unlocksAt.toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Failed to create stake');

    const [data]: StakingPosition[] = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error('Error creating stake:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

// PATCH - Claim rewards or unstake
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { positionId, staker, action } = body;

    if (!positionId || !staker || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: positionId, staker, action',
      }, { status: 400 });
    }

    // Get position
    const posResponse = await supabaseFetch(
      `staking_positions?id=eq.${positionId}&staker=eq.${staker}&select=*`
    );
    const positions: StakingPosition[] = await posResponse.json();
    const position = positions[0];

    if (!position) {
      return NextResponse.json({
        success: false,
        error: 'Position not found',
      }, { status: 404 });
    }

    if (!position.is_active) {
      return NextResponse.json({
        success: false,
        error: 'Position is not active',
      }, { status: 400 });
    }

    const now = new Date();

    if (action === 'claim') {
      // Calculate pending rewards
      const lastClaim = new Date(position.last_claim_at);
      const daysSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastClaim < 1) {
        return NextResponse.json({
          success: false,
          error: 'No rewards to claim yet',
        }, { status: 400 });
      }

      const effectiveAPY = Math.min(STAKING_CONFIG.BASE_APY * position.multiplier, STAKING_CONFIG.MAX_APY);
      const dailyRate = effectiveAPY / 365 / 100;
      const rewards = position.amount * dailyRate * Math.floor(daysSinceLastClaim);

      await supabaseFetch(`staking_positions?id=eq.${positionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          last_claim_at: now.toISOString(),
          total_claimed: position.total_claimed + rewards,
        }),
      });

      return NextResponse.json({
        success: true,
        rewards,
      });
    }

    if (action === 'unstake') {
      const isLocked = now < new Date(position.unlocks_at);
      const penalty = isLocked ? position.amount * 0.5 : 0;
      const returnAmount = position.amount - penalty;

      // Calculate final rewards
      const lastClaim = new Date(position.last_claim_at);
      const daysSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24);
      const effectiveAPY = Math.min(STAKING_CONFIG.BASE_APY * position.multiplier, STAKING_CONFIG.MAX_APY);
      const dailyRate = effectiveAPY / 365 / 100;
      const pendingRewards = position.amount * dailyRate * Math.floor(daysSinceLastClaim);
      const finalRewards = isLocked ? 0 : pendingRewards;

      await supabaseFetch(`staking_positions?id=eq.${positionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_active: false,
          total_claimed: position.total_claimed + finalRewards,
        }),
      });

      return NextResponse.json({
        success: true,
        returnAmount,
        rewards: finalRewards,
        penalty,
        earlyWithdrawal: isLocked,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use "claim" or "unstake"',
    }, { status: 400 });
  } catch (error: unknown) {
    console.error('Error updating stake:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

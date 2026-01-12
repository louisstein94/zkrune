import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { STAKING_CONFIG } from '@/lib/token/config';

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
    let query = supabase
      .from('staking_positions')
      .select('*')
      .order('staked_at', { ascending: false });

    if (staker) {
      query = query.eq('staker', staker);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;

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
  } catch (error: any) {
    console.error('Error fetching staking positions:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
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

    const { data, error } = await supabase
      .from('staking_positions')
      .insert({
        staker,
        amount,
        lock_period_days: lockPeriodDays,
        multiplier: lockConfig.multiplier,
        unlocks_at: unlocksAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error creating stake:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
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
    const { data: position, error: posError } = await supabase
      .from('staking_positions')
      .select('*')
      .eq('id', positionId)
      .eq('staker', staker)
      .single();

    if (posError || !position) {
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

      const { error: updateError } = await supabase
        .from('staking_positions')
        .update({
          last_claim_at: now.toISOString(),
          total_claimed: position.total_claimed + rewards,
        })
        .eq('id', positionId);

      if (updateError) throw updateError;

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

      const { error: updateError } = await supabase
        .from('staking_positions')
        .update({
          is_active: false,
          total_claimed: position.total_claimed + finalRewards,
        })
        .eq('id', positionId);

      if (updateError) throw updateError;

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
  } catch (error: any) {
    console.error('Error updating stake:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

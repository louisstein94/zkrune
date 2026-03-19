import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { STAKING_CONFIG, ZKRUNE_TOKEN } from '@/lib/token/config';
import { verifyAuth } from '@/lib/auth/verifyWalletSignature';
import {
  getTxAccountKeys,
  getTokenTransferDeltas,
  verifySplTransferToDestination,
  toRawAmount,
} from '@/lib/solana/txVerification';

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
  transaction_signature: string;
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
    const { staker, amount, lockPeriodDays, transactionSignature, signedMessage, signature } = body;

    // Validate required fields — transactionSignature proves tokens were locked on-chain
    if (!staker || !amount || !lockPeriodDays || !transactionSignature || !signedMessage || !signature) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: staker, amount, lockPeriodDays, transactionSignature, signedMessage, signature',
      }, { status: 400 });
    }

    // Verify caller owns the staker wallet AND that all critical params are bound in the signature
    if (!verifyAuth(
      { wallet: staker, signedMessage, signature },
      'stake',
      { amount: String(amount), lockPeriodDays: String(lockPeriodDays), transactionSignature },
    )) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired wallet signature',
      }, { status: 401 });
    }

    // Prevent replay: reject if this txSig has already been used for a stake position
    const existingTxRes = await supabaseFetch(
      `staking_positions?transaction_signature=eq.${transactionSignature}&select=id`
    );
    const existingTx = await existingTxRes.json();
    if (Array.isArray(existingTx) && existingTx.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'This transaction has already been used to create a stake position',
      }, { status: 400 });
    }

    // ── On-chain transfer verification ───────────────────────────────────────
    // STAKE_VAULT_AUTHORITY is the wallet that *owns* the vault ATA.
    // The vault token account is the canonical ATA derived from (mint, authority).
    if (!ZKRUNE_TOKEN.STAKE_VAULT_AUTHORITY) {
      return NextResponse.json({
        success: false,
        error: 'Stake vault authority not configured on server',
      }, { status: 503 });
    }

    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const mintPubkey = new PublicKey(ZKRUNE_TOKEN.MINT_ADDRESS);
    const stakerPubkey = new PublicKey(staker);
    // vaultAuthority is the owner wallet; vaultAta is the actual token account
    const vaultAuthority = new PublicKey(ZKRUNE_TOKEN.STAKE_VAULT_AUTHORITY);

    const txInfo = await connection.getTransaction(transactionSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (!txInfo || txInfo.meta?.err !== null) {
      return NextResponse.json({
        success: false,
        error: 'Stake transaction not found or failed on-chain',
      }, { status: 400 });
    }

    const accountKeys = getTxAccountKeys(txInfo as any);

    // Fee payer must be the staker
    if (!accountKeys[0]?.equals(stakerPubkey)) {
      return NextResponse.json({
        success: false,
        error: 'Transaction fee payer does not match staker wallet',
      }, { status: 400 });
    }

    // Derive the canonical ATAs — staker owns theirs, vault authority owns the vault's
    const stakerAta = getAssociatedTokenAddressSync(mintPubkey, stakerPubkey);
    const vaultAta = getAssociatedTokenAddressSync(mintPubkey, vaultAuthority);

    const stakerAtaIndex = accountKeys.findIndex(k => k.equals(stakerAta));
    if (stakerAtaIndex < 0) {
      return NextResponse.json({
        success: false,
        error: 'Staker zkRUNE ATA not found in transaction accounts',
      }, { status: 400 });
    }

    const vaultAtaIndex = accountKeys.findIndex(k => k.equals(vaultAta));
    if (vaultAtaIndex < 0) {
      return NextResponse.json({
        success: false,
        error: 'Stake vault ATA not found in transaction accounts',
      }, { status: 400 });
    }

    // Both the staker ATA must decrease AND the vault ATA must increase by at least `amount`
    let sourceDelta: bigint;
    let destDelta: bigint;
    try {
      ({ sourceDelta, destDelta } = getTokenTransferDeltas(
        txInfo as any,
        stakerAtaIndex,
        vaultAtaIndex,
        ZKRUNE_TOKEN.MINT_ADDRESS,
      ));
    } catch (err: unknown) {
      return NextResponse.json({
        success: false,
        error: `Token balance check failed: ${err instanceof Error ? err.message : String(err)}`,
      }, { status: 400 });
    }

    const rawAmount = toRawAmount(amount, ZKRUNE_TOKEN.DECIMALS);
    if (sourceDelta < rawAmount) {
      return NextResponse.json({
        success: false,
        error: `Staker ATA decrease (${sourceDelta}) is less than required stake amount (${rawAmount})`,
      }, { status: 400 });
    }
    if (destDelta < rawAmount) {
      return NextResponse.json({
        success: false,
        error: `Vault ATA increase (${destDelta}) is less than required stake amount (${rawAmount})`,
      }, { status: 400 });
    }

    // Confirm an SPL Transfer instruction explicitly routes stakerAta → vaultAta
    try {
      verifySplTransferToDestination(txInfo as any, accountKeys, stakerAta, vaultAta);
    } catch (err: unknown) {
      return NextResponse.json({
        success: false,
        error: `Transfer instruction check failed: ${err instanceof Error ? err.message : String(err)}`,
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
        transaction_signature: transactionSignature,
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
    const { positionId, staker, action, signedMessage, signature } = body;

    if (!positionId || !staker || !action || !signedMessage || !signature) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: positionId, staker, action, signedMessage, signature',
      }, { status: 400 });
    }

    // positionId is bound in the signature so the message can't be replayed
    // against a different position
    if (!verifyAuth(
      { wallet: staker, signedMessage, signature },
      action,
      { positionId },
    )) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired wallet signature',
      }, { status: 401 });
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

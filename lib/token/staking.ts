// zkRune Staking Rewards System
// Long-term holder incentives

import { STAKING_CONFIG } from './config';

export interface StakePosition {
  id: string;
  staker: string;
  amount: number;
  lockPeriodDays: number;
  multiplier: number;
  stakedAt: Date;
  unlocksAt: Date;
  lastClaimAt: Date;
  totalClaimed: number;
  isActive: boolean;
}

export interface StakingStats {
  totalStaked: number;
  totalStakers: number;
  averageAPY: number;
  totalRewardsPaid: number;
}

export interface UserStakingInfo {
  positions: StakePosition[];
  totalStaked: number;
  totalPendingRewards: number;
  totalClaimed: number;
  effectiveAPY: number;
}

// Local storage key
const STAKING_KEY = 'zkrune_staking_positions';

// Get all staking positions
export function getAllPositions(): StakePosition[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STAKING_KEY);
    if (!stored) return [];
    
    const positions = JSON.parse(stored);
    return positions.map((p: any) => ({
      ...p,
      stakedAt: new Date(p.stakedAt),
      unlocksAt: new Date(p.unlocksAt),
      lastClaimAt: new Date(p.lastClaimAt),
    }));
  } catch {
    return [];
  }
}

// Get user's staking positions
export function getUserPositions(staker: string): StakePosition[] {
  return getAllPositions().filter(p => p.staker === staker && p.isActive);
}

// Get user's complete staking info
export function getUserStakingInfo(staker: string): UserStakingInfo {
  const positions = getUserPositions(staker);
  
  const totalStaked = positions.reduce((sum, p) => sum + p.amount, 0);
  const totalClaimed = positions.reduce((sum, p) => sum + p.totalClaimed, 0);
  
  let totalPendingRewards = 0;
  let weightedAPY = 0;
  
  positions.forEach(pos => {
    const pending = calculatePendingRewards(pos);
    totalPendingRewards += pending;
    weightedAPY += pos.amount * getEffectiveAPY(pos.multiplier);
  });
  
  const effectiveAPY = totalStaked > 0 ? weightedAPY / totalStaked : 0;

  return {
    positions,
    totalStaked,
    totalPendingRewards,
    totalClaimed,
    effectiveAPY,
  };
}

// Create a new stake
export function createStake(
  staker: string,
  amount: number,
  lockPeriodDays: number
): { success: boolean; position?: StakePosition; error?: string } {
  // Validate minimum stake
  if (amount < STAKING_CONFIG.MIN_STAKE) {
    return {
      success: false,
      error: `Minimum stake is ${STAKING_CONFIG.MIN_STAKE} zkRUNE`,
    };
  }

  // Find lock period config
  const lockConfig = STAKING_CONFIG.LOCK_PERIODS.find(lp => lp.days === lockPeriodDays);
  if (!lockConfig) {
    return {
      success: false,
      error: 'Invalid lock period',
    };
  }

  const now = new Date();
  const unlocksAt = new Date(now.getTime() + lockPeriodDays * 24 * 60 * 60 * 1000);

  const position: StakePosition = {
    id: `stake_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    staker,
    amount,
    lockPeriodDays,
    multiplier: lockConfig.multiplier,
    stakedAt: now,
    unlocksAt,
    lastClaimAt: now,
    totalClaimed: 0,
    isActive: true,
  };

  const positions = getAllPositions();
  positions.push(position);
  savePositions(positions);

  return { success: true, position };
}

// Claim pending rewards
export function claimRewards(
  positionId: string,
  staker: string
): { success: boolean; amount?: number; error?: string } {
  const positions = getAllPositions();
  const positionIndex = positions.findIndex(p => p.id === positionId && p.staker === staker);
  
  if (positionIndex === -1) {
    return { success: false, error: 'Position not found' };
  }

  const position = positions[positionIndex];
  if (!position.isActive) {
    return { success: false, error: 'Position is not active' };
  }

  const pendingRewards = calculatePendingRewards(position);
  if (pendingRewards <= 0) {
    return { success: false, error: 'No rewards to claim' };
  }

  // Update position
  positions[positionIndex] = {
    ...position,
    lastClaimAt: new Date(),
    totalClaimed: position.totalClaimed + pendingRewards,
  };
  savePositions(positions);

  return { success: true, amount: pendingRewards };
}

// Unstake tokens
export function unstake(
  positionId: string,
  staker: string
): { success: boolean; amount?: number; rewards?: number; error?: string } {
  const positions = getAllPositions();
  const positionIndex = positions.findIndex(p => p.id === positionId && p.staker === staker);
  
  if (positionIndex === -1) {
    return { success: false, error: 'Position not found' };
  }

  const position = positions[positionIndex];
  if (!position.isActive) {
    return { success: false, error: 'Position already unstaked' };
  }

  const now = new Date();
  const isLocked = now < position.unlocksAt;
  
  // Calculate early withdrawal penalty (50% of staked amount)
  const penalty = isLocked ? position.amount * 0.5 : 0;
  const returnAmount = position.amount - penalty;
  
  // Calculate final rewards
  const pendingRewards = calculatePendingRewards(position);
  const finalRewards = isLocked ? 0 : pendingRewards; // No rewards if early withdrawal

  // Deactivate position
  positions[positionIndex] = {
    ...position,
    isActive: false,
    totalClaimed: position.totalClaimed + finalRewards,
  };
  savePositions(positions);

  return {
    success: true,
    amount: returnAmount,
    rewards: finalRewards,
  };
}

// Calculate pending rewards for a position
export function calculatePendingRewards(position: StakePosition): number {
  if (!position.isActive) return 0;

  const now = new Date();
  const lastClaim = position.lastClaimAt;
  const daysSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastClaim < 1) return 0; // Minimum 1 day between claims

  const effectiveAPY = getEffectiveAPY(position.multiplier);
  const dailyRate = effectiveAPY / 365 / 100;
  
  return position.amount * dailyRate * Math.floor(daysSinceLastClaim);
}

// Get effective APY based on multiplier
export function getEffectiveAPY(multiplier: number): number {
  const apy = STAKING_CONFIG.BASE_APY * multiplier;
  return Math.min(apy, STAKING_CONFIG.MAX_APY);
}

// Get global staking statistics
export function getStakingStats(): StakingStats {
  const positions = getAllPositions();
  const activePositions = positions.filter(p => p.isActive);
  const uniqueStakers = new Set(activePositions.map(p => p.staker));

  const totalStaked = activePositions.reduce((sum, p) => sum + p.amount, 0);
  const totalRewardsPaid = positions.reduce((sum, p) => sum + p.totalClaimed, 0);
  
  let weightedAPY = 0;
  activePositions.forEach(pos => {
    weightedAPY += pos.amount * getEffectiveAPY(pos.multiplier);
  });
  const averageAPY = totalStaked > 0 ? weightedAPY / totalStaked : STAKING_CONFIG.BASE_APY;

  return {
    totalStaked,
    totalStakers: uniqueStakers.size,
    averageAPY,
    totalRewardsPaid,
  };
}

// Get time until unlock
export function getTimeUntilUnlock(position: StakePosition): {
  days: number;
  hours: number;
  isUnlocked: boolean;
} {
  const now = new Date();
  const diff = position.unlocksAt.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, isUnlocked: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return { days, hours, isUnlocked: false };
}

// Helper function to save positions
function savePositions(positions: StakePosition[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STAKING_KEY, JSON.stringify(positions));
}

// Get lock period options for display
export function getLockPeriodOptions(): Array<{
  days: number;
  name: string;
  multiplier: number;
  apy: number;
}> {
  return STAKING_CONFIG.LOCK_PERIODS.map(lp => ({
    ...lp,
    apy: getEffectiveAPY(lp.multiplier),
  }));
}


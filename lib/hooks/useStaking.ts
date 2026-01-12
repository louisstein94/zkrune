import { useState, useEffect, useCallback } from 'react';
import { STAKING_CONFIG } from '@/lib/token/config';

export interface StakePosition {
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

export function useStaking(walletAddress?: string) {
  const [positions, setPositions] = useState<StakePosition[]>([]);
  const [stats, setStats] = useState<StakingStats>({
    totalStaked: 0,
    totalStakers: 0,
    averageAPY: STAKING_CONFIG.BASE_APY,
    totalRewardsPaid: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (walletAddress) params.set('staker', walletAddress);
      params.set('activeOnly', 'true');

      const response = await fetch(`/api/staking?${params}`);
      const data = await response.json();

      if (data.success) {
        setPositions(data.data);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch staking positions');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const createStake = useCallback(async (
    staker: string,
    amount: number,
    lockPeriodDays: number
  ) => {
    try {
      const response = await fetch('/api/staking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staker, amount, lockPeriodDays }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPositions();
        return { success: true, position: data.data };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchPositions]);

  const claimRewards = useCallback(async (positionId: string, staker: string) => {
    try {
      const response = await fetch('/api/staking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId, staker, action: 'claim' }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPositions();
        return { success: true, rewards: data.rewards };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchPositions]);

  const unstake = useCallback(async (positionId: string, staker: string) => {
    try {
      const response = await fetch('/api/staking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId, staker, action: 'unstake' }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPositions();
        return {
          success: true,
          returnAmount: data.returnAmount,
          rewards: data.rewards,
          penalty: data.penalty,
          earlyWithdrawal: data.earlyWithdrawal,
        };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchPositions]);

  const calculatePendingRewards = useCallback((position: StakePosition): number => {
    if (!position.is_active) return 0;

    const now = new Date();
    const lastClaim = new Date(position.last_claim_at);
    const daysSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastClaim < 1) return 0;

    const effectiveAPY = Math.min(STAKING_CONFIG.BASE_APY * position.multiplier, STAKING_CONFIG.MAX_APY);
    const dailyRate = effectiveAPY / 365 / 100;

    return position.amount * dailyRate * Math.floor(daysSinceLastClaim);
  }, []);

  const getTimeUntilUnlock = useCallback((position: StakePosition) => {
    const now = new Date();
    const unlockDate = new Date(position.unlocks_at);
    const diff = unlockDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, isUnlocked: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return { days, hours, isUnlocked: false };
  }, []);

  const getUserInfo = useCallback((): UserStakingInfo => {
    const userPositions = positions.filter(p => p.is_active);
    const totalStaked = userPositions.reduce((sum, p) => sum + p.amount, 0);
    const totalClaimed = userPositions.reduce((sum, p) => sum + p.total_claimed, 0);

    let totalPendingRewards = 0;
    let weightedAPY = 0;

    userPositions.forEach(pos => {
      totalPendingRewards += calculatePendingRewards(pos);
      const effectiveAPY = Math.min(STAKING_CONFIG.BASE_APY * pos.multiplier, STAKING_CONFIG.MAX_APY);
      weightedAPY += pos.amount * effectiveAPY;
    });

    const effectiveAPY = totalStaked > 0 ? weightedAPY / totalStaked : 0;

    return {
      positions: userPositions,
      totalStaked,
      totalPendingRewards,
      totalClaimed,
      effectiveAPY,
    };
  }, [positions, calculatePendingRewards]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    positions,
    stats,
    isLoading,
    error,
    fetchPositions,
    createStake,
    claimRewards,
    unstake,
    calculatePendingRewards,
    getTimeUntilUnlock,
    getUserInfo,
    lockPeriodOptions: STAKING_CONFIG.LOCK_PERIODS.map(lp => ({
      ...lp,
      apy: Math.min(STAKING_CONFIG.BASE_APY * lp.multiplier, STAKING_CONFIG.MAX_APY),
    })),
  };
}

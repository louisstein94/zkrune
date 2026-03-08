import { useState, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { STAKING_TOKEN_CONFIG, getSolscanUrl } from '@/lib/solana/config';
import { BN } from 'bn.js';

// Program ID from deployed staking program (devnet)
// Will be updated after mainnet deployment
const STAKING_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_STAKING_PROGRAM_ID || '44ToPJzWsnqJRhvFS5wXLsgWGWpbe3YwhU9t8LkQBRiX'
);

// Seeds for PDAs
const STAKING_POOL_SEED = Buffer.from('staking_pool');
const STAKE_VAULT_SEED = Buffer.from('stake_vault');
const REWARD_VAULT_SEED = Buffer.from('reward_vault');
const USER_STAKE_SEED = Buffer.from('user_stake');

// Lock period options matching on-chain program
export const LOCK_PERIODS = [
  { days: 30, index: 0, multiplier: 1.0, label: '30 Days' },
  { days: 90, index: 1, multiplier: 1.5, label: '90 Days' },
  { days: 180, index: 2, multiplier: 2.0, label: '180 Days' },
  { days: 365, index: 3, multiplier: 3.0, label: '365 Days' },
];

interface StakeResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  amount?: number;
  lockPeriod?: number;
  error?: string;
}

interface UnstakeResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  returnAmount?: number;
  penalty?: number;
  rewards?: number;
  error?: string;
}

interface ClaimResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  rewards?: number;
  error?: string;
}

interface PoolState {
  totalStaked: number;
  totalStakers: number;
  rewardPoolBalance: number;
  totalRewardsDistributed: number;
  baseApyBps: number;
  minStakeAmount: number;
}

interface UserStakeState {
  amount: number;
  lockPeriodIndex: number;
  stakedAt: Date;
  unlocksAt: Date;
  lastClaimAt: Date;
  totalClaimed: number;
  isActive: boolean;
  pendingRewards: number;
}

interface StakingOnChainState {
  isStaking: boolean;
  isUnstaking: boolean;
  isClaiming: boolean;
  isLoading: boolean;
  result: StakeResult | UnstakeResult | ClaimResult | null;
  error: string | null;
  poolState: PoolState | null;
  userStake: UserStakeState | null;
}

export function useStakingOnChain() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [state, setState] = useState<StakingOnChainState>({
    isStaking: false,
    isUnstaking: false,
    isClaiming: false,
    isLoading: false,
    result: null,
    error: null,
    poolState: null,
    userStake: null,
  });

  const tokenMint = useMemo(() => 
    new PublicKey(STAKING_TOKEN_CONFIG.MINT_ADDRESS), 
    []
  );

  // Derive PDAs
  const stakingPoolPda = useMemo(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [STAKING_POOL_SEED, tokenMint.toBuffer()],
      STAKING_PROGRAM_ID
    );
    return pda;
  }, [tokenMint]);

  const stakeVaultPda = useMemo(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [STAKE_VAULT_SEED, stakingPoolPda.toBuffer()],
      STAKING_PROGRAM_ID
    );
    return pda;
  }, [stakingPoolPda]);

  const rewardVaultPda = useMemo(() => {
    const [pda] = PublicKey.findProgramAddressSync(
      [REWARD_VAULT_SEED, stakingPoolPda.toBuffer()],
      STAKING_PROGRAM_ID
    );
    return pda;
  }, [stakingPoolPda]);

  const userStakePda = useMemo(() => {
    if (!publicKey) return null;
    const [pda] = PublicKey.findProgramAddressSync(
      [USER_STAKE_SEED, stakingPoolPda.toBuffer(), publicKey.toBuffer()],
      STAKING_PROGRAM_ID
    );
    return pda;
  }, [publicKey, stakingPoolPda]);

  /**
   * Check if program is deployed and pool is initialized
   */
  const isProgramReady = useCallback(async (): Promise<boolean> => {
    try {
      const poolAccount = await connection.getAccountInfo(stakingPoolPda);
      return poolAccount !== null;
    } catch {
      return false;
    }
  }, [connection, stakingPoolPda]);

  /**
   * Fetch pool state from on-chain
   */
  const fetchPoolState = useCallback(async (): Promise<PoolState | null> => {
    try {
      const accountInfo = await connection.getAccountInfo(stakingPoolPda);
      if (!accountInfo) return null;

      // Parse account data (skip 8-byte discriminator)
      const data = accountInfo.data;
      if (data.length < 8) return null;

      // Manual parsing based on account structure
      // StakingPool: authority(32) + token_mint(32) + stake_vault(32) + reward_vault(32) + 
      //              total_staked(8) + total_stakers(4) + total_rewards_distributed(8) + 
      //              reward_pool_balance(8) + lock_periods(40) + min_stake_amount(8) + 
      //              base_apy_bps(2) + early_withdrawal_penalty_bps(2) + bump(1)
      const offset = 8; // discriminator
      const totalStaked = data.readBigUInt64LE(offset + 128);
      const totalStakers = data.readUInt32LE(offset + 136);
      const totalRewardsDistributed = data.readBigUInt64LE(offset + 140);
      const rewardPoolBalance = data.readBigUInt64LE(offset + 148);
      const minStakeAmount = data.readBigUInt64LE(offset + 196);
      const baseApyBps = data.readUInt16LE(offset + 204);

      const decimals = STAKING_TOKEN_CONFIG.DECIMALS;
      const poolState: PoolState = {
        totalStaked: Number(totalStaked) / Math.pow(10, decimals),
        totalStakers,
        rewardPoolBalance: Number(rewardPoolBalance) / Math.pow(10, decimals),
        totalRewardsDistributed: Number(totalRewardsDistributed) / Math.pow(10, decimals),
        baseApyBps,
        minStakeAmount: Number(minStakeAmount) / Math.pow(10, decimals),
      };

      setState(prev => ({ ...prev, poolState }));
      return poolState;
    } catch (error) {
      console.error('Failed to fetch pool state:', error);
      return null;
    }
  }, [connection, stakingPoolPda]);

  /**
   * Fetch user stake position from on-chain
   */
  const fetchUserStake = useCallback(async (): Promise<UserStakeState | null> => {
    if (!userStakePda) return null;

    try {
      const accountInfo = await connection.getAccountInfo(userStakePda);
      if (!accountInfo) return null;

      const data = accountInfo.data;
      if (data.length < 8) return null;

      // Parse UserStake: owner(32) + pool(32) + amount(8) + lock_period_index(1) + 
      //                  staked_at(8) + unlock_at(8) + last_claim_at(8) + total_claimed(8) + 
      //                  is_active(1) + bump(1)
      const offset = 8;
      const amount = data.readBigUInt64LE(offset + 64);
      const lockPeriodIndex = data.readUInt8(offset + 72);
      const stakedAt = data.readBigInt64LE(offset + 73);
      const unlocksAt = data.readBigInt64LE(offset + 81);
      const lastClaimAt = data.readBigInt64LE(offset + 89);
      const totalClaimed = data.readBigUInt64LE(offset + 97);
      const isActive = data.readUInt8(offset + 105) === 1;

      const decimals = STAKING_TOKEN_CONFIG.DECIMALS;
      
      // Calculate pending rewards (simplified - actual calculation on-chain)
      const now = Math.floor(Date.now() / 1000);
      const secondsSinceLastClaim = now - Number(lastClaimAt);
      const lockPeriod = LOCK_PERIODS[lockPeriodIndex] || LOCK_PERIODS[0];
      const baseApy = state.poolState?.baseApyBps || 1200;
      const effectiveApy = (baseApy * lockPeriod.multiplier) / 10000;
      const pendingRewards = (Number(amount) / Math.pow(10, decimals)) * effectiveApy * (secondsSinceLastClaim / 31536000);

      const userStake: UserStakeState = {
        amount: Number(amount) / Math.pow(10, decimals),
        lockPeriodIndex,
        stakedAt: new Date(Number(stakedAt) * 1000),
        unlocksAt: new Date(Number(unlocksAt) * 1000),
        lastClaimAt: new Date(Number(lastClaimAt) * 1000),
        totalClaimed: Number(totalClaimed) / Math.pow(10, decimals),
        isActive,
        pendingRewards: Math.max(0, pendingRewards),
      };

      setState(prev => ({ ...prev, userStake }));
      return userStake;
    } catch (error) {
      console.error('Failed to fetch user stake:', error);
      return null;
    }
  }, [connection, userStakePda, state.poolState]);

  /**
   * Stake tokens on-chain
   */
  const stakeTokens = useCallback(async (
    amount: number, 
    lockPeriodIndex: number
  ): Promise<StakeResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }

    if (lockPeriodIndex < 0 || lockPeriodIndex > 3) {
      return { success: false, error: 'Invalid lock period' };
    }

    setState(prev => ({ ...prev, isStaking: true, result: null, error: null }));

    try {
      const decimals = STAKING_TOKEN_CONFIG.DECIMALS;
      const rawAmount = new BN(Math.floor(amount * Math.pow(10, decimals)));

      const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey);

      // Build stake instruction
      // Discriminator for "stake": sha256("global:stake")[0..8]
      const stakeDiscriminator = Buffer.from([206, 176, 202, 18, 200, 209, 179, 108]);
      
      const instructionData = Buffer.alloc(8 + 8 + 1);
      stakeDiscriminator.copy(instructionData, 0);
      instructionData.writeBigUInt64LE(BigInt(rawAmount.toString()), 8);
      instructionData.writeUInt8(lockPeriodIndex, 16);

      const stakeInstruction = {
        programId: STAKING_PROGRAM_ID,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: stakingPoolPda, isSigner: false, isWritable: true },
          { pubkey: userStakePda!, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: stakeVaultPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: instructionData,
      };

      const transaction = new Transaction().add(stakeInstruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const result: StakeResult = {
        success: true,
        signature,
        explorerUrl: getSolscanUrl(signature, 'tx'),
        amount,
        lockPeriod: LOCK_PERIODS[lockPeriodIndex].days,
      };

      setState(prev => ({ 
        ...prev, 
        isStaking: false, 
        result, 
        error: null 
      }));

      // Refresh state
      await fetchPoolState();
      await fetchUserStake();

      return result;
    } catch (error: any) {
      console.error('Staking failed:', error);
      const errorMessage = error.message || 'Staking failed';
      
      setState(prev => ({ 
        ...prev, 
        isStaking: false, 
        result: { success: false, error: errorMessage }, 
        error: errorMessage 
      }));

      return { success: false, error: errorMessage };
    }
  }, [publicKey, connection, sendTransaction, tokenMint, stakingPoolPda, userStakePda, stakeVaultPda, fetchPoolState, fetchUserStake]);

  /**
   * Unstake tokens from on-chain
   */
  const unstakeTokens = useCallback(async (): Promise<UnstakeResult> => {
    if (!publicKey || !userStakePda) {
      return { success: false, error: 'Wallet not connected' };
    }

    setState(prev => ({ ...prev, isUnstaking: true, result: null, error: null }));

    try {
      const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey);

      // Discriminator for "unstake"
      const unstakeDiscriminator = Buffer.from([90, 95, 107, 42, 205, 124, 50, 225]);

      const unstakeInstruction = {
        programId: STAKING_PROGRAM_ID,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: stakingPoolPda, isSigner: false, isWritable: true },
          { pubkey: userStakePda, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: stakeVaultPda, isSigner: false, isWritable: true },
          { pubkey: rewardVaultPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: unstakeDiscriminator,
      };

      const transaction = new Transaction().add(unstakeInstruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const result: UnstakeResult = {
        success: true,
        signature,
        explorerUrl: getSolscanUrl(signature, 'tx'),
      };

      setState(prev => ({ 
        ...prev, 
        isUnstaking: false, 
        result, 
        error: null,
        userStake: null,
      }));

      await fetchPoolState();

      return result;
    } catch (error: any) {
      console.error('Unstaking failed:', error);
      const errorMessage = error.message || 'Unstaking failed';
      
      setState(prev => ({ 
        ...prev, 
        isUnstaking: false, 
        result: { success: false, error: errorMessage }, 
        error: errorMessage 
      }));

      return { success: false, error: errorMessage };
    }
  }, [publicKey, connection, sendTransaction, tokenMint, stakingPoolPda, userStakePda, stakeVaultPda, rewardVaultPda, fetchPoolState]);

  /**
   * Claim rewards without unstaking
   */
  const claimRewards = useCallback(async (): Promise<ClaimResult> => {
    if (!publicKey || !userStakePda) {
      return { success: false, error: 'Wallet not connected' };
    }

    setState(prev => ({ ...prev, isClaiming: true, result: null, error: null }));

    try {
      const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, publicKey);

      // Discriminator for "claim_rewards"
      const claimDiscriminator = Buffer.from([4, 144, 132, 71, 116, 23, 151, 80]);

      const claimInstruction = {
        programId: STAKING_PROGRAM_ID,
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: stakingPoolPda, isSigner: false, isWritable: true },
          { pubkey: userStakePda, isSigner: false, isWritable: true },
          { pubkey: userTokenAccount, isSigner: false, isWritable: true },
          { pubkey: rewardVaultPda, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: claimDiscriminator,
      };

      const transaction = new Transaction().add(claimInstruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const result: ClaimResult = {
        success: true,
        signature,
        explorerUrl: getSolscanUrl(signature, 'tx'),
      };

      setState(prev => ({ 
        ...prev, 
        isClaiming: false, 
        result, 
        error: null 
      }));

      await fetchPoolState();
      await fetchUserStake();

      return result;
    } catch (error: any) {
      console.error('Claim failed:', error);
      const errorMessage = error.message || 'Claim failed';
      
      setState(prev => ({ 
        ...prev, 
        isClaiming: false, 
        result: { success: false, error: errorMessage }, 
        error: errorMessage 
      }));

      return { success: false, error: errorMessage };
    }
  }, [publicKey, connection, sendTransaction, tokenMint, stakingPoolPda, userStakePda, rewardVaultPda, fetchPoolState, fetchUserStake]);

  /**
   * Refresh all on-chain data
   */
  const refreshData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await fetchPoolState();
    await fetchUserStake();
    setState(prev => ({ ...prev, isLoading: false }));
  }, [fetchPoolState, fetchUserStake]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isStaking: false,
      isUnstaking: false,
      isClaiming: false,
      isLoading: false,
      result: null,
      error: null,
      poolState: null,
      userStake: null,
    });
  }, []);

  /**
   * Get time until unlock
   */
  const getTimeUntilUnlock = useCallback(() => {
    if (!state.userStake) return null;
    
    const now = new Date();
    const unlockDate = state.userStake.unlocksAt;
    const diff = unlockDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isUnlocked: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isUnlocked: false };
  }, [state.userStake]);

  return {
    // Actions
    stakeTokens,
    unstakeTokens,
    claimRewards,
    refreshData,
    reset,
    isProgramReady,
    fetchPoolState,
    fetchUserStake,
    
    // State
    isStaking: state.isStaking,
    isUnstaking: state.isUnstaking,
    isClaiming: state.isClaiming,
    isLoading: state.isLoading,
    result: state.result,
    error: state.error,
    poolState: state.poolState,
    userStake: state.userStake,
    
    // Helpers
    getTimeUntilUnlock,
    lockPeriods: LOCK_PERIODS,
    
    // PDAs (for debugging/display)
    programId: STAKING_PROGRAM_ID,
    stakingPoolPda,
    userStakePda,
  };
}

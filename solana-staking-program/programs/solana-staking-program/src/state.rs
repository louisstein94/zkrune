use anchor_lang::prelude::*;

/// Lock period configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default)]
pub struct LockPeriod {
    /// Duration in seconds
    pub duration_seconds: i64,
    /// Multiplier in basis points (10000 = 1.0x, 15000 = 1.5x)
    pub multiplier_bps: u16,
}

impl LockPeriod {
    pub const SIZE: usize = 8 + 2; // i64 + u16
}

/// Global staking pool state
#[account]
pub struct StakingPool {
    /// Admin authority who can update config
    pub authority: Pubkey,
    /// Token mint (zkRUNE)
    pub token_mint: Pubkey,
    /// Vault holding staked tokens
    pub stake_vault: Pubkey,
    /// Vault holding reward tokens
    pub reward_vault: Pubkey,
    /// Total amount currently staked
    pub total_staked: u64,
    /// Number of active stakers
    pub total_stakers: u32,
    /// Total rewards distributed all-time
    pub total_rewards_distributed: u64,
    /// Total rewards available in pool
    pub reward_pool_balance: u64,
    /// Lock period configurations (4 periods: 30, 90, 180, 365 days)
    pub lock_periods: [LockPeriod; 4],
    /// Minimum stake amount (in raw tokens)
    pub min_stake_amount: u64,
    /// Base APY in basis points (1200 = 12%)
    pub base_apy_bps: u16,
    /// Early withdrawal penalty in basis points (5000 = 50%)
    pub early_withdrawal_penalty_bps: u16,
    /// PDA bump
    pub bump: u8,
}

impl StakingPool {
    pub const SIZE: usize = 8 + // discriminator
        32 + // authority
        32 + // token_mint
        32 + // stake_vault
        32 + // reward_vault
        8 + // total_staked
        4 + // total_stakers
        8 + // total_rewards_distributed
        8 + // reward_pool_balance
        (LockPeriod::SIZE * 4) + // lock_periods
        8 + // min_stake_amount
        2 + // base_apy_bps
        2 + // early_withdrawal_penalty_bps
        1; // bump
    
    pub const SEED: &'static [u8] = b"staking_pool";
    
    /// Get multiplier for a lock period index
    pub fn get_multiplier(&self, index: u8) -> Option<u16> {
        self.lock_periods.get(index as usize).map(|p| p.multiplier_bps)
    }
    
    /// Get lock duration for a lock period index
    pub fn get_lock_duration(&self, index: u8) -> Option<i64> {
        self.lock_periods.get(index as usize).map(|p| p.duration_seconds)
    }
}

/// User's staking position
#[account]
pub struct UserStake {
    /// Owner of this stake position
    pub owner: Pubkey,
    /// Pool this stake belongs to
    pub pool: Pubkey,
    /// Amount staked (raw tokens)
    pub amount: u64,
    /// Lock period index (0-3)
    pub lock_period_index: u8,
    /// Unix timestamp when staked
    pub staked_at: i64,
    /// Unix timestamp when unlocks
    pub unlock_at: i64,
    /// Last time rewards were claimed
    pub last_claim_at: i64,
    /// Total rewards claimed from this position
    pub total_claimed: u64,
    /// Whether this stake is active
    pub is_active: bool,
    /// PDA bump
    pub bump: u8,
}

impl UserStake {
    pub const SIZE: usize = 8 + // discriminator
        32 + // owner
        32 + // pool
        8 + // amount
        1 + // lock_period_index
        8 + // staked_at
        8 + // unlock_at
        8 + // last_claim_at
        8 + // total_claimed
        1 + // is_active
        1; // bump
    
    pub const SEED: &'static [u8] = b"user_stake";
    
    /// Check if stake is currently locked
    pub fn is_locked(&self, current_time: i64) -> bool {
        current_time < self.unlock_at
    }
    
    /// Calculate pending rewards based on time and APY
    /// Returns amount in raw tokens
    pub fn calculate_pending_rewards(
        &self,
        current_time: i64,
        base_apy_bps: u16,
        multiplier_bps: u16,
    ) -> Result<u64> {
        if !self.is_active {
            return Ok(0);
        }
        
        let seconds_since_claim = current_time
            .checked_sub(self.last_claim_at)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        if seconds_since_claim <= 0 {
            return Ok(0);
        }
        
        // Calculate effective APY: base_apy * multiplier / 10000
        let effective_apy_bps = (base_apy_bps as u64)
            .checked_mul(multiplier_bps as u64)
            .ok_or(ProgramError::ArithmeticOverflow)?
            / 10000;
        
        // Daily rate = APY / 365 / 100 (converted to per-second)
        // rewards = amount * (apy_bps / 10000) * (seconds / 31536000)
        // To avoid precision loss: rewards = amount * apy_bps * seconds / (10000 * 31536000)
        let numerator = (self.amount as u128)
            .checked_mul(effective_apy_bps as u128)
            .ok_or(ProgramError::ArithmeticOverflow)?
            .checked_mul(seconds_since_claim as u128)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        // 10000 * 31536000 (seconds in a year) = 315,360,000,000
        let denominator: u128 = 315_360_000_000;
        
        let rewards = numerator / denominator;
        
        Ok(rewards as u64)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_reward_calculation() {
        let stake = UserStake {
            owner: Pubkey::default(),
            pool: Pubkey::default(),
            amount: 1_000_000_000, // 1000 tokens with 6 decimals
            lock_period_index: 0,
            staked_at: 0,
            unlock_at: 2592000, // 30 days
            last_claim_at: 0,
            total_claimed: 0,
            is_active: true,
            bump: 0,
        };
        
        // After 1 year with 12% APY and 1.0x multiplier
        let rewards = stake.calculate_pending_rewards(
            31536000, // 1 year in seconds
            1200,     // 12% base APY
            10000,    // 1.0x multiplier
        ).unwrap();
        
        // Expected: 1000 * 0.12 = 120 tokens = 120_000_000 raw
        assert!(rewards > 119_000_000 && rewards < 121_000_000);
    }
}

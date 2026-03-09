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
    /// Yearly token emission for rewards (raw tokens)
    pub yearly_emission: u64,
    /// Maximum APY in basis points (3600 = 36%)
    pub max_apy_bps: u16,
    /// Minimum APY in basis points (500 = 5%)
    pub min_apy_bps: u16,
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
        8 + // yearly_emission
        2 + // max_apy_bps
        2 + // min_apy_bps
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
    
    /// Calculate dynamic APY based on current TVL and yearly emission
    /// Returns APY in basis points, clamped between min and max
    pub fn calculate_dynamic_apy(&self) -> u16 {
        if self.total_staked == 0 {
            return self.max_apy_bps;
        }
        
        // raw_apy_bps = (yearly_emission / total_staked) * 10000
        let raw_apy_bps = (self.yearly_emission as u128)
            .checked_mul(10000)
            .unwrap_or(u128::MAX)
            / (self.total_staked as u128);
        
        // Clamp between min and max
        let clamped = if raw_apy_bps > self.max_apy_bps as u128 {
            self.max_apy_bps
        } else if raw_apy_bps < self.min_apy_bps as u128 {
            self.min_apy_bps
        } else {
            raw_apy_bps as u16
        };
        
        clamped
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
    /// APY locked at stake time (basis points, includes multiplier)
    pub locked_apy_bps: u16,
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
        2 + // locked_apy_bps
        1; // bump
    
    pub const SEED: &'static [u8] = b"user_stake";
    
    /// Check if stake is currently locked
    pub fn is_locked(&self, current_time: i64) -> bool {
        current_time < self.unlock_at
    }
    
    /// Calculate pending rewards using the locked APY from stake time
    /// Returns amount in raw tokens
    pub fn calculate_pending_rewards(
        &self,
        current_time: i64,
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
        
        // Use locked_apy_bps which already includes the multiplier
        let numerator = (self.amount as u128)
            .checked_mul(self.locked_apy_bps as u128)
            .ok_or(ProgramError::ArithmeticOverflow)?
            .checked_mul(seconds_since_claim as u128)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        
        // 10000 (bps) * 31536000 (seconds/year) = 315,360,000,000
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
            locked_apy_bps: 1200, // 12% APY locked at stake time
            bump: 0,
        };
        
        // After 1 year with 12% locked APY
        let rewards = stake.calculate_pending_rewards(
            31536000, // 1 year in seconds
        ).unwrap();
        
        // Expected: 1000 * 0.12 = 120 tokens = 120_000_000 raw
        assert!(rewards > 119_000_000 && rewards < 121_000_000);
    }
    
    #[test]
    fn test_dynamic_apy_calculation() {
        let pool = StakingPool {
            authority: Pubkey::default(),
            token_mint: Pubkey::default(),
            stake_vault: Pubkey::default(),
            reward_vault: Pubkey::default(),
            total_staked: 10_000_000_000_000, // 10M tokens
            total_stakers: 100,
            total_rewards_distributed: 0,
            reward_pool_balance: 1_000_000_000_000,
            lock_periods: [LockPeriod::default(); 4],
            min_stake_amount: 100_000_000,
            base_apy_bps: 1200,
            early_withdrawal_penalty_bps: 5000,
            yearly_emission: 1_000_000_000_000, // 1M tokens/year
            max_apy_bps: 3600, // 36%
            min_apy_bps: 500,  // 5%
            bump: 0,
        };
        
        // With 10M staked and 1M emission: APY = 1M/10M * 100 = 10%
        let apy = pool.calculate_dynamic_apy();
        assert_eq!(apy, 1000); // 10% = 1000 bps
    }
    
    #[test]
    fn test_dynamic_apy_capped_at_max() {
        let pool = StakingPool {
            authority: Pubkey::default(),
            token_mint: Pubkey::default(),
            stake_vault: Pubkey::default(),
            reward_vault: Pubkey::default(),
            total_staked: 100_000_000_000, // 100K tokens (low TVL)
            total_stakers: 10,
            total_rewards_distributed: 0,
            reward_pool_balance: 1_000_000_000_000,
            lock_periods: [LockPeriod::default(); 4],
            min_stake_amount: 100_000_000,
            base_apy_bps: 1200,
            early_withdrawal_penalty_bps: 5000,
            yearly_emission: 1_000_000_000_000, // 1M tokens/year
            max_apy_bps: 3600, // 36%
            min_apy_bps: 500,  // 5%
            bump: 0,
        };
        
        // With 100K staked and 1M emission: raw APY = 1000%, but capped at 36%
        let apy = pool.calculate_dynamic_apy();
        assert_eq!(apy, 3600); // Capped at 36%
    }
}

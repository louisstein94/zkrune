use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("44ToPJzWsnqJRhvFS5wXLsgWGWpbe3YwhU9t8LkQBRiX");

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum StakingError {
    #[msg("Amount is below minimum stake requirement")]
    BelowMinimumStake,
    #[msg("Invalid lock period index")]
    InvalidLockPeriod,
    #[msg("Stake position is not active")]
    StakeNotActive,
    #[msg("No rewards available to claim")]
    NoRewardsToClaim,
    #[msg("Insufficient rewards in pool")]
    InsufficientRewards,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Arithmetic underflow")]
    Underflow,
    #[msg("Unauthorized access")]
    Unauthorized,
}

// ============================================================================
// STATE
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default)]
pub struct LockPeriod {
    pub duration_seconds: i64,
    pub multiplier_bps: u16,
}

impl LockPeriod {
    pub const SIZE: usize = 8 + 2;
}

#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub stake_vault: Pubkey,
    pub reward_vault: Pubkey,
    pub total_staked: u64,
    pub total_stakers: u32,
    pub total_rewards_distributed: u64,
    pub reward_pool_balance: u64,
    pub lock_periods: [LockPeriod; 4],
    pub min_stake_amount: u64,
    pub base_apy_bps: u16,
    pub early_withdrawal_penalty_bps: u16,
    /// Yearly token emission for rewards (raw tokens)
    pub yearly_emission: u64,
    /// Maximum APY in basis points (3600 = 36%)
    pub max_apy_bps: u16,
    /// Minimum APY in basis points (500 = 5%)
    pub min_apy_bps: u16,
    pub bump: u8,
}

impl StakingPool {
    pub const SIZE: usize = 8 + 32 + 32 + 32 + 32 + 8 + 4 + 8 + 8 + (LockPeriod::SIZE * 4) + 8 + 2 + 2 + 8 + 2 + 2 + 1;
    pub const SEED: &'static [u8] = b"staking_pool";

    pub fn get_multiplier(&self, index: u8) -> Option<u16> {
        self.lock_periods.get(index as usize).map(|p| p.multiplier_bps)
    }

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

#[account]
pub struct UserStake {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub lock_period_index: u8,
    pub staked_at: i64,
    pub unlock_at: i64,
    pub last_claim_at: i64,
    pub total_claimed: u64,
    pub is_active: bool,
    /// APY locked at stake time (basis points, includes multiplier)
    pub locked_apy_bps: u16,
    pub bump: u8,
}

impl UserStake {
    pub const SIZE: usize = 8 + 32 + 32 + 8 + 1 + 8 + 8 + 8 + 8 + 1 + 2 + 1;
    pub const SEED: &'static [u8] = b"user_stake";

    pub fn is_locked(&self, current_time: i64) -> bool {
        current_time < self.unlock_at
    }

    /// Calculate pending rewards using the locked APY from stake time
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

// ============================================================================
// CONSTANTS
// ============================================================================

pub const STAKE_VAULT_SEED: &[u8] = b"stake_vault";
pub const REWARD_VAULT_SEED: &[u8] = b"reward_vault";

// ============================================================================
// INSTRUCTION PARAMS
// ============================================================================

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeParams {
    pub min_stake_amount: u64,
    pub base_apy_bps: u16,
    pub early_withdrawal_penalty_bps: u16,
    /// Yearly emission for rewards (raw tokens with decimals)
    pub yearly_emission: u64,
    /// Maximum APY in basis points (3600 = 36%)
    pub max_apy_bps: u16,
    /// Minimum APY in basis points (500 = 5%)
    pub min_apy_bps: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakeParams {
    pub amount: u64,
    pub lock_period_index: u8,
}

// ============================================================================
// ACCOUNTS
// ============================================================================

#[derive(Accounts)]
pub struct CreateStakeVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [StakingPool::SEED, token_mint.key().as_ref()],
        bump = staking_pool.bump
    )]
    pub staking_pool: Box<Account<'info, StakingPool>>,

    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = staking_pool,
        seeds = [STAKE_VAULT_SEED, staking_pool.key().as_ref()],
        bump
    )]
    pub stake_vault: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateRewardVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [StakingPool::SEED, token_mint.key().as_ref()],
        bump = staking_pool.bump
    )]
    pub staking_pool: Box<Account<'info, StakingPool>>,

    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = staking_pool,
        seeds = [REWARD_VAULT_SEED, staking_pool.key().as_ref()],
        bump
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = authority,
        space = StakingPool::SIZE,
        seeds = [StakingPool::SEED, token_mint.key().as_ref()],
        bump
    )]
    pub staking_pool: Box<Account<'info, StakingPool>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [StakingPool::SEED, staking_pool.token_mint.as_ref()],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        init,
        payer = user,
        space = UserStake::SIZE,
        seeds = [UserStake::SEED, staking_pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.token_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = stake_vault.key() == staking_pool.stake_vault
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [StakingPool::SEED, staking_pool.token_mint.as_ref()],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        seeds = [UserStake::SEED, staking_pool.key().as_ref(), user.key().as_ref()],
        bump = user_stake.bump,
        constraint = user_stake.owner == user.key() @ StakingError::Unauthorized,
        constraint = user_stake.is_active @ StakingError::StakeNotActive
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.token_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = stake_vault.key() == staking_pool.stake_vault
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = reward_vault.key() == staking_pool.reward_vault
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [StakingPool::SEED, staking_pool.token_mint.as_ref()],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        seeds = [UserStake::SEED, staking_pool.key().as_ref(), user.key().as_ref()],
        bump = user_stake.bump,
        constraint = user_stake.owner == user.key() @ StakingError::Unauthorized,
        constraint = user_stake.is_active @ StakingError::StakeNotActive
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.token_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = reward_vault.key() == staking_pool.reward_vault
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DepositRewards<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        mut,
        seeds = [StakingPool::SEED, staking_pool.token_mint.as_ref()],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        constraint = depositor_token_account.mint == staking_pool.token_mint,
        constraint = depositor_token_account.owner == depositor.key()
    )]
    pub depositor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = reward_vault.key() == staking_pool.reward_vault
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ============================================================================
// PROGRAM
// ============================================================================

#[program]
pub mod zkrune_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;

        pool.authority = ctx.accounts.authority.key();
        pool.token_mint = ctx.accounts.token_mint.key();
        pool.stake_vault = Pubkey::default(); // Set in create_stake_vault
        pool.reward_vault = Pubkey::default(); // Set in create_reward_vault

        pool.total_staked = 0;
        pool.total_stakers = 0;
        pool.total_rewards_distributed = 0;
        pool.reward_pool_balance = 0;

        // TEST MODE: Short lock periods (30s, 60s, 90s, 120s)
        // PRODUCTION: Replace with (30*24*60*60, 90*24*60*60, 180*24*60*60, 365*24*60*60)
        pool.lock_periods = [
            LockPeriod { duration_seconds: 30, multiplier_bps: 10000 },   // 30 seconds (test) / 30 days (prod)
            LockPeriod { duration_seconds: 60, multiplier_bps: 15000 },   // 60 seconds (test) / 90 days (prod)
            LockPeriod { duration_seconds: 90, multiplier_bps: 20000 },   // 90 seconds (test) / 180 days (prod)
            LockPeriod { duration_seconds: 120, multiplier_bps: 30000 },  // 120 seconds (test) / 365 days (prod)
        ];

        pool.min_stake_amount = params.min_stake_amount;
        pool.base_apy_bps = params.base_apy_bps;
        pool.early_withdrawal_penalty_bps = params.early_withdrawal_penalty_bps;
        
        // Dynamic APY parameters
        pool.yearly_emission = params.yearly_emission;
        pool.max_apy_bps = params.max_apy_bps;
        pool.min_apy_bps = params.min_apy_bps;
        
        pool.bump = ctx.bumps.staking_pool;

        msg!("Staking pool initialized with dynamic APY");
        msg!("Yearly emission: {} tokens", params.yearly_emission);
        msg!("APY range: {}% - {}%", params.min_apy_bps / 100, params.max_apy_bps / 100);
        Ok(())
    }

    pub fn create_stake_vault(ctx: Context<CreateStakeVault>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        pool.stake_vault = ctx.accounts.stake_vault.key();
        msg!("Stake vault created");
        Ok(())
    }

    pub fn create_reward_vault(ctx: Context<CreateRewardVault>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        pool.reward_vault = ctx.accounts.reward_vault.key();
        msg!("Reward vault created");
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, params: StakeParams) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let clock = Clock::get()?;

        require!(params.amount >= pool.min_stake_amount, StakingError::BelowMinimumStake);
        require!(params.lock_period_index < 4, StakingError::InvalidLockPeriod);

        let lock_duration = pool.get_lock_duration(params.lock_period_index)
            .ok_or(StakingError::InvalidLockPeriod)?;
        
        let multiplier_bps = pool.get_multiplier(params.lock_period_index)
            .ok_or(StakingError::InvalidLockPeriod)?;

        // Calculate dynamic APY based on current TVL
        let base_dynamic_apy = pool.calculate_dynamic_apy();
        
        // Apply lock period multiplier: effective_apy = base_dynamic_apy * multiplier / 10000
        // Then cap at max_apy_bps
        let effective_apy_bps = ((base_dynamic_apy as u32) * (multiplier_bps as u32) / 10000) as u16;
        let locked_apy = if effective_apy_bps > pool.max_apy_bps {
            pool.max_apy_bps
        } else {
            effective_apy_bps
        };

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.stake_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, params.amount)?;

        user_stake.owner = ctx.accounts.user.key();
        user_stake.pool = pool.key();
        user_stake.amount = params.amount;
        user_stake.lock_period_index = params.lock_period_index;
        user_stake.staked_at = clock.unix_timestamp;
        user_stake.unlock_at = clock.unix_timestamp.checked_add(lock_duration).ok_or(StakingError::Overflow)?;
        user_stake.last_claim_at = clock.unix_timestamp;
        user_stake.total_claimed = 0;
        user_stake.is_active = true;
        user_stake.locked_apy_bps = locked_apy;
        user_stake.bump = ctx.bumps.user_stake;

        pool.total_staked = pool.total_staked.checked_add(params.amount).ok_or(StakingError::Overflow)?;
        pool.total_stakers = pool.total_stakers.checked_add(1).ok_or(StakingError::Overflow)?;

        msg!("Staked {} tokens with {}% APY locked", params.amount, locked_apy as f64 / 100.0);
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        let clock = Clock::get()?;
        
        let user_amount = ctx.accounts.user_stake.amount;
        let is_early_withdrawal = ctx.accounts.user_stake.is_locked(clock.unix_timestamp);
        let mint_key = ctx.accounts.staking_pool.token_mint;
        let pool_bump = ctx.accounts.staking_pool.bump;
        let early_penalty_bps = ctx.accounts.staking_pool.early_withdrawal_penalty_bps;
        let reward_balance = ctx.accounts.staking_pool.reward_pool_balance;

        let mut return_amount = user_amount;
        let mut final_rewards: u64;
        let mut penalty_amount: u64 = 0;

        if is_early_withdrawal {
            penalty_amount = user_amount
                .checked_mul(early_penalty_bps as u64).ok_or(StakingError::Overflow)?
                / 10000;
            return_amount = user_amount.checked_sub(penalty_amount).ok_or(StakingError::Underflow)?;
            final_rewards = 0;
        } else {
            // Use locked APY from stake time (no parameters needed)
            final_rewards = ctx.accounts.user_stake.calculate_pending_rewards(clock.unix_timestamp)?;
            if final_rewards > reward_balance {
                final_rewards = reward_balance;
            }
        }

        let pool_seeds = &[StakingPool::SEED, mint_key.as_ref(), &[pool_bump]];
        let signer_seeds = &[&pool_seeds[..]];

        let transfer_stake_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.stake_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.staking_pool.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_stake_ctx, return_amount)?;

        // Transfer penalty from stake vault to reward vault (recycle penalties into rewards)
        if penalty_amount > 0 {
            let transfer_penalty_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.stake_vault.to_account_info(),
                    to: ctx.accounts.reward_vault.to_account_info(),
                    authority: ctx.accounts.staking_pool.to_account_info(),
                },
                signer_seeds,
            );
            token::transfer(transfer_penalty_ctx, penalty_amount)?;
        }

        if final_rewards > 0 {
            let transfer_rewards_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.reward_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.staking_pool.to_account_info(),
                },
                signer_seeds,
            );
            token::transfer(transfer_rewards_ctx, final_rewards)?;
        }

        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;

        // Add penalty to reward pool balance
        if penalty_amount > 0 {
            pool.reward_pool_balance = pool.reward_pool_balance.checked_add(penalty_amount).ok_or(StakingError::Overflow)?;
            msg!("Penalty {} tokens added to reward pool", penalty_amount);
        }

        if final_rewards > 0 {
            pool.reward_pool_balance = pool.reward_pool_balance.checked_sub(final_rewards).ok_or(StakingError::Underflow)?;
            pool.total_rewards_distributed = pool.total_rewards_distributed.checked_add(final_rewards).ok_or(StakingError::Overflow)?;
        }

        pool.total_staked = pool.total_staked.checked_sub(user_amount).ok_or(StakingError::Underflow)?;
        pool.total_stakers = pool.total_stakers.checked_sub(1).ok_or(StakingError::Underflow)?;

        user_stake.is_active = false;
        user_stake.total_claimed = user_stake.total_claimed.checked_add(final_rewards).ok_or(StakingError::Overflow)?;

        msg!("Unstaked {} tokens", return_amount);
        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let clock = Clock::get()?;

        let reward_balance = ctx.accounts.staking_pool.reward_pool_balance;
        let mint_key = ctx.accounts.staking_pool.token_mint;
        let pool_bump = ctx.accounts.staking_pool.bump;

        // Use locked APY from stake time (no parameters needed)
        let pending_rewards = ctx.accounts.user_stake.calculate_pending_rewards(clock.unix_timestamp)?;

        require!(pending_rewards > 0, StakingError::NoRewardsToClaim);

        let rewards_to_claim = if pending_rewards > reward_balance {
            reward_balance
        } else {
            pending_rewards
        };

        require!(rewards_to_claim > 0, StakingError::InsufficientRewards);

        let pool_seeds = &[StakingPool::SEED, mint_key.as_ref(), &[pool_bump]];
        let signer_seeds = &[&pool_seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.reward_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.staking_pool.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_ctx, rewards_to_claim)?;

        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;

        user_stake.last_claim_at = clock.unix_timestamp;
        user_stake.total_claimed = user_stake.total_claimed.checked_add(rewards_to_claim).ok_or(StakingError::Overflow)?;

        pool.reward_pool_balance = pool.reward_pool_balance.checked_sub(rewards_to_claim).ok_or(StakingError::Underflow)?;
        pool.total_rewards_distributed = pool.total_rewards_distributed.checked_add(rewards_to_claim).ok_or(StakingError::Overflow)?;

        msg!("Claimed {} reward tokens", rewards_to_claim);
        Ok(())
    }

    pub fn deposit_rewards(ctx: Context<DepositRewards>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;

        require!(amount > 0, StakingError::BelowMinimumStake);

        let cpi_accounts = Transfer {
            from: ctx.accounts.depositor_token_account.to_account_info(),
            to: ctx.accounts.reward_vault.to_account_info(),
            authority: ctx.accounts.depositor.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        pool.reward_pool_balance = pool.reward_pool_balance.checked_add(amount).ok_or(StakingError::Overflow)?;

        msg!("Deposited {} tokens to reward pool", amount);
        Ok(())
    }
}

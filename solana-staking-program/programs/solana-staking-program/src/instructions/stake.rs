use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{StakingPool, UserStake};
use crate::errors::StakingError;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakeParams {
    /// Amount to stake (raw tokens)
    pub amount: u64,
    /// Lock period index (0-3)
    pub lock_period_index: u8,
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
    
    /// User's stake position PDA
    #[account(
        init,
        payer = user,
        space = UserStake::SIZE,
        seeds = [UserStake::SEED, staking_pool.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    /// User's token account
    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.token_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    /// Pool's stake vault
    #[account(
        mut,
        constraint = stake_vault.key() == staking_pool.stake_vault
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Stake>, params: StakeParams) -> Result<()> {
    let pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let clock = Clock::get()?;
    
    // Validate amount
    require!(
        params.amount >= pool.min_stake_amount,
        StakingError::BelowMinimumStake
    );
    
    // Validate lock period
    require!(
        params.lock_period_index < 4,
        StakingError::InvalidLockPeriod
    );
    
    let lock_duration = pool.get_lock_duration(params.lock_period_index)
        .ok_or(StakingError::InvalidLockPeriod)?;
    
    // Transfer tokens from user to stake vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.stake_vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, params.amount)?;
    
    // Initialize user stake
    user_stake.owner = ctx.accounts.user.key();
    user_stake.pool = pool.key();
    user_stake.amount = params.amount;
    user_stake.lock_period_index = params.lock_period_index;
    user_stake.staked_at = clock.unix_timestamp;
    user_stake.unlock_at = clock.unix_timestamp
        .checked_add(lock_duration)
        .ok_or(StakingError::Overflow)?;
    user_stake.last_claim_at = clock.unix_timestamp;
    user_stake.total_claimed = 0;
    user_stake.is_active = true;
    user_stake.bump = ctx.bumps.user_stake;
    
    // Update pool stats
    pool.total_staked = pool.total_staked
        .checked_add(params.amount)
        .ok_or(StakingError::Overflow)?;
    pool.total_stakers = pool.total_stakers
        .checked_add(1)
        .ok_or(StakingError::Overflow)?;
    
    msg!("Staked {} tokens", params.amount);
    msg!("Lock period: {} days", lock_duration / 86400);
    msg!("Unlocks at: {}", user_stake.unlock_at);
    
    Ok(())
}

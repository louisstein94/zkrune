use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::{StakingPool, LockPeriod};

pub const STAKE_VAULT_SEED: &[u8] = b"stake_vault";
pub const REWARD_VAULT_SEED: &[u8] = b"reward_vault";

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeParams {
    /// Minimum stake amount (raw tokens)
    pub min_stake_amount: u64,
    /// Base APY in basis points (1200 = 12%)
    pub base_apy_bps: u16,
    /// Early withdrawal penalty in basis points (5000 = 50%)
    pub early_withdrawal_penalty_bps: u16,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// Token mint (zkRUNE)
    pub token_mint: Account<'info, Mint>,
    
    /// Staking pool PDA
    #[account(
        init,
        payer = authority,
        space = StakingPool::SIZE,
        seeds = [StakingPool::SEED, token_mint.key().as_ref()],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    /// Vault for staked tokens (PDA token account)
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = staking_pool,
        seeds = [STAKE_VAULT_SEED, staking_pool.key().as_ref()],
        bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
    /// Vault for reward tokens (PDA token account)
    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = staking_pool,
        seeds = [REWARD_VAULT_SEED, staking_pool.key().as_ref()],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
    let pool = &mut ctx.accounts.staking_pool;
    
    // Set authority
    pool.authority = ctx.accounts.authority.key();
    pool.token_mint = ctx.accounts.token_mint.key();
    pool.stake_vault = ctx.accounts.stake_vault.key();
    pool.reward_vault = ctx.accounts.reward_vault.key();
    
    // Initialize counters
    pool.total_staked = 0;
    pool.total_stakers = 0;
    pool.total_rewards_distributed = 0;
    pool.reward_pool_balance = 0;
    
    // Set lock periods (matching frontend config)
    // 30 days, 90 days, 180 days, 365 days
    pool.lock_periods = [
        LockPeriod {
            duration_seconds: 30 * 24 * 60 * 60,  // 30 days
            multiplier_bps: 10000,                 // 1.0x
        },
        LockPeriod {
            duration_seconds: 90 * 24 * 60 * 60,  // 90 days
            multiplier_bps: 15000,                 // 1.5x
        },
        LockPeriod {
            duration_seconds: 180 * 24 * 60 * 60, // 180 days
            multiplier_bps: 20000,                 // 2.0x
        },
        LockPeriod {
            duration_seconds: 365 * 24 * 60 * 60, // 365 days
            multiplier_bps: 30000,                 // 3.0x
        },
    ];
    
    // Set configuration
    pool.min_stake_amount = params.min_stake_amount;
    pool.base_apy_bps = params.base_apy_bps;
    pool.early_withdrawal_penalty_bps = params.early_withdrawal_penalty_bps;
    pool.bump = ctx.bumps.staking_pool;
    
    msg!("Staking pool initialized");
    msg!("Authority: {}", pool.authority);
    msg!("Token mint: {}", pool.token_mint);
    msg!("Min stake: {}", pool.min_stake_amount);
    msg!("Base APY: {}%", pool.base_apy_bps as f64 / 100.0);
    
    Ok(())
}

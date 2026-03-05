use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::StakingPool;
use crate::errors::StakingError;

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
    
    /// Depositor's token account
    #[account(
        mut,
        constraint = depositor_token_account.mint == staking_pool.token_mint,
        constraint = depositor_token_account.owner == depositor.key()
    )]
    pub depositor_token_account: Account<'info, TokenAccount>,
    
    /// Pool's reward vault
    #[account(
        mut,
        constraint = reward_vault.key() == staking_pool.reward_vault
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<DepositRewards>, amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.staking_pool;
    
    require!(amount > 0, StakingError::BelowMinimumStake);
    
    // Transfer tokens from depositor to reward vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.depositor_token_account.to_account_info(),
        to: ctx.accounts.reward_vault.to_account_info(),
        authority: ctx.accounts.depositor.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;
    
    // Update reward pool balance
    pool.reward_pool_balance = pool.reward_pool_balance
        .checked_add(amount)
        .ok_or(StakingError::Overflow)?;
    
    msg!("Deposited {} tokens to reward pool", amount);
    msg!("New reward pool balance: {}", pool.reward_pool_balance);
    
    Ok(())
}

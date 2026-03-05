use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{StakingPool, UserStake};
use crate::errors::StakingError;

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
    
    /// User's stake position
    #[account(
        mut,
        seeds = [UserStake::SEED, staking_pool.key().as_ref(), user.key().as_ref()],
        bump = user_stake.bump,
        constraint = user_stake.owner == user.key() @ StakingError::Unauthorized,
        constraint = user_stake.is_active @ StakingError::StakeNotActive
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
    
    /// Pool's reward vault (for claiming remaining rewards)
    #[account(
        mut,
        constraint = reward_vault.key() == staking_pool.reward_vault
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Unstake>) -> Result<()> {
    let pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let clock = Clock::get()?;
    
    let is_early_withdrawal = user_stake.is_locked(clock.unix_timestamp);
    
    // Calculate return amount
    let mut return_amount = user_stake.amount;
    let mut penalty_amount: u64 = 0;
    let mut final_rewards: u64;
    
    if is_early_withdrawal {
        // Apply penalty for early withdrawal
        penalty_amount = user_stake.amount
            .checked_mul(pool.early_withdrawal_penalty_bps as u64)
            .ok_or(StakingError::Overflow)?
            / 10000;
        
        return_amount = user_stake.amount
            .checked_sub(penalty_amount)
            .ok_or(StakingError::Underflow)?;
        
        // No rewards for early withdrawal
        final_rewards = 0;
        
        msg!("Early withdrawal penalty: {} tokens", penalty_amount);
    } else {
        // Calculate and transfer pending rewards
        let multiplier = pool.get_multiplier(user_stake.lock_period_index)
            .ok_or(StakingError::InvalidLockPeriod)?;
        
        final_rewards = user_stake.calculate_pending_rewards(
            clock.unix_timestamp,
            pool.base_apy_bps,
            multiplier,
        )?;
        
        // Cap rewards to available pool balance
        if final_rewards > pool.reward_pool_balance {
            final_rewards = pool.reward_pool_balance;
        }
    }
    
    // Transfer staked tokens back to user (minus penalty)
    let mint_key = pool.token_mint;
    let pool_seeds = &[
        StakingPool::SEED,
        mint_key.as_ref(),
        &[pool.bump],
    ];
    let signer_seeds = &[&pool_seeds[..]];
    
    let transfer_stake_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.stake_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_stake_ctx, return_amount)?;
    
    // Transfer rewards if any
    if final_rewards > 0 {
        let transfer_rewards_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.reward_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: pool.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(transfer_rewards_ctx, final_rewards)?;
        
        // Update reward pool balance
        pool.reward_pool_balance = pool.reward_pool_balance
            .checked_sub(final_rewards)
            .ok_or(StakingError::Underflow)?;
        
        // Update total distributed
        pool.total_rewards_distributed = pool.total_rewards_distributed
            .checked_add(final_rewards)
            .ok_or(StakingError::Overflow)?;
    }
    
    // Update pool stats
    pool.total_staked = pool.total_staked
        .checked_sub(user_stake.amount)
        .ok_or(StakingError::Underflow)?;
    pool.total_stakers = pool.total_stakers
        .checked_sub(1)
        .ok_or(StakingError::Underflow)?;
    
    // Deactivate stake
    user_stake.is_active = false;
    user_stake.total_claimed = user_stake.total_claimed
        .checked_add(final_rewards)
        .ok_or(StakingError::Overflow)?;
    
    msg!("Unstaked {} tokens", return_amount);
    if final_rewards > 0 {
        msg!("Final rewards: {} tokens", final_rewards);
    }
    if penalty_amount > 0 {
        msg!("Penalty applied: {} tokens", penalty_amount);
    }
    
    Ok(())
}

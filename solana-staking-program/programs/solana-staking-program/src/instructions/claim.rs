use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::{StakingPool, UserStake};
use crate::errors::StakingError;

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
    
    /// Pool's reward vault
    #[account(
        mut,
        constraint = reward_vault.key() == staking_pool.reward_vault
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimRewards>) -> Result<()> {
    let pool = &mut ctx.accounts.staking_pool;
    let user_stake = &mut ctx.accounts.user_stake;
    let clock = Clock::get()?;
    
    // Get multiplier for this stake's lock period
    let multiplier = pool.get_multiplier(user_stake.lock_period_index)
        .ok_or(StakingError::InvalidLockPeriod)?;
    
    // Calculate pending rewards
    let pending_rewards = user_stake.calculate_pending_rewards(
        clock.unix_timestamp,
        pool.base_apy_bps,
        multiplier,
    )?;
    
    require!(pending_rewards > 0, StakingError::NoRewardsToClaim);
    
    // Cap rewards to available pool balance
    let rewards_to_claim = if pending_rewards > pool.reward_pool_balance {
        pool.reward_pool_balance
    } else {
        pending_rewards
    };
    
    require!(rewards_to_claim > 0, StakingError::InsufficientRewards);
    
    // Transfer rewards from reward vault to user
    let mint_key = pool.token_mint;
    let pool_seeds = &[
        StakingPool::SEED,
        mint_key.as_ref(),
        &[pool.bump],
    ];
    let signer_seeds = &[&pool_seeds[..]];
    
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, rewards_to_claim)?;
    
    // Update user stake
    user_stake.last_claim_at = clock.unix_timestamp;
    user_stake.total_claimed = user_stake.total_claimed
        .checked_add(rewards_to_claim)
        .ok_or(StakingError::Overflow)?;
    
    // Update pool stats
    pool.reward_pool_balance = pool.reward_pool_balance
        .checked_sub(rewards_to_claim)
        .ok_or(StakingError::Underflow)?;
    pool.total_rewards_distributed = pool.total_rewards_distributed
        .checked_add(rewards_to_claim)
        .ok_or(StakingError::Overflow)?;
    
    msg!("Claimed {} reward tokens", rewards_to_claim);
    msg!("Total claimed: {}", user_stake.total_claimed);
    msg!("Remaining in pool: {}", pool.reward_pool_balance);
    
    Ok(())
}

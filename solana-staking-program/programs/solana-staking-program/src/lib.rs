use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("8EzHiZqRJN3FYpUBqRRWgXpycT6uzLnNpgBHfqm3qLyu");

#[program]
pub mod zkrune_staking {
    use super::*;

    /// Initialize a new staking pool
    /// 
    /// # Arguments
    /// * `params` - Pool configuration parameters
    pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        initialize_handler(ctx, params)
    }

    /// Stake tokens into the pool
    /// 
    /// # Arguments
    /// * `params` - Stake parameters (amount and lock period)
    pub fn stake(ctx: Context<Stake>, params: StakeParams) -> Result<()> {
        stake_handler(ctx, params)
    }

    /// Unstake tokens from the pool
    /// Applies early withdrawal penalty if stake is still locked
    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        unstake_handler(ctx)
    }

    /// Claim accumulated rewards without unstaking
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        claim_handler(ctx)
    }

    /// Deposit tokens into the reward pool
    /// Anyone can deposit (for fee sharing from marketplace, etc.)
    /// 
    /// # Arguments
    /// * `amount` - Amount of tokens to deposit
    pub fn deposit_rewards(ctx: Context<DepositRewards>, amount: u64) -> Result<()> {
        deposit_handler(ctx, amount)
    }
}

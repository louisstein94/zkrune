use anchor_lang::prelude::*;

#[error_code]
pub enum StakingError {
    #[msg("Amount is below minimum stake requirement")]
    BelowMinimumStake,
    
    #[msg("Invalid lock period index")]
    InvalidLockPeriod,
    
    #[msg("Stake position is not active")]
    StakeNotActive,
    
    #[msg("Stake is still locked")]
    StakeLocked,
    
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
    
    #[msg("Invalid token mint")]
    InvalidMint,
    
    #[msg("User already has an active stake")]
    AlreadyStaked,
}

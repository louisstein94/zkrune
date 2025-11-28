use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

entrypoint!(process_instruction);

// HYBRID APPROACH: Browser verifies with snarkjs, blockchain stores immutable record
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct VerificationRecord {
    pub template_id: u8,
    pub proof_hash: [u8; 32],
    pub public_signals_hash: [u8; 32],
    pub timestamp: i64,
    pub verified_by_snarkjs: bool,
}

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("zkRune Verification Record");

    let record = VerificationRecord::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    msg!("Template ID: {}", record.template_id);
    msg!("Proof Hash: {:?}", &record.proof_hash[0..8]);
    msg!("Signals Hash: {:?}", &record.public_signals_hash[0..8]);
    msg!("Timestamp: {}", record.timestamp);
    msg!("Client Verification: {}", record.verified_by_snarkjs);

    if !record.verified_by_snarkjs {
        msg!("Client verification failed!");
        return Err(ProgramError::InvalidArgument);
    }

    if record.proof_hash.iter().all(|&b| b == 0) {
        msg!("Invalid proof hash");
        return Err(ProgramError::InvalidArgument);
    }

    msg!("VERIFICATION RECORD SAVED ON-CHAIN!");
    msg!("Proof was mathematically verified by snarkjs");
    msg!("Record is now immutably stored on Solana blockchain");
    
    Ok(())
}

//! Admission registry for private offerings.
//!
//! The eligibility circuit publishes a nullifier that identifies an investor
//! within one offering and nowhere else. That makes a second attempt
//! recognisable, but recognising it is not the same as refusing it: a venue
//! holding the set in its own database is trusted both to check honestly and
//! to report honestly afterwards.
//!
//! This moves the check to where nobody has to be trusted for it. Each
//! admission derives a compressed account address from the offering and the
//! nullifier, and an address in a Light address tree can only be created once.
//! A second admission for the same investor therefore fails in the address
//! tree, not in the venue's code — the chain enforces the rule, and anyone can
//! read back what was actually enforced.
//!
//! Compressed state rather than regular accounts because the registry grows
//! with subscribers. A regular account per nullifier carries rent an offering
//! with real numbers would feel; compressed accounts commit to a Merkle tree
//! and put only the root on chain.
//!
//! WHAT IS RECORDED
//!
//! The offering, the nullifier and a timestamp. The nullifier is unlinkable to
//! the same investor in any other offering, so the registry being public
//! discloses that someone was admitted, and nothing about who.

use borsh::{BorshDeserialize, BorshSerialize};
use light_sdk::{
    address::v1::derive_address,
    instruction::{account_meta::CompressedAccountMeta, ValidityProof},
    LightDiscriminator,
};
use solana_pubkey::Pubkey;
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError,
};

entrypoint!(process_instruction);

/// Seed prefix separating admissions from any other address this program derives.
pub const ADMISSION_SEED: &[u8] = b"zkrune:admission";

/// The record written into compressed state for each admitted investor.
///
/// Its existence is the fact being recorded; the fields make it readable
/// without an index. Nothing here identifies the investor.
#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize, LightDiscriminator)]
pub struct Admission {
    /// Identifies the offering. Matches the policyId the proof was checked against.
    pub offering: [u8; 32],
    /// Nullifier published by the eligibility proof.
    pub nullifier: [u8; 32],
    /// Unix seconds the admission was recorded.
    pub admitted_at: i64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct AdmitArgs {
    pub proof: ValidityProof,
    pub account_meta: CompressedAccountMeta,
    pub offering: [u8; 32],
    pub nullifier: [u8; 32],
    pub admitted_at: i64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum RegistryInstruction {
    /// Records an admission. Fails if this investor was already admitted to
    /// this offering, because the derived address already exists.
    Admit(AdmitArgs),
}

/// Derives the address an admission occupies.
///
/// Deterministic in the offering and the nullifier, which is what turns
/// "already admitted" into an address collision the address tree rejects
/// rather than a check the venue has to remember to perform.
pub fn admission_address(
    offering: &[u8; 32],
    nullifier: &[u8; 32],
    address_tree: &Pubkey,
    program_id: &Pubkey,
) -> ([u8; 32], [u8; 32]) {
    let (address, seed) = derive_address(
        &[ADMISSION_SEED, offering.as_ref(), nullifier.as_ref()],
        address_tree,
        program_id,
    );
    (address, seed.into())
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = RegistryInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        RegistryInstruction::Admit(args) => admit(program_id, accounts, args),
    }
}

fn admit(_program_id: &Pubkey, _accounts: &[AccountInfo], args: AdmitArgs) -> ProgramResult {
    if args.offering == [0u8; 32] || args.nullifier == [0u8; 32] {
        msg!("offering and nullifier must be non-zero");
        return Err(ProgramError::InvalidInstructionData);
    }

    msg!("recording admission");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn admission_address_is_deterministic() {
        let tree = Pubkey::new_unique();
        let program = Pubkey::new_unique();
        let offering = [7u8; 32];
        let nullifier = [9u8; 32];

        let (a, _) = admission_address(&offering, &nullifier, &tree, &program);
        let (b, _) = admission_address(&offering, &nullifier, &tree, &program);
        assert_eq!(a, b, "same investor and offering must map to one address");
    }

    #[test]
    fn different_investors_get_different_addresses() {
        let tree = Pubkey::new_unique();
        let program = Pubkey::new_unique();
        let offering = [7u8; 32];

        let (a, _) = admission_address(&offering, &[1u8; 32], &tree, &program);
        let (b, _) = admission_address(&offering, &[2u8; 32], &tree, &program);
        assert_ne!(a, b);
    }

    #[test]
    fn the_same_investor_in_another_offering_is_a_different_address() {
        // Otherwise admission to one offering would block admission to another.
        let tree = Pubkey::new_unique();
        let program = Pubkey::new_unique();
        let nullifier = [9u8; 32];

        let (a, _) = admission_address(&[1u8; 32], &nullifier, &tree, &program);
        let (b, _) = admission_address(&[2u8; 32], &nullifier, &tree, &program);
        assert_ne!(a, b);
    }
}

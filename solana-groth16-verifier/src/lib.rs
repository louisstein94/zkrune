use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use groth16_solana::groth16::Groth16Verifier;

#[cfg(not(feature = "no-entrypoint"))]
use solana_security_txt::security_txt;

mod generated_vk;
use generated_vk::get_vk_by_id;

entrypoint!(process_instruction);

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "zkRune Groth16 Verifier",
    project_url: "https://zkrune.com",
    contacts: "link:https://x.com/rune_zk,link:https://github.com/louisstein94/zkrune/issues",
    policy: "https://github.com/louisstein94/zkrune/security/policy",
    source_code: "https://github.com/louisstein94/zkrune/tree/main/solana-groth16-verifier",
    auditors: "N/A"
}

// Template names for logging
const TEMPLATE_NAMES: [&str; 13] = [
    "age-verification",
    "balance-proof", 
    "membership-proof",
    "credential-proof",
    "private-voting",
    "nft-ownership",
    "range-proof",
    "hash-preimage",
    "quadratic-voting",
    "anonymous-reputation",
    "token-swap",
    "patience-proof",
    "signature-verification",
];

/// Minimum instruction data size: 1 (template) + 64 (A) + 128 (B) + 64 (C) + 32 (>=1 input).
pub const MIN_INSTRUCTION_DATA_LEN: usize = 1 + 64 + 128 + 64 + 32;
/// Offset of public inputs section inside instruction data (after template_id + proof).
pub const PROOF_SECTION_END: usize = 1 + 64 + 128 + 64;

/// Validate instruction-data layout: length, alignment, and input count.
/// Returns the number of public inputs on success.
pub fn validate_instruction_layout(
    data_len: usize,
    expected_inputs: usize,
) -> Result<usize, ProgramError> {
    if data_len < MIN_INSTRUCTION_DATA_LEN {
        return Err(ProgramError::InvalidInstructionData);
    }
    let remaining = data_len - PROOF_SECTION_END;
    if remaining == 0 || remaining % 32 != 0 {
        return Err(ProgramError::InvalidInstructionData);
    }
    let input_count = remaining / 32;
    if input_count != expected_inputs {
        return Err(ProgramError::InvalidInstructionData);
    }
    Ok(input_count)
}

// Instruction format:
// [template_id: u8][proof_a: 64 bytes][proof_b: 128 bytes][proof_c: 64 bytes][public_inputs: n * 32 bytes]
pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("zkRune Groth16 Verifier");

    if instruction_data.len() < MIN_INSTRUCTION_DATA_LEN {
        msg!("Error: Data too short ({} bytes)", instruction_data.len());
        return Err(ProgramError::InvalidInstructionData);
    }
    
    let template_id = instruction_data[0];
    
    // Get VK for this template
    let vk = get_vk_by_id(template_id).ok_or_else(|| {
        msg!("Error: Unknown template ID {}", template_id);
        ProgramError::InvalidArgument
    })?;
    
    let template_name = TEMPLATE_NAMES.get(template_id as usize).unwrap_or(&"unknown");
    msg!("Template: {} (ID: {})", template_name, template_id);
    
    // Parse proof components
    let mut offset = 1;
    
    let proof_a: &[u8; 64] = instruction_data[offset..offset + 64]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    offset += 64;
    
    let proof_b: &[u8; 128] = instruction_data[offset..offset + 128]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    offset += 128;
    
    let proof_c: &[u8; 64] = instruction_data[offset..offset + 64]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    offset += 64;
    
    // Parse + validate public input section (length, alignment, count).
    validate_instruction_layout(instruction_data.len(), vk.nr_pubinputs).map_err(|e| {
        msg!(
            "Error: Invalid instruction layout (len={}, expected_inputs={})",
            instruction_data.len(),
            vk.nr_pubinputs
        );
        e
    })?;

    // Safely convert a 32-byte slice; returns InvalidInstructionData on failure
    let slice_32 = |start: usize| -> Result<[u8; 32], ProgramError> {
        instruction_data[start..start + 32]
            .try_into()
            .map_err(|_| ProgramError::InvalidInstructionData)
    };

    // Dynamically handle public inputs (up to 5 supported)
    match vk.nr_pubinputs {
        1 => {
            let inputs: [[u8; 32]; 1] = [slice_32(offset)?];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        2 => {
            let inputs: [[u8; 32]; 2] = [
                slice_32(offset)?,
                slice_32(offset + 32)?,
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        3 => {
            let inputs: [[u8; 32]; 3] = [
                slice_32(offset)?,
                slice_32(offset + 32)?,
                slice_32(offset + 64)?,
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        4 => {
            let inputs: [[u8; 32]; 4] = [
                slice_32(offset)?,
                slice_32(offset + 32)?,
                slice_32(offset + 64)?,
                slice_32(offset + 96)?,
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        5 => {
            let inputs: [[u8; 32]; 5] = [
                slice_32(offset)?,
                slice_32(offset + 32)?,
                slice_32(offset + 64)?,
                slice_32(offset + 96)?,
                slice_32(offset + 128)?,
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        _ => {
            msg!("Error: Unsupported input count {}", vk.nr_pubinputs);
            return Err(ProgramError::InvalidArgument);
        }
    }
    
    msg!("Proof verified successfully!");
    Ok(())
}

fn verify_proof<const N: usize>(
    proof_a: &[u8; 64],
    proof_b: &[u8; 128],
    proof_c: &[u8; 64],
    public_inputs: &[[u8; 32]; N],
    vk: &groth16_solana::groth16::Groth16Verifyingkey<'static>,
) -> ProgramResult {
    let mut verifier = Groth16Verifier::new(
        proof_a,
        proof_b,
        proof_c,
        public_inputs,
        vk,
    ).map_err(|e| {
        msg!("Verifier error: {:?}", e);
        ProgramError::InvalidArgument
    })?;
    
    verifier.verify().map_err(|e| {
        msg!("Verification failed: {:?}", e);
        ProgramError::InvalidArgument
    })?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    // P2-04b: instruction layout validation
    #[test]
    fn layout_accepts_minimum_valid_size() {
        // 1 + 64 + 128 + 64 + 32 = 289 bytes with 1 public input
        let res = validate_instruction_layout(MIN_INSTRUCTION_DATA_LEN, 1);
        assert_eq!(res, Ok(1));
    }

    #[test]
    fn layout_rejects_too_short() {
        // 288 bytes < 289 minimum
        let res = validate_instruction_layout(MIN_INSTRUCTION_DATA_LEN - 1, 1);
        assert!(matches!(res, Err(ProgramError::InvalidInstructionData)));
    }

    #[test]
    fn layout_rejects_non_multiple_of_32() {
        // 289 + 16 = 305 bytes, remaining = 48, 48 % 32 = 16 != 0
        let res = validate_instruction_layout(MIN_INSTRUCTION_DATA_LEN + 16, 1);
        assert!(matches!(res, Err(ProgramError::InvalidInstructionData)));
    }

    #[test]
    fn layout_rejects_zero_remaining() {
        // Exactly 257 bytes (proof section only, no inputs).
        // Below MIN_INSTRUCTION_DATA_LEN (289), caught by length check.
        let res = validate_instruction_layout(PROOF_SECTION_END, 0);
        assert!(matches!(res, Err(ProgramError::InvalidInstructionData)));
    }

    #[test]
    fn layout_rejects_wrong_input_count() {
        // 289 bytes = 1 input provided, but VK expects 3
        let res = validate_instruction_layout(MIN_INSTRUCTION_DATA_LEN, 3);
        assert!(matches!(res, Err(ProgramError::InvalidInstructionData)));
    }

    #[test]
    fn layout_accepts_multiple_inputs() {
        // 1 + 64 + 128 + 64 + (32 * 5) = 417 bytes with 5 inputs
        let size = PROOF_SECTION_END + 32 * 5;
        let res = validate_instruction_layout(size, 5);
        assert_eq!(res, Ok(5));
    }

    // P2-04b: VK integrity — every template ID 0..13 must resolve to a valid VK
    #[test]
    fn all_template_ids_have_vk() {
        for template_id in 0..13u8 {
            let vk = get_vk_by_id(template_id);
            assert!(vk.is_some(), "Template ID {} has no VK", template_id);
            let vk = vk.unwrap();
            // Sanity: nr_pubinputs must be between 1 and 5 (our match arms support only 1..=5)
            assert!(
                vk.nr_pubinputs >= 1 && vk.nr_pubinputs <= 5,
                "Template {} has unsupported nr_pubinputs={}",
                template_id,
                vk.nr_pubinputs
            );
        }
    }

    #[test]
    fn unknown_template_id_returns_none() {
        assert!(get_vk_by_id(99).is_none());
        assert!(get_vk_by_id(255).is_none());
    }

    #[test]
    fn template_names_match_vk_count() {
        // We have VKs for template_ids 0..13 (see all_template_ids_have_vk).
        // TEMPLATE_NAMES must cover the same range to avoid "unknown" logs.
        assert_eq!(TEMPLATE_NAMES.len(), 13);
    }
}

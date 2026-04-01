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

// Instruction format:
// [template_id: u8][proof_a: 64 bytes][proof_b: 128 bytes][proof_c: 64 bytes][public_inputs: n * 32 bytes]
pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("zkRune Groth16 Verifier");
    
    // Minimum size: 1 (template) + 64 (A) + 128 (B) + 64 (C) + 32 (min 1 input) = 289 bytes
    if instruction_data.len() < 289 {
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
    
    // Parse public inputs based on VK's expected count
    let remaining = instruction_data.len() - offset;
    let input_count = remaining / 32;
    
    if input_count != vk.nr_pubinputs {
        msg!("Error: Expected {} inputs, got {}", vk.nr_pubinputs, input_count);
        return Err(ProgramError::InvalidInstructionData);
    }
    
    // Dynamically handle public inputs (up to 10 supported)
    match vk.nr_pubinputs {
        1 => {
            let inputs: [[u8; 32]; 1] = [
                instruction_data[offset..offset + 32].try_into().unwrap(),
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        2 => {
            let inputs: [[u8; 32]; 2] = [
                instruction_data[offset..offset + 32].try_into().unwrap(),
                instruction_data[offset + 32..offset + 64].try_into().unwrap(),
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        3 => {
            let inputs: [[u8; 32]; 3] = [
                instruction_data[offset..offset + 32].try_into().unwrap(),
                instruction_data[offset + 32..offset + 64].try_into().unwrap(),
                instruction_data[offset + 64..offset + 96].try_into().unwrap(),
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        4 => {
            let inputs: [[u8; 32]; 4] = [
                instruction_data[offset..offset + 32].try_into().unwrap(),
                instruction_data[offset + 32..offset + 64].try_into().unwrap(),
                instruction_data[offset + 64..offset + 96].try_into().unwrap(),
                instruction_data[offset + 96..offset + 128].try_into().unwrap(),
            ];
            verify_proof(proof_a, proof_b, proof_c, &inputs, vk)?;
        }
        5 => {
            let inputs: [[u8; 32]; 5] = [
                instruction_data[offset..offset + 32].try_into().unwrap(),
                instruction_data[offset + 32..offset + 64].try_into().unwrap(),
                instruction_data[offset + 64..offset + 96].try_into().unwrap(),
                instruction_data[offset + 96..offset + 128].try_into().unwrap(),
                instruction_data[offset + 128..offset + 160].try_into().unwrap(),
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

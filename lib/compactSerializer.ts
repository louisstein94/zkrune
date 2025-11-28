// Compact serialization - WITHOUT VK (VK will be hardcoded in Rust program)
const serializeGroth16ProofDataCompact = (
    proof_a: Uint8Array,  // 64 bytes
    proof_b: Uint8Array,  // 128 bytes
    proof_c: Uint8Array,  // 64 bytes
    public_inputs: Uint8Array[],
    template_id: number  // 1 byte enum to identify which VK to use
): Buffer => {
    const totalSize = 
        1 +   // template_id (u8)
        64 +  // proof_a
        128 + // proof_b
        64 +  // proof_c
        4 + (public_inputs.length * 32); // public_inputs
    
    const buffer = Buffer.allocUnsafe(totalSize);
    let offset = 0;
    
    // Template ID (tells Rust which hardcoded VK to use)
    buffer.writeUInt8(template_id, offset); offset += 1;
    
    // Proof data
    proof_a.copy(buffer, offset); offset += 64;
    proof_b.copy(buffer, offset); offset += 128;
    proof_c.copy(buffer, offset); offset += 64;
    
    // Public inputs
    buffer.writeUInt32LE(public_inputs.length, offset); offset += 4;
    for (const input of public_inputs) {
        input.copy(buffer, offset); offset += 32;
    }
    
    return buffer;
};

// Template ID mapping
const TEMPLATE_IDS = {
    'age-verification': 0,
    'balance-proof': 1,
    'hash-preimage': 2,
    'anonymous-reputation': 3,
    'credential-proof': 4,
    'membership-proof': 5,
    'nft-ownership': 6,
    'patience-proof': 7,
    'quadratic-voting': 8,
    'range-proof': 9,
    'signature-verification': 10,
    'token-swap': 11,
};

export { serializeGroth16ProofDataCompact, TEMPLATE_IDS };


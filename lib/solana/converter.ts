/**
 * zkRune - snarkjs to Solana Format Converter
 * 
 * Matches groth16-solana proof_parser::convert_proof behavior:
 * - proof_a: NEGATE + LE serialize + convert_endianness::<32, 64>
 * - proof_b: LE serialize + convert_endianness::<64, 128>
 * - proof_c: LE serialize + convert_endianness::<32, 64>
 */

// BN254 curve prime field modulus
const BN254_PRIME = BigInt('21888242871839275222246405745257275088696311157297823662689037894645226208583');

/**
 * Convert decimal string to 32-byte LITTLE-ENDIAN bytes
 */
function fieldToLE(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = Number(n & BigInt(0xFF));
    n >>= BigInt(8);
  }
  return bytes;
}

/**
 * Convert decimal string to 32-byte BIG-ENDIAN bytes
 */
export function fieldToBytes(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xFF));
    n >>= BigInt(8);
  }
  return bytes;
}

/**
 * Simulate convert_endianness::<CHUNK_SIZE, TOTAL_SIZE>
 * Reverses each chunk of CHUNK_SIZE bytes
 */
function convertEndianness(input: Uint8Array, chunkSize: number): Uint8Array {
  const output = new Uint8Array(input.length);
  const numChunks = input.length / chunkSize;
  
  for (let i = 0; i < numChunks; i++) {
    for (let j = 0; j < chunkSize; j++) {
      output[i * chunkSize + j] = input[i * chunkSize + chunkSize - 1 - j];
    }
  }
  return output;
}

/**
 * Negate G1 point: (x, y) → (x, p - y)
 */
export function negateG1(point: string[]): string[] {
  if (point.length < 2) {
    throw new Error(`Invalid G1 point for negation`);
  }
  
  const y = BigInt(point[1]);
  const negY = y === BigInt(0) ? BigInt(0) : BN254_PRIME - (y % BN254_PRIME);
  
  return [point[0], negY.toString()];
}

/**
 * Convert G1 point to 64 bytes
 * variant 0: LE serialize → convert_endianness::<32, 64> (arkworks style)
 * variant 1: Direct BE (x BE, y BE)
 */
export function g1ToBytes(point: string[], variant: number = 0): Uint8Array {
  if (point.length < 2) {
    throw new Error(`Invalid G1 point`);
  }
  
  if (variant === 0) {
    // LE serialize x and y, then reverse each 32-byte chunk
    const leBytes = new Uint8Array(64);
    leBytes.set(fieldToLE(point[0]), 0);
    leBytes.set(fieldToLE(point[1]), 32);
    return convertEndianness(leBytes, 32);
  } else {
    // Direct BE
    const result = new Uint8Array(64);
    result.set(fieldToBytes(point[0]), 0);
    result.set(fieldToBytes(point[1]), 32);
    return result;
  }
}

/**
 * Convert G2 point to 128 bytes
 * Try different orderings to find the correct one
 */
export function g2ToBytes(point: string[][], variant: number = 0): Uint8Array {
  if (point.length < 2 || point[0].length < 2 || point[1].length < 2) {
    throw new Error(`Invalid G2 point structure`);
  }
  
  // snarkjs: point[0] = [x.c1, x.c0], point[1] = [y.c1, y.c0]
  const x_c0 = point[0][1];
  const x_c1 = point[0][0];
  const y_c0 = point[1][1];
  const y_c1 = point[1][0];
  
  const result = new Uint8Array(128);
  
  switch (variant) {
    case 0:
      // Original: arkworks LE + convert_endianness::<64, 128>
      // Result: [x.c1 BE, x.c0 BE, y.c1 BE, y.c0 BE]
      const leBytes = new Uint8Array(128);
      leBytes.set(fieldToLE(x_c0), 0);
      leBytes.set(fieldToLE(x_c1), 32);
      leBytes.set(fieldToLE(y_c0), 64);
      leBytes.set(fieldToLE(y_c1), 96);
      return convertEndianness(leBytes, 64);
      
    case 1:
      // Direct BE: [x.c0 BE, x.c1 BE, y.c0 BE, y.c1 BE]
      result.set(fieldToBytes(x_c0), 0);
      result.set(fieldToBytes(x_c1), 32);
      result.set(fieldToBytes(y_c0), 64);
      result.set(fieldToBytes(y_c1), 96);
      return result;
      
    case 2:
      // Swapped: [x.c1 BE, x.c0 BE, y.c1 BE, y.c0 BE] - direct without convertEndianness
      result.set(fieldToBytes(x_c1), 0);
      result.set(fieldToBytes(x_c0), 32);
      result.set(fieldToBytes(y_c1), 64);
      result.set(fieldToBytes(y_c0), 96);
      return result;
      
    case 3:
      // Mixed: [x.c0 BE, x.c1 BE, y.c1 BE, y.c0 BE]
      result.set(fieldToBytes(x_c0), 0);
      result.set(fieldToBytes(x_c1), 32);
      result.set(fieldToBytes(y_c1), 64);
      result.set(fieldToBytes(y_c0), 96);
      return result;
      
    default:
      return g2ToBytes(point, 0);
  }
}

/**
 * VK structures
 */
export interface SolanaVK {
  nPublic: number;
  vk_alpha_g1: Uint8Array;
  vk_beta_g2: Uint8Array;
  vk_gamma_g2: Uint8Array;
  vk_delta_g2: Uint8Array;
  vk_ic: Uint8Array[];
}

export interface SolanaProof {
  proof_a: Uint8Array;
  proof_b: Uint8Array;
  proof_c: Uint8Array;
  combined: Uint8Array;
}

/**
 * Convert snarkjs VK to Solana format
 * Uses Light Protocol format by default (g2Variant = 1)
 */
export function convertVKForSolana(vk: any, g2Variant: number = 1): SolanaVK {
  const requiredFields = ['vk_alpha_1', 'vk_beta_2', 'vk_gamma_2', 'vk_delta_2', 'IC', 'nPublic'];
  for (const field of requiredFields) {
    if (!(field in vk)) {
      throw new Error(`Missing required field in VK: ${field}`);
    }
  }
  
  return {
    nPublic: vk.nPublic,
    vk_alpha_g1: g1ToBytes(vk.vk_alpha_1, 1),  // variant 1 = direct BE
    vk_beta_g2: g2ToBytes(vk.vk_beta_2, g2Variant),
    vk_gamma_g2: g2ToBytes(vk.vk_gamma_2, g2Variant),
    vk_delta_g2: g2ToBytes(vk.vk_delta_2, g2Variant),
    vk_ic: vk.IC.map((ic: string[]) => g1ToBytes(ic, 1)),  // variant 1 = direct BE
  };
}

/**
 * Convert snarkjs proof to Solana format
 * Uses Light Protocol format (verified working):
 * - G1: Direct BE
 * - G2: [c0 BE, c1 BE] order
 * - proof_a: NEGATED
 */
export function convertProofForSolana(proof: any): SolanaProof {
  if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
    throw new Error('Invalid proof: missing pi_a, pi_b, or pi_c');
  }
  
  // 1. proof_a: NEGATE first, then convert with variant 1 (direct BE)
  const negatedA = negateG1(proof.pi_a);
  const proof_a = g1ToBytes(negatedA, 1);
  
  // 2. proof_b: G2 conversion variant 1 (Light Protocol format)
  const proof_b = g2ToBytes(proof.pi_b, 1);
  
  // 3. proof_c: G1 conversion variant 1 (direct BE)
  const proof_c = g1ToBytes(proof.pi_c, 1);
  
  // 4. Combine for transaction
  const combined = new Uint8Array(256);
  combined.set(proof_a, 0);
  combined.set(proof_b, 64);
  combined.set(proof_c, 192);
  
  return { proof_a, proof_b, proof_c, combined };
}

/**
 * Convert snarkjs proof to Solana format WITHOUT negation
 * Use this if the verifier handles negation internally
 */
export function convertProofForSolanaNoNegate(proof: any): SolanaProof {
  if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
    throw new Error('Invalid proof: missing pi_a, pi_b, or pi_c');
  }
  
  // 1. proof_a: NO negation
  const proof_a = g1ToBytes(proof.pi_a);
  
  // 2. proof_b: G2 conversion
  const proof_b = g2ToBytes(proof.pi_b);
  
  // 3. proof_c: G1 conversion
  const proof_c = g1ToBytes(proof.pi_c);
  
  // 4. Combine for transaction
  const combined = new Uint8Array(256);
  combined.set(proof_a, 0);
  combined.set(proof_b, 64);
  combined.set(proof_c, 192);
  
  return { proof_a, proof_b, proof_c, combined };
}

/**
 * Convert public signals to 32-byte BIG-ENDIAN field elements
 * Public inputs are passed directly (no convert_endianness in verifier)
 */
export function convertPublicInputs(publicSignals: string[]): Uint8Array[] {
  return publicSignals.map(signal => fieldToBytes(signal));
}

/**
 * Combine public inputs into single Uint8Array
 */
export function combinePublicInputs(publicSignals: string[]): Uint8Array {
  const inputs = convertPublicInputs(publicSignals);
  const combined = new Uint8Array(inputs.length * 32);
  inputs.forEach((input, i) => {
    combined.set(input, i * 32);
  });
  return combined;
}

/**
 * Helper: bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Helper: Format bytes as Rust array literal
 */
export function bytesToRustArray(bytes: Uint8Array, name: string): string {
  const hex = Array.from(bytes).map(b => `0x${b.toString(16).padStart(2, '0')}`);
  const lines: string[] = [];
  
  lines.push(`pub const ${name}: [u8; ${bytes.length}] = [`);
  for (let i = 0; i < hex.length; i += 8) {
    const chunk = hex.slice(i, i + 8).join(', ');
    lines.push(`    ${chunk},`);
  }
  lines.push('];');
  return lines.join('\n');
}

/**
 * Generate Rust VK code
 */
export function generateRustVK(vk: SolanaVK, prefix: string): string {
  const lines: string[] = [];
  
  lines.push(`// Auto-generated verification key for ${prefix}`);
  lines.push(`// nPublic: ${vk.nPublic}`);
  lines.push('');
  lines.push(bytesToRustArray(vk.vk_alpha_g1, `${prefix}_VK_ALPHA_G1`));
  lines.push('');
  lines.push(bytesToRustArray(vk.vk_beta_g2, `${prefix}_VK_BETA_G2`));
  lines.push('');
  lines.push(bytesToRustArray(vk.vk_gamma_g2, `${prefix}_VK_GAMMA_G2`));
  lines.push('');
  lines.push(bytesToRustArray(vk.vk_delta_g2, `${prefix}_VK_DELTA_G2`));
  lines.push('');
  
  lines.push(`pub const ${prefix}_VK_IC: [[u8; 64]; ${vk.vk_ic.length}] = [`);
  vk.vk_ic.forEach((ic, i) => {
    lines.push(`    // IC[${i}]`);
    lines.push('    [');
    const hex = Array.from(ic).map(b => `0x${b.toString(16).padStart(2, '0')}`);
    for (let j = 0; j < hex.length; j += 8) {
      const chunk = hex.slice(j, j + 8).join(', ');
      lines.push(`        ${chunk},`);
    }
    lines.push('    ],');
  });
  lines.push('];');
  
  return lines.join('\n');
}

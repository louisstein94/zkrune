/**
 * zkRune - snarkjs to Sui (Arkworks) Format Converter
 *
 * Converts snarkjs proof/VK data to Arkworks canonical compressed serialization
 * for use with Sui's native sui::groth16 module (BN254).
 *
 * Key differences from Solana converter:
 * - Points are COMPRESSED (32 bytes G1, 64 bytes G2) vs uncompressed
 * - Field elements are LITTLE-ENDIAN vs big-endian
 * - VK is serialized as a single Arkworks blob, not individual components
 */

const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088696311157297823662689037894645226208583',
);

function bigintToLE(n: bigint, size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  let val = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  for (let i = 0; i < size; i++) {
    bytes[i] = Number(val & 0xffn);
    val >>= 8n;
  }
  return bytes;
}

function u64ToLE(n: number): Uint8Array {
  const bytes = new Uint8Array(8);
  let val = BigInt(n);
  for (let i = 0; i < 8; i++) {
    bytes[i] = Number(val & 0xffn);
    val >>= 8n;
  }
  return bytes;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Compress a G1 affine point to 32 bytes (Arkworks canonical).
 * x is serialized in LE; the MSB of the last byte encodes y parity.
 * Arkworks SWFlags (short_weierstrass): YIsPositive when y <= -y (no extra bits);
 * YIsNegative sets bit 7 (0x80). Point at infinity uses bit 6 (0x40).
 */
export function compressG1(xDec: string, yDec: string): Uint8Array {
  const x = BigInt(xDec);
  const y = BigInt(yDec);

  if (x === 0n && y === 0n) {
    const bytes = new Uint8Array(32);
    bytes[31] = 0x40; // SWFlags::PointAtInfinity
    return bytes;
  }

  const bytes = bigintToLE(x, 32);
  const negY = BN254_PRIME - y;

  if (y > negY) {
    bytes[31] |= 0x80; // YIsNegative
  }

  return bytes;
}

/**
 * Compress a G2 affine point to 64 bytes (Arkworks canonical).
 * x = (c0, c1), serialized as c0_LE(32) + c1_LE(32).
 * y parity uses Fp2 lexicographic ordering: compare c1 first, then c0.
 *
 * Note: snarkjs G2 format is [[x_c0, x_c1], [y_c0, y_c1]].
 */
export function compressG2(
  xC0Dec: string,
  xC1Dec: string,
  yC0Dec: string,
  yC1Dec: string,
): Uint8Array {
  const xC0 = BigInt(xC0Dec);
  const xC1 = BigInt(xC1Dec);
  const yC0 = BigInt(yC0Dec);
  const yC1 = BigInt(yC1Dec);

  const bytes = concat(bigintToLE(xC0, 32), bigintToLE(xC1, 32));

  const negYC0 = yC0 === 0n ? 0n : BN254_PRIME - yC0;
  const negYC1 = yC1 === 0n ? 0n : BN254_PRIME - yC1;

  // Fq2 lex order (ark_ff): c1 then c0. YIsNegative iff y > -y in that order.
  const yLexGreaterThanNeg =
    yC1 > negYC1 || (yC1 === negYC1 && yC0 > negYC0);
  if (yLexGreaterThanNeg) {
    bytes[63] |= 0x80;
  }

  return bytes;
}

// ─── VK Conversion ──────────────────────────────────────────────────────────

export interface SuiVK {
  nPublic: number;
  vkBytes: Uint8Array;
}

/**
 * Convert a snarkjs verification_key.json to Arkworks canonical compressed bytes.
 * This is the format expected by Sui's groth16::prepare_verifying_key().
 *
 * Arkworks VK serialization order:
 *   alpha_g1(32) + beta_g2(64) + gamma_g2(64) + delta_g2(64) + ic_count(u64 LE, 8) + ic_points(32 each)
 */
export function convertVKForSui(vk: any): SuiVK {
  const required = ['vk_alpha_1', 'vk_beta_2', 'vk_gamma_2', 'vk_delta_2', 'IC', 'nPublic'];
  for (const field of required) {
    if (!(field in vk)) {
      throw new Error(`Missing required field in VK: ${field}`);
    }
  }

  // snarkjs G2: [[c0, c1], [c0, c1], ["1","0"]]
  const g2 = (point: string[][]) => compressG2(point[0][0], point[0][1], point[1][0], point[1][1]);

  const alphaG1 = compressG1(vk.vk_alpha_1[0], vk.vk_alpha_1[1]);
  const betaG2 = g2(vk.vk_beta_2);
  const gammaG2 = g2(vk.vk_gamma_2);
  const deltaG2 = g2(vk.vk_delta_2);

  const icCount = u64ToLE(vk.IC.length);
  const icPoints = vk.IC.map((ic: string[]) => compressG1(ic[0], ic[1]));

  const vkBytes = concat(alphaG1, betaG2, gammaG2, deltaG2, icCount, ...icPoints);

  return { nPublic: vk.nPublic, vkBytes };
}

// ─── Proof Conversion ───────────────────────────────────────────────────────

export interface SuiProof {
  proofPointsBytes: Uint8Array;
}

/**
 * Convert a snarkjs proof to Sui format (Arkworks compressed).
 * Proof points: A_G1(32) + B_G2(64) + C_G1(32) = 128 bytes
 *
 * Unlike Solana, proof_a is NOT negated — Sui handles negation internally.
 */
export function convertProofForSui(proof: any): SuiProof {
  if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
    throw new Error('Invalid proof: missing pi_a, pi_b, or pi_c');
  }

  const a = compressG1(proof.pi_a[0], proof.pi_a[1]);
  const b = compressG2(
    proof.pi_b[0][0], proof.pi_b[0][1],
    proof.pi_b[1][0], proof.pi_b[1][1],
  );
  const c = compressG1(proof.pi_c[0], proof.pi_c[1]);

  return { proofPointsBytes: concat(a, b, c) };
}

// ─── Public Inputs Conversion ───────────────────────────────────────────────

/**
 * Convert public signals to concatenated 32-byte LITTLE-ENDIAN field elements.
 * Sui's public_proof_inputs_from_bytes expects this format.
 */
export function convertPublicInputsForSui(publicSignals: string[]): Uint8Array {
  const result = new Uint8Array(publicSignals.length * 32);
  publicSignals.forEach((signal, i) => {
    result.set(bigintToLE(BigInt(signal), 32), i * 32);
  });
  return result;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

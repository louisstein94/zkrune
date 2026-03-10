/**
 * @zkrune/kage-plugin — Viewing Key ZK Verification
 *
 * Drop-in adapter for the Kage Shadow Memory Protocol.
 * Replaces plaintext viewing key transmission with a Groth16 ZK proof,
 * so callers can prove they hold a valid viewing key without ever sending it.
 *
 * Usage (Kage SDK side):
 *   import { proveViewingKeyAccess, verifyViewingKeyProof } from '@zkrune/kage-plugin';
 */

import snarkjs from 'snarkjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ViewingKeyProofInput {
  /** The raw viewing key — stays private, never leaves the device. */
  viewingKey: bigint;
  /**
   * Random salt used when the memory was created and the on-chain hash was stored.
   * Retrieved from the user's local vault (not from chain).
   */
  salt: bigint;
  /**
   * Poseidon(viewingKey, salt) — the hash that Kage recorded on the Solana PDA.
   * Fetched from chain and therefore public.
   */
  viewingKeyHash: bigint;
}

export interface ViewingKeyProof {
  /** Groth16 proof object (π_a, π_b, π_c). */
  proof: object;
  /** Public signals: [isAuthorized, nullifier, viewingKeyHash] */
  publicSignals: string[];
  /** Nullifier derived from the viewing key — store on-chain to prevent replays. */
  nullifier: string;
  /** Always "1" when proof is valid. */
  isAuthorized: string;
}

export interface ViewingKeyProofResult {
  success: boolean;
  data?: ViewingKeyProof;
  error?: string;
  timingMs?: number;
}

// ---------------------------------------------------------------------------
// Circuit file locations
// ---------------------------------------------------------------------------

const CIRCUIT_BASE_URL = 'https://zkrune.com/circuits/viewing-key-proof';

async function loadCircuitFiles(circuitBaseUrl = CIRCUIT_BASE_URL) {
  const [wasmRes, zkeyRes, vkeyRes] = await Promise.all([
    fetch(`${circuitBaseUrl}/circuit.wasm`),
    fetch(`${circuitBaseUrl}/circuit_final.zkey`),
    fetch(`${circuitBaseUrl}/verification_key.json`),
  ]);

  if (!wasmRes.ok || !zkeyRes.ok || !vkeyRes.ok) {
    throw new Error('[zkrune/kage-plugin] Failed to load circuit files from ' + circuitBaseUrl);
  }

  const [wasmBuffer, zkeyBuffer, vKey] = await Promise.all([
    wasmRes.arrayBuffer(),
    zkeyRes.arrayBuffer(),
    vkeyRes.json(),
  ]);

  return {
    wasm: new Uint8Array(wasmBuffer),
    zkey: new Uint8Array(zkeyBuffer),
    vKey,
  };
}

// ---------------------------------------------------------------------------
// Core: Generate proof
// ---------------------------------------------------------------------------

/**
 * Generates a ZK proof that the caller knows the viewing key for a Kage memory.
 *
 * The viewing key itself is NEVER included in the proof or transmitted over the network.
 * Only the nullifier and `isAuthorized` flag are revealed as public signals.
 *
 * @example
 * ```ts
 * const result = await proveViewingKeyAccess({
 *   viewingKey: BigInt('0x' + Buffer.from(rawKey).toString('hex')),
 *   salt: storedSalt,
 *   viewingKeyHash: onChainHash,
 * });
 *
 * if (result.success) {
 *   await kage.submitAccessProof(result.data!);
 * }
 * ```
 */
export async function proveViewingKeyAccess(
  input: ViewingKeyProofInput,
  circuitBaseUrl?: string,
): Promise<ViewingKeyProofResult> {
  const t0 = Date.now();

  try {
    const { wasm, zkey, vKey } = await loadCircuitFiles(circuitBaseUrl);

    const circuitInputs = {
      viewingKey: input.viewingKey.toString(),
      salt: input.salt.toString(),
      viewingKeyHash: input.viewingKeyHash.toString(),
    };

    const { proof, publicSignals } = await (snarkjs as any).groth16.fullProve(
      circuitInputs,
      wasm,
      zkey,
    );

    // publicSignals layout: [isAuthorized, nullifier, viewingKeyHash]
    const isAuthorized = publicSignals[0];
    const nullifier = publicSignals[1];

    if (isAuthorized !== '1') {
      return {
        success: false,
        error: 'Viewing key does not match the on-chain hash. Access denied.',
      };
    }

    // Local verification before sending anywhere
    const valid = await (snarkjs as any).groth16.verify(vKey, publicSignals, proof);
    if (!valid) {
      return { success: false, error: 'Proof failed local verification.' };
    }

    return {
      success: true,
      data: { proof, publicSignals, nullifier, isAuthorized },
      timingMs: Date.now() - t0,
    };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}

// ---------------------------------------------------------------------------
// Core: Verify proof (server / Kage SDK side)
// ---------------------------------------------------------------------------

/**
 * Verifies a viewing key proof received from a client.
 * Call this on the Kage SDK / server side — no viewing key required.
 *
 * @param proofData   The proof object returned by `proveViewingKeyAccess`.
 * @param onChainHash The Poseidon hash stored on the Solana PDA.
 * @param usedNullifiers Set of nullifiers already consumed — prevents replays.
 */
export async function verifyViewingKeyProof(
  proofData: ViewingKeyProof,
  onChainHash: bigint,
  usedNullifiers: Set<string>,
  circuitBaseUrl?: string,
): Promise<{ valid: boolean; reason?: string }> {
  // Replay attack check
  if (usedNullifiers.has(proofData.nullifier)) {
    return { valid: false, reason: 'Nullifier already used (replay attack).' };
  }

  // Public signal sanity: the claimed on-chain hash must match what we fetched
  const claimedHash = proofData.publicSignals[2];
  if (BigInt(claimedHash) !== onChainHash) {
    return { valid: false, reason: 'On-chain hash mismatch.' };
  }

  try {
    const { vKey } = await loadCircuitFiles(circuitBaseUrl);

    const valid = await (snarkjs as any).groth16.verify(
      vKey,
      proofData.publicSignals,
      proofData.proof,
    );

    if (valid) {
      usedNullifiers.add(proofData.nullifier);
    }

    return { valid, reason: valid ? undefined : 'Proof verification failed.' };
  } catch (err: any) {
    return { valid: false, reason: err?.message ?? 'Verification error' };
  }
}

// ---------------------------------------------------------------------------
// Helper: Compute Poseidon hash of a viewing key (for Kage memory creation)
// ---------------------------------------------------------------------------

/**
 * Computes Poseidon(viewingKey, salt) — call this when creating a new Kage memory
 * to get the hash that will be stored on the Solana PDA.
 *
 * This replaces storing the raw viewing key anywhere.
 */
export async function hashViewingKey(viewingKey: bigint, salt: bigint): Promise<bigint> {
  const { buildPoseidon } = await import('circomlibjs');
  const poseidon = await buildPoseidon();
  const hash = poseidon([viewingKey, salt]);
  return poseidon.F.toObject(hash) as bigint;
}

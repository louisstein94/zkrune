/**
 * zkRune - Sui Transaction Builder for Groth16 Verification
 *
 * Builds Sui transactions for proof verification and circuit registration.
 * Uses the Sui TypeScript SDK (v1+).
 */

import { SUI_PROGRAM_IDS } from './config';
import {
  convertProofForSui,
  convertPublicInputsForSui,
  convertVKForSui,
  bytesToHex,
} from './converter';

export interface VerifyProofParams {
  templateId: number;
  proof: any;
  publicSignals: string[];
}

export interface RegisterCircuitParams {
  templateId: number;
  name: string;
  vkJson: any;
}

/**
 * Build the arguments for a verify_proof transaction.
 * Returns the raw byte arrays that should be passed to the Move function.
 */
export function buildVerifyProofArgs(params: VerifyProofParams) {
  const { proofPointsBytes } = convertProofForSui(params.proof);
  const publicInputsBytes = convertPublicInputsForSui(params.publicSignals);

  return {
    packageId: SUI_PROGRAM_IDS.GROTH16_VERIFIER_PACKAGE,
    registryId: SUI_PROGRAM_IDS.VERIFIER_REGISTRY,
    templateId: params.templateId,
    proofPointsBytes,
    publicInputsBytes,
    proofHex: bytesToHex(proofPointsBytes),
    inputsHex: bytesToHex(publicInputsBytes),
  };
}

/**
 * Build the arguments for a register_circuit transaction.
 */
export function buildRegisterCircuitArgs(params: RegisterCircuitParams) {
  const { nPublic, vkBytes } = convertVKForSui(params.vkJson);

  const nameBytes = new TextEncoder().encode(params.name);

  return {
    packageId: SUI_PROGRAM_IDS.GROTH16_VERIFIER_PACKAGE,
    registryId: SUI_PROGRAM_IDS.VERIFIER_REGISTRY,
    templateId: params.templateId,
    nameBytes,
    vkBytes,
    nPublic,
    vkHex: bytesToHex(vkBytes),
    nameHex: bytesToHex(nameBytes),
  };
}

/**
 * Example usage with @mysten/sui SDK:
 *
 * ```typescript
 * import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
 * import { Transaction } from '@mysten/sui/transactions';
 * import { buildVerifyProofArgs } from './txVerification';
 *
 * const client = new SuiClient({ url: getFullnodeUrl('devnet') });
 *
 * const args = buildVerifyProofArgs({
 *   templateId: 0,
 *   proof: snarkjsProof,
 *   publicSignals: ['123', '456', '789'],
 * });
 *
 * const tx = new Transaction();
 * tx.moveCall({
 *   target: `${args.packageId}::groth16_verifier::verify_proof`,
 *   arguments: [
 *     tx.object(args.registryId),
 *     tx.pure.u8(args.templateId),
 *     tx.pure(args.proofPointsBytes),
 *     tx.pure(args.publicInputsBytes),
 *   ],
 * });
 *
 * const result = await client.signAndExecuteTransaction({
 *   transaction: tx,
 *   signer: keypair,
 * });
 * ```
 */

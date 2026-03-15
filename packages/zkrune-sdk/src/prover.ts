import type {
  TemplateId,
  CircuitInputMap,
  ZKProofResult,
  ProveOptions,
} from './types';
import type { CircuitFiles } from './circuits/loader';
import { ZkRuneError, ZkRuneErrorCode } from './utils/errors';
import { Logger } from './utils/logger';
import { hashProof } from './utils/hash';

export async function prove<T extends TemplateId>(
  templateId: T,
  inputs: CircuitInputMap[T],
  circuitFiles: CircuitFiles,
  logger: Logger,
  options?: ProveOptions,
): Promise<ZKProofResult> {
  const startTime = Date.now();

  try {
    options?.onProgress?.('loading-circuit');

    const snarkjs = (await import('snarkjs')) as any;

    options?.onProgress?.('generating-proof');
    logger.debug(`Generating proof for ${templateId}...`);

    const { proof: groth16Proof, publicSignals } =
      await snarkjs.groth16.fullProve(
        inputs,
        circuitFiles.wasm,
        circuitFiles.zkey,
      );

    options?.onProgress?.('verifying');

    const isValid = await snarkjs.groth16.verify(
      circuitFiles.vkey,
      publicSignals,
      groth16Proof,
    );

    const timing = Date.now() - startTime;
    const proofHash = await hashProof(groth16Proof);

    logger.info(`Proof generated in ${timing}ms — valid: ${isValid}`);
    options?.onProgress?.('complete');

    return {
      success: true,
      proof: {
        groth16Proof,
        publicSignals,
        verificationKey: circuitFiles.vkey,
        timestamp: new Date().toISOString(),
        isValid,
        proofHash,
      },
      timing,
    };
  } catch (error) {
    const zkError =
      error instanceof ZkRuneError
        ? error
        : new ZkRuneError(
            error instanceof Error
              ? error.message
              : 'Proof generation failed',
            ZkRuneErrorCode.PROOF_GENERATION_FAILED,
          );
    logger.error(zkError.message);
    return { success: false, error: zkError.message };
  }
}

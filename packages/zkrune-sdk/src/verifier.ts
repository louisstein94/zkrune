import type { Groth16Proof, VerificationKey, VerifyResult } from './types';
import { ZkRuneError, ZkRuneErrorCode } from './utils/errors';
import { Logger } from './utils/logger';

export async function verifyLocal(
  proof: Groth16Proof,
  publicSignals: string[],
  verificationKey: VerificationKey,
  logger: Logger,
): Promise<boolean> {
  try {
    const snarkjs = (await import('snarkjs')) as any;
    const isValid = await snarkjs.groth16.verify(
      verificationKey,
      publicSignals,
      proof,
    );
    logger.info(`Local verification result: ${isValid}`);
    return isValid;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Verification failed';
    throw new ZkRuneError(message, ZkRuneErrorCode.VERIFICATION_FAILED);
  }
}

export async function verifyRemote(params: {
  circuitName: string;
  proof: Groth16Proof;
  publicSignals: string[];
  verifierUrl: string;
  timeout: number;
  logger: Logger;
}): Promise<VerifyResult> {
  const { circuitName, proof, publicSignals, verifierUrl, timeout, logger } =
    params;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    logger.debug(`Verifying proof remotely at ${verifierUrl}...`);

    const response = await fetch(verifierUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circuitName, proof, publicSignals }),
      signal: controller.signal,
    });

    const data = await response.json();
    logger.info(`Remote verification result: ${data.isValid}`);

    return {
      isValid: !!data.isValid,
      timing: data.timing,
      error: data.error,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ZkRuneError(
        `Remote verification timed out after ${timeout}ms`,
        ZkRuneErrorCode.TIMEOUT,
      );
    }
    const message =
      error instanceof Error ? error.message : 'Network error';
    throw new ZkRuneError(message, ZkRuneErrorCode.NETWORK_ERROR);
  } finally {
    clearTimeout(timer);
  }
}

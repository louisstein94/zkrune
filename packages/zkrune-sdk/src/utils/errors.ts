export enum ZkRuneErrorCode {
  CIRCUIT_NOT_FOUND = 'CIRCUIT_NOT_FOUND',
  CIRCUIT_LOAD_FAILED = 'CIRCUIT_LOAD_FAILED',
  INVALID_INPUTS = 'INVALID_INPUTS',
  PROOF_GENERATION_FAILED = 'PROOF_GENERATION_FAILED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export class ZkRuneError extends Error {
  constructor(
    message: string,
    public code: ZkRuneErrorCode,
  ) {
    super(message);
    this.name = 'ZkRuneError';
  }
}

export function toZkRuneError(error: unknown): ZkRuneError {
  if (error instanceof ZkRuneError) {
    return error;
  }
  if (error instanceof Error) {
    return new ZkRuneError(error.message, ZkRuneErrorCode.UNKNOWN);
  }
  return new ZkRuneError(String(error), ZkRuneErrorCode.UNKNOWN);
}

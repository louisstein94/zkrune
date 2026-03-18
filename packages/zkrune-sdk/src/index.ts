export { ZkRune } from './client';
export { prove } from './prover';
export { verifyLocal, verifyRemote } from './verifier';
export { CircuitLoader, templates, type CircuitFiles } from './circuits';
export { CIRCUIT_SCHEMAS, validateInputs } from './circuits/schemas';
export type { CircuitSchema, FieldSchema } from './circuits/schemas';

export type {
  ZkRuneConfig,
  Groth16Proof,
  VerificationKey,
  ZKProofResult,
  ProofData,
  VerifyResult,
  ProveOptions,
  ProofStage,
  TemplateId,
  CircuitInputMap,
  AgeVerificationInputs,
  BalanceProofInputs,
  MembershipProofInputs,
  RangeProofInputs,
  PrivateVotingInputs,
  HashPreimageInputs,
  CredentialProofInputs,
  TokenSwapInputs,
  SignatureVerificationInputs,
  PatienceProofInputs,
  QuadraticVotingInputs,
  NFTOwnershipInputs,
  AnonymousReputationInputs,
} from './types';

export { DEFAULT_CONFIG } from './types';
export { ZkRuneError, ZkRuneErrorCode, toZkRuneError } from './utils/errors';
export { Logger } from './utils/logger';
export type { LogLevel } from './utils/logger';

export { MembershipRegistry, memberLeafHash, stringToBigInt, DEFAULT_DEPTH } from './membership/registry';

/**
 * Backward-compatible standalone functions.
 * These use a default ZkRune instance internally.
 */
import { ZkRune } from './client';
import type { ZKProofResult, VerifyResult } from './types';

const _defaultInstance = new ZkRune();

export async function generateProof(options: {
  templateId: string;
  inputs: Record<string, string>;
  circuitPath?: string;
}): Promise<ZKProofResult> {
  const zk = options.circuitPath
    ? new ZkRune({ circuitBaseUrl: options.circuitPath })
    : _defaultInstance;
  return zk.prove(
    options.templateId as Parameters<ZkRune['prove']>[0],
    options.inputs as unknown as Parameters<ZkRune['prove']>[1],
  );
}

export async function verifyProof(params: {
  proof: unknown;
  publicSignals: string[];
  verificationKey: unknown;
}): Promise<boolean> {
  return _defaultInstance.verify(
    params.proof as Parameters<ZkRune['verify']>[0],
    params.publicSignals,
    params.verificationKey as Parameters<ZkRune['verify']>[2],
  );
}

export async function verifyProofRemote(params: {
  circuitName: string;
  proof: unknown;
  publicSignals: string[];
  verifierUrl?: string;
}): Promise<VerifyResult> {
  const zk = params.verifierUrl
    ? new ZkRune({ verifierUrl: params.verifierUrl })
    : _defaultInstance;
  return zk.verifyRemote({
    circuitName: params.circuitName,
    proof: params.proof as Parameters<ZkRune['verifyRemote']>[0]['proof'],
    publicSignals: params.publicSignals,
  });
}

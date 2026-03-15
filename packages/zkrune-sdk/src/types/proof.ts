export interface Groth16Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: string;
  curve: string;
}

export interface VerificationKey {
  protocol: string;
  curve: string;
  nPublic: number;
  vk_alpha_1: string[];
  vk_beta_2: string[][];
  vk_gamma_2: string[][];
  vk_delta_2: string[][];
  vk_alphabeta_12: string[][][];
  IC: string[][];
}

export interface ZKProofResult {
  success: boolean;
  proof?: ProofData;
  error?: string;
  timing?: number;
}

export interface ProofData {
  groth16Proof: Groth16Proof;
  publicSignals: string[];
  verificationKey: VerificationKey;
  timestamp: string;
  isValid: boolean;
  proofHash: string;
}

export interface VerifyResult {
  isValid: boolean;
  timing?: number;
  error?: string;
}

export interface ProveOptions {
  onProgress?: (stage: ProofStage, detail?: string) => void;
  signal?: AbortSignal;
}

export type ProofStage = 'loading-circuit' | 'generating-proof' | 'verifying' | 'complete';

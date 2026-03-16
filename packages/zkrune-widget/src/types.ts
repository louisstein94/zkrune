export type CircuitId =
  | 'age-verification'
  | 'balance-proof'
  | 'membership-proof'
  | 'range-proof'
  | 'private-voting'
  | 'hash-preimage'
  | 'credential-proof'
  | 'token-swap'
  | 'signature-verification'
  | 'patience-proof'
  | 'quadratic-voting'
  | 'nft-ownership'
  | 'anonymous-reputation'
  | 'whale-holder';

export type WidgetTheme = 'dark' | 'light';

export interface WidgetConfig {
  container: string | HTMLElement;
  circuit?: CircuitId;
  theme?: WidgetTheme;
  circuitBaseUrl?: string;
  verifierUrl?: string;
  buttonLabel?: string;
  lang?: 'en' | 'tr';
  onResult?: (result: VerifyResult) => void;
  onError?: (error: WidgetError) => void;
}

export interface VerifyResult {
  verified: boolean;
  circuitName: CircuitId;
  proof: Groth16Proof;
  publicSignals: string[];
  proofHash: string;
  timestamp: number;
}

export interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

export interface WidgetError {
  code: 'SNARKJS_LOAD_FAILED' | 'CIRCUIT_LOAD_FAILED' | 'PROOF_GENERATION_FAILED' | 'VERIFICATION_FAILED' | 'INVALID_INPUTS' | 'NETWORK_ERROR';
  message: string;
}

export interface FieldSchema {
  name: string;
  label: string;
  description: string;
  required: boolean;
  type: 'integer' | 'hash' | 'timestamp';
}

export interface CircuitMeta {
  id: CircuitId;
  name: string;
  description: string;
  category: 'identity' | 'financial' | 'governance' | 'cryptographic';
  fields: FieldSchema[];
}

export type WidgetStage = 'idle' | 'select' | 'input' | 'proving' | 'verifying' | 'result';

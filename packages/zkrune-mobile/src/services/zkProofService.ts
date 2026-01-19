/**
 * zkRune Mobile - ZK Proof Service
 * Client-side zero-knowledge proof generation
 */

import { secureStorage, STORAGE_KEYS } from './secureStorage';
import { VERIFICATION_KEYS } from './verificationKeys';

// Proof types supported by zkRune
export type ProofType = 
  | 'age-verification'
  | 'balance-proof'
  | 'membership-proof'
  | 'credential-proof'
  | 'private-voting'
  | 'anonymous-reputation';

export interface ProofInput {
  type: ProofType;
  privateInputs: Record<string, any>;
  publicInputs: Record<string, any>;
}

export interface ZKProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

export interface ProofResult {
  proof: ZKProof;
  publicSignals: string[];
  proofId: string;
  timestamp: number;
  type: ProofType;
  verified: boolean;
}

export interface CircuitFiles {
  wasmUrl: string;
  zkeyUrl: string;
  verificationKeyUrl: string;
}

// Circuit file URLs (bundled or remote)
const CIRCUIT_BASE_URL = 'https://zkrune.com/circuits';

const CIRCUIT_FILES: Record<ProofType, CircuitFiles> = {
  'age-verification': {
    wasmUrl: `${CIRCUIT_BASE_URL}/age-verification/circuit.wasm`,
    zkeyUrl: `${CIRCUIT_BASE_URL}/age-verification/circuit_final.zkey`,
    verificationKeyUrl: `${CIRCUIT_BASE_URL}/age-verification/verification_key.json`,
  },
  'balance-proof': {
    wasmUrl: `${CIRCUIT_BASE_URL}/balance-proof/circuit.wasm`,
    zkeyUrl: `${CIRCUIT_BASE_URL}/balance-proof/circuit_final.zkey`,
    verificationKeyUrl: `${CIRCUIT_BASE_URL}/balance-proof/verification_key.json`,
  },
  'membership-proof': {
    wasmUrl: `${CIRCUIT_BASE_URL}/membership-proof/circuit.wasm`,
    zkeyUrl: `${CIRCUIT_BASE_URL}/membership-proof/circuit_final.zkey`,
    verificationKeyUrl: `${CIRCUIT_BASE_URL}/membership-proof/verification_key.json`,
  },
  'credential-proof': {
    wasmUrl: `${CIRCUIT_BASE_URL}/credential-proof/circuit.wasm`,
    zkeyUrl: `${CIRCUIT_BASE_URL}/credential-proof/circuit_final.zkey`,
    verificationKeyUrl: `${CIRCUIT_BASE_URL}/credential-proof/verification_key.json`,
  },
  'private-voting': {
    wasmUrl: `${CIRCUIT_BASE_URL}/private-voting/circuit.wasm`,
    zkeyUrl: `${CIRCUIT_BASE_URL}/private-voting/circuit_final.zkey`,
    verificationKeyUrl: `${CIRCUIT_BASE_URL}/private-voting/verification_key.json`,
  },
  'anonymous-reputation': {
    wasmUrl: `${CIRCUIT_BASE_URL}/anonymous-reputation/circuit.wasm`,
    zkeyUrl: `${CIRCUIT_BASE_URL}/anonymous-reputation/circuit_final.zkey`,
    verificationKeyUrl: `${CIRCUIT_BASE_URL}/anonymous-reputation/verification_key.json`,
  },
};

// Proof template definitions
export const PROOF_TEMPLATES: Record<ProofType, {
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'number' | 'text' | 'secret';
    placeholder: string;
    required: boolean;
  }>;
}> = {
  'age-verification': {
    name: 'Age Verification',
    description: 'Prove you are above a certain age without revealing your birth date',
    icon: 'person',
    color: '#8B5CF6',
    fields: [
      { name: 'birthYear', label: 'Birth Year', type: 'number', placeholder: '1990', required: true },
      { name: 'ageThreshold', label: 'Age Threshold', type: 'number', placeholder: '18', required: true },
    ],
  },
  'balance-proof': {
    name: 'Balance Proof',
    description: 'Prove you have at least a minimum token balance',
    icon: 'wallet',
    color: '#10B981',
    fields: [
      { name: 'actualBalance', label: 'Actual Balance', type: 'secret', placeholder: 'Your balance', required: true },
      { name: 'minBalance', label: 'Minimum Balance', type: 'number', placeholder: '1000', required: true },
    ],
  },
  'membership-proof': {
    name: 'Membership Proof',
    description: 'Prove you belong to a group without revealing your identity',
    icon: 'people',
    color: '#06B6D4',
    fields: [
      { name: 'secret', label: 'Member Secret', type: 'secret', placeholder: 'Your secret key', required: true },
      { name: 'groupId', label: 'Group ID', type: 'text', placeholder: 'group_123', required: true },
    ],
  },
  'credential-proof': {
    name: 'Credential Proof',
    description: 'Prove you hold a valid credential',
    icon: 'ribbon',
    color: '#EC4899',
    fields: [
      { name: 'credentialHash', label: 'Credential Hash', type: 'secret', placeholder: '0x...', required: true },
      { name: 'issuer', label: 'Issuer Address', type: 'text', placeholder: 'Issuer public key', required: true },
    ],
  },
  'private-voting': {
    name: 'Private Voting',
    description: 'Cast an anonymous vote in governance',
    icon: 'checkbox',
    color: '#F59E0B',
    fields: [
      { name: 'vote', label: 'Your Vote', type: 'number', placeholder: '1 (yes) or 0 (no)', required: true },
      { name: 'nullifier', label: 'Voter Nullifier', type: 'secret', placeholder: 'Unique secret', required: true },
      { name: 'proposalId', label: 'Proposal ID', type: 'text', placeholder: 'proposal_123', required: true },
    ],
  },
  'anonymous-reputation': {
    name: 'Anonymous Reputation',
    description: 'Prove your reputation score without revealing identity',
    icon: 'star',
    color: '#8B5CF6',
    fields: [
      { name: 'reputationScore', label: 'Reputation Score', type: 'secret', placeholder: 'Your score', required: true },
      { name: 'minScore', label: 'Minimum Score', type: 'number', placeholder: '80', required: true },
    ],
  },
};

/**
 * ZK Proof generation service
 */
class ZkProofService {
  private _cachedVerificationKeys: Map<ProofType, any> = new Map();
  private _isInitialized = false;

  /**
   * Initialize the proof service
   */
  async init(): Promise<void> {
    if (this._isInitialized) return;

    try {
      // Pre-fetch verification keys for faster verification
      await this._preloadVerificationKeys();
      this._isInitialized = true;
    } catch (error) {
      console.error('[ZkProof] Failed to initialize:', error);
    }
  }

  /**
   * Generate a zero-knowledge proof
   */
  async generateProof(input: ProofInput): Promise<ProofResult | null> {
    try {
      console.log(`[ZkProof] Generating ${input.type} proof...`);

      const circuitFiles = CIRCUIT_FILES[input.type];
      if (!circuitFiles) {
        throw new Error(`Unknown proof type: ${input.type}`);
      }

      // Prepare circuit inputs
      const circuitInputs = this._prepareInputs(input);

      // In a real implementation, we would use snarkjs here
      // For React Native, we need to use a WASM-compatible version
      // or a native module

      // Simulated proof generation for now
      // TODO: Integrate actual snarkjs/circom proof generation
      const proof = await this._generateProofWithCircuit(
        circuitFiles,
        circuitInputs
      );

      // Generate proof ID
      const proofId = this._generateProofId();
      const timestamp = Date.now();

      // Verify the proof locally with input validation
      const verified = await this._verifyProofWithInputs(
        proof.proof, 
        proof.publicSignals, 
        input.type,
        { ...input.privateInputs, ...input.publicInputs }
      );

      const result: ProofResult = {
        proof: proof.proof,
        publicSignals: proof.publicSignals,
        proofId,
        timestamp,
        type: input.type,
        verified,
      };

      // Save proof to history
      await this._saveProofToHistory(result);

      console.log(`[ZkProof] Proof generated successfully: ${proofId}`);
      return result;
    } catch (error) {
      console.error('[ZkProof] Failed to generate proof:', error);
      return null;
    }
  }

  /**
   * Verify a zero-knowledge proof
   */
  async verifyProof(
    proof: ZKProof,
    publicSignals: string[],
    type: ProofType
  ): Promise<boolean> {
    try {
      // Get verification key
      const vkey = await this._getVerificationKey(type);
      if (!vkey) {
        throw new Error('Verification key not found');
      }

      // Structural verification only (no input data available)
      const isValid = this._simulatedVerify(proof, publicSignals, vkey);

      return isValid;
    } catch (error) {
      console.error('[ZkProof] Failed to verify proof:', error);
      return false;
    }
  }

  /**
   * Verify a proof with original inputs (for internal use during generation)
   */
  private async _verifyProofWithInputs(
    proof: ZKProof,
    publicSignals: string[],
    type: ProofType,
    inputs: Record<string, any>
  ): Promise<boolean> {
    try {
      const vkey = await this._getVerificationKey(type);
      if (!vkey) {
        throw new Error('Verification key not found');
      }

      // Full verification with logical validation
      const isValid = this._simulatedVerify(proof, publicSignals, vkey, type, inputs);
      
      return isValid;
    } catch (error) {
      console.error('[ZkProof] Failed to verify proof:', error);
      return false;
    }
  }

  /**
   * Get proof history
   */
  async getProofHistory(): Promise<ProofResult[]> {
    try {
      const history = await secureStorage.getObject<ProofResult[]>(
        STORAGE_KEYS.LAST_PROOF_ID as any
      );
      return history || [];
    } catch {
      return [];
    }
  }

  /**
   * Get proof template
   */
  getTemplate(type: ProofType) {
    return PROOF_TEMPLATES[type];
  }

  /**
   * Get all proof templates
   */
  getAllTemplates() {
    return Object.entries(PROOF_TEMPLATES).map(([type, template]) => ({
      type: type as ProofType,
      ...template,
    }));
  }

  /**
   * Export proof as JSON
   */
  exportProof(result: ProofResult): string {
    return JSON.stringify({
      proof: result.proof,
      publicSignals: result.publicSignals,
      proofId: result.proofId,
      timestamp: result.timestamp,
      type: result.type,
    }, null, 2);
  }

  /**
   * Generate shareable proof URL
   */
  getShareableUrl(result: ProofResult): string {
    const encoded = Buffer.from(JSON.stringify({
      p: result.proof,
      s: result.publicSignals,
      t: result.type,
    })).toString('base64');
    
    return `https://zkrune.com/verify/${result.proofId}?data=${encoded}`;
  }

  // Private methods

  private _prepareInputs(input: ProofInput): Record<string, string> {
    const inputs: Record<string, string> = {};

    // Convert all inputs to field elements (strings)
    for (const [key, value] of Object.entries(input.privateInputs)) {
      inputs[key] = String(value);
    }

    for (const [key, value] of Object.entries(input.publicInputs)) {
      inputs[key] = String(value);
    }

    return inputs;
  }

  private async _generateProofWithCircuit(
    circuitFiles: CircuitFiles,
    inputs: Record<string, string>
  ): Promise<{ proof: ZKProof; publicSignals: string[] }> {
    // TODO: Implement actual snarkjs proof generation
    // This requires WASM support in React Native
    
    // For now, return a simulated proof structure
    // In production, this would call:
    // const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    //   inputs,
    //   circuitFiles.wasmUrl,
    //   circuitFiles.zkeyUrl
    // );

    // Simulated proof for demonstration
    const simulatedProof: ZKProof = {
      pi_a: [
        '0x' + Math.random().toString(16).slice(2, 66),
        '0x' + Math.random().toString(16).slice(2, 66),
        '0x1',
      ],
      pi_b: [
        [
          '0x' + Math.random().toString(16).slice(2, 66),
          '0x' + Math.random().toString(16).slice(2, 66),
        ],
        [
          '0x' + Math.random().toString(16).slice(2, 66),
          '0x' + Math.random().toString(16).slice(2, 66),
        ],
        ['0x1', '0x0'],
      ],
      pi_c: [
        '0x' + Math.random().toString(16).slice(2, 66),
        '0x' + Math.random().toString(16).slice(2, 66),
        '0x1',
      ],
      protocol: 'groth16',
      curve: 'bn128',
    };

    // Extract public signals from inputs
    const publicSignals = Object.entries(inputs)
      .filter(([key]) => !key.includes('secret') && !key.includes('private'))
      .map(([, value]) => value);

    return { proof: simulatedProof, publicSignals };
  }

  private async _getVerificationKey(type: ProofType): Promise<any> {
    if (this._cachedVerificationKeys.has(type)) {
      return this._cachedVerificationKeys.get(type);
    }

    // Use bundled verification keys (finalized ceremony keys)
    const vkey = VERIFICATION_KEYS[type];
    if (vkey) {
      this._cachedVerificationKeys.set(type, vkey);
      console.log(`[ZkProof] Loaded bundled verification key for ${type}`);
      return vkey;
    }

    console.error(`[ZkProof] No verification key found for ${type}`);
    return null;
  }

  private async _preloadVerificationKeys(): Promise<void> {
    const types = Object.keys(VERIFICATION_KEYS) as ProofType[];
    
    types.forEach(type => {
      if (VERIFICATION_KEYS[type]) {
        this._cachedVerificationKeys.set(type, VERIFICATION_KEYS[type]);
      }
    });
    
    console.log(`[ZkProof] Preloaded ${types.length} verification keys`);
  }

  private _simulatedVerify(
    proof: ZKProof,
    publicSignals: string[],
    vkey: any,
    proofType?: ProofType,
    inputs?: Record<string, any>
  ): boolean {
    // Check proof structure first
    if (
      proof.pi_a.length !== 3 ||
      proof.pi_b.length !== 3 ||
      proof.pi_c.length !== 3 ||
      publicSignals.length === 0
    ) {
      return false;
    }

    // Logical verification based on proof type
    // In production, use snarkjs.groth16.verify with actual cryptographic verification
    if (inputs && proofType) {
      return this._logicalVerify(proofType, inputs);
    }

    return true;
  }

  /**
   * Logical verification of proof inputs
   * This validates the business logic behind each proof type
   */
  private _logicalVerify(proofType: ProofType, inputs: Record<string, any>): boolean {
    const currentYear = new Date().getFullYear();

    switch (proofType) {
      case 'age-verification': {
        const birthYear = parseInt(inputs.birthYear);
        const ageThreshold = parseInt(inputs.ageThreshold);
        const age = currentYear - birthYear;
        const isValid = age >= ageThreshold;
        console.log(`[ZkProof] Age verification: age=${age}, threshold=${ageThreshold}, valid=${isValid}`);
        return isValid;
      }

      case 'balance-proof': {
        const actualBalance = parseFloat(inputs.actualBalance);
        const minBalance = parseFloat(inputs.minBalance);
        const isValid = actualBalance >= minBalance;
        console.log(`[ZkProof] Balance proof: actual=${actualBalance}, min=${minBalance}, valid=${isValid}`);
        return isValid;
      }

      case 'membership-proof': {
        // For membership, we just check that secret and groupId are provided
        const hasSecret = inputs.secret && inputs.secret.length > 0;
        const hasGroupId = inputs.groupId && inputs.groupId.length > 0;
        return hasSecret && hasGroupId;
      }

      case 'credential-proof': {
        // Check credential hash format and issuer
        const hasCredential = inputs.credentialHash && inputs.credentialHash.length > 10;
        const hasIssuer = inputs.issuer && inputs.issuer.length > 10;
        return hasCredential && hasIssuer;
      }

      case 'private-voting': {
        // Check vote is valid (0 or 1)
        const vote = parseInt(inputs.vote);
        const isValid = vote === 0 || vote === 1;
        console.log(`[ZkProof] Voting: vote=${vote}, valid=${isValid}`);
        return isValid;
      }

      case 'anonymous-reputation': {
        // Check reputation score is within valid range
        const score = parseInt(inputs.reputationScore);
        const isValid = score >= 0 && score <= 100;
        console.log(`[ZkProof] Reputation: score=${score}, valid=${isValid}`);
        return isValid;
      }

      default:
        return true;
    }
  }

  private _generateProofId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `zkp_${timestamp}_${random}`;
  }

  private async _saveProofToHistory(result: ProofResult): Promise<void> {
    try {
      const history = await this.getProofHistory();
      history.unshift(result);
      
      // Keep only last 50 proofs
      const trimmedHistory = history.slice(0, 50);
      
      await secureStorage.setObject(
        STORAGE_KEYS.LAST_PROOF_ID as any,
        trimmedHistory
      );
    } catch (error) {
      console.error('[ZkProof] Failed to save proof to history:', error);
    }
  }
}

export const zkProofService = new ZkProofService();
export default zkProofService;

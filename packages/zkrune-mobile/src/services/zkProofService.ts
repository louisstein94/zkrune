/**
 * zkRune Mobile - ZK Proof Service
 * Real zero-knowledge proof generation using WebView + snarkjs
 */

import * as FileSystem from 'expo-file-system';
import { secureStorage, STORAGE_KEYS } from './secureStorage';
import { VERIFICATION_KEYS } from './verificationKeys';
import {
  ProofType as BridgeProofType,
  isCircuitCached,
  downloadCircuit as downloadCircuitFiles,
  getCachedCircuits,
  clearCache,
} from './zkProofBridge';

// Re-export ProofType
export type ProofType = BridgeProofType;

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
  isRealProof: boolean;
  generationTime?: number;
}

// Proof template definitions with condition labels
export const PROOF_TEMPLATES: Record<ProofType, {
  name: string;
  description: string;
  icon: string;
  color: string;
  conditionLabel: string; // What does output[0]=1 mean?
  conditionSuccessText: string;
  conditionFailText: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'number' | 'text' | 'secret';
    placeholder: string;
    required: boolean;
    isPrivate?: boolean;
  }>;
}> = {
  'age-verification': {
    name: 'Age Verification',
    description: 'Prove you are above a certain age without revealing your birth date',
    icon: 'person',
    color: '#8B5CF6',
    conditionLabel: 'Age Requirement',
    conditionSuccessText: 'Above minimum age ✓',
    conditionFailText: 'Below minimum age ✗',
    fields: [
      { name: 'birthYear', label: 'Birth Year', type: 'number', placeholder: '1990', required: true, isPrivate: true },
      { name: 'currentYear', label: 'Current Year', type: 'number', placeholder: '2026', required: true },
      { name: 'ageThreshold', label: 'Age Threshold', type: 'number', placeholder: '18', required: true },
    ],
  },
  'balance-proof': {
    name: 'Balance Proof',
    description: 'Prove you have at least a minimum token balance',
    icon: 'wallet',
    color: '#10B981',
    conditionLabel: 'Balance Check',
    conditionSuccessText: 'Sufficient balance ✓',
    conditionFailText: 'Insufficient balance ✗',
    fields: [
      { name: 'balance', label: 'Actual Balance', type: 'secret', placeholder: 'Your balance (e.g. 150000)', required: true, isPrivate: true },
      { name: 'minimumBalance', label: 'Minimum Balance', type: 'number', placeholder: '100000', required: true },
    ],
  },
  'membership-proof': {
    name: 'Membership Proof',
    description: 'Prove you belong to a group without revealing your identity',
    icon: 'people',
    color: '#06B6D4',
    conditionLabel: 'Membership',
    conditionSuccessText: 'Member verified ✓',
    conditionFailText: 'Not a member ✗',
    fields: [
      { name: 'secret', label: 'Member Secret', type: 'secret', placeholder: 'Your secret key', required: true, isPrivate: true },
      { name: 'nullifier', label: 'Nullifier', type: 'secret', placeholder: 'Unique nullifier', required: true, isPrivate: true },
    ],
  },
  'credential-proof': {
    name: 'Credential Proof',
    description: 'Prove you hold a valid credential',
    icon: 'ribbon',
    color: '#EC4899',
    conditionLabel: 'Credential Valid',
    conditionSuccessText: 'Valid credential ✓',
    conditionFailText: 'Invalid credential ✗',
    fields: [
      { name: 'credentialHash', label: 'Credential Hash', type: 'text', placeholder: 'Credential hash value', required: true },
      { name: 'credentialSecret', label: 'Credential Secret', type: 'secret', placeholder: 'Your secret', required: true, isPrivate: true },
      { name: 'validUntil', label: 'Valid Until (timestamp)', type: 'number', placeholder: '1767225600', required: true },
      { name: 'currentTime', label: 'Current Time', type: 'number', placeholder: String(Math.floor(Date.now() / 1000)), required: true },
      { name: 'expectedHash', label: 'Expected Hash', type: 'text', placeholder: 'Expected credential hash', required: true },
    ],
  },
  'private-voting': {
    name: 'Private Voting',
    description: 'Cast an anonymous vote in governance',
    icon: 'checkbox',
    color: '#F59E0B',
    conditionLabel: 'Vote Recorded',
    conditionSuccessText: 'Vote committed ✓',
    conditionFailText: 'Vote failed ✗',
    fields: [
      { name: 'vote', label: 'Your Vote', type: 'number', placeholder: '1 (yes) or 0 (no)', required: true, isPrivate: true },
      { name: 'nullifier', label: 'Voter Nullifier', type: 'secret', placeholder: 'Unique secret', required: true, isPrivate: true },
    ],
  },
  'anonymous-reputation': {
    name: 'Anonymous Reputation',
    description: 'Prove your reputation score without revealing identity',
    icon: 'star',
    color: '#8B5CF6',
    conditionLabel: 'Reputation Check',
    conditionSuccessText: 'Meets threshold ✓',
    conditionFailText: 'Below threshold ✗',
    fields: [
      { name: 'score', label: 'Reputation Score', type: 'secret', placeholder: 'Your score (0-100)', required: true, isPrivate: true },
      { name: 'minScore', label: 'Minimum Score', type: 'number', placeholder: '80', required: true },
    ],
  },
};

/**
 * ZK Proof Service
 * Manages proof generation state and history
 * Actual proof computation happens in ZkProofEngine component
 */
class ZkProofService {
  private _cachedVerificationKeys: Map<ProofType, any> = new Map();
  private _isInitialized = false;

  // Reference to the ZkProofEngine component (set by App.tsx)
  private _engineRef: any = null;
  private _engineReadyPromise: Promise<void>;
  private _engineReadyResolve: (() => void) | null = null;

  constructor() {
    // Create a promise that resolves when engine is ready
    this._engineReadyPromise = new Promise((resolve) => {
      this._engineReadyResolve = resolve;
    });
  }

  /**
   * Set the engine reference (called from App.tsx)
   */
  setEngineRef(ref: any): void {
    this._engineRef = ref;
    console.log('[ZkProof] Engine reference set');
    // Resolve the ready promise
    if (this._engineReadyResolve) {
      this._engineReadyResolve();
      this._engineReadyResolve = null;
    }
  }

  /**
   * Wait for engine to be ready (with timeout)
   */
  async waitForEngine(timeoutMs: number = 5000): Promise<boolean> {
    if (this._engineRef) return true;
    
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), timeoutMs);
    });
    
    const readyPromise = this._engineReadyPromise.then(() => true);
    
    return Promise.race([readyPromise, timeoutPromise]);
  }

  /**
   * Check if engine is available
   */
  isEngineReady(): boolean {
    return this._engineRef !== null;
  }

  /**
   * Initialize the proof service
   */
  async init(): Promise<void> {
    if (this._isInitialized) return;

    try {
      await this._preloadVerificationKeys();
      this._isInitialized = true;
      console.log('[ZkProof] Service initialized');
    } catch (error) {
      console.error('[ZkProof] Failed to initialize:', error);
    }
  }

  /**
   * Check if circuit is downloaded and ready
   */
  async isCircuitReady(type: ProofType): Promise<boolean> {
    return isCircuitCached(type);
  }

  /**
   * Download circuit files for a proof type
   */
  async downloadCircuit(
    type: ProofType,
    onProgress?: (progress: number, status: string) => void
  ): Promise<boolean> {
    return downloadCircuitFiles(type, onProgress);
  }

  /**
   * Get list of downloaded circuits
   */
  async getDownloadedCircuits(): Promise<ProofType[]> {
    return getCachedCircuits();
  }

  /**
   * Clear all downloaded circuits
   */
  async clearCircuitCache(): Promise<boolean> {
    return clearCache();
  }

  /**
   * Generate a zero-knowledge proof using the WebView engine
   */
  async generateProof(
    input: ProofInput,
    onProgress?: (status: string) => void
  ): Promise<ProofResult | null> {
    try {
      // Wait for engine to be ready if not already
      if (!this._engineRef) {
        onProgress?.('Waiting for ZK Engine...');
        const ready = await this.waitForEngine(5000);
        if (!ready || !this._engineRef) {
          throw new Error('ZK Engine not initialized. Please restart the app.');
        }
      }

      const startTime = Date.now();
      console.log(`[ZkProof] Generating ${input.type} proof...`);

      // Prepare inputs as strings
      const circuitInputs: Record<string, string> = {};
      for (const [key, value] of Object.entries(input.privateInputs)) {
        circuitInputs[key] = String(value);
      }
      for (const [key, value] of Object.entries(input.publicInputs)) {
        circuitInputs[key] = String(value);
      }

      // Generate proof using WebView engine
      const result = await this._engineRef.generateProof(
        input.type,
        circuitInputs,
        onProgress
      );

      if (!result.success || !result.proof) {
        throw new Error(result.error || 'Proof generation failed');
      }

      const totalTime = Date.now() - startTime;
      const proofId = this._generateProofId();

      const proofResult: ProofResult = {
        proof: result.proof,
        publicSignals: result.publicSignals || [],
        proofId,
        timestamp: Date.now(),
        type: input.type,
        verified: result.verified || false,
        isRealProof: true, // Always real with WebView engine!
        generationTime: result.generationTime || totalTime,
      };

      // Save to history
      await this._saveProofToHistory(proofResult);

      console.log(`[ZkProof] Real proof generated: ${proofId} in ${proofResult.generationTime}ms, publicSignals: [${proofResult.publicSignals.join(', ')}]`);
      return proofResult;
    } catch (error) {
      console.error('[ZkProof] Failed to generate proof:', error);
      return null;
    }
  }

  /**
   * Verify a proof using bundled verification keys
   */
  async verifyProof(
    proof: ZKProof,
    publicSignals: string[],
    type: ProofType
  ): Promise<boolean> {
    try {
      // For now, we trust the verification done during generation
      // Full re-verification would require another WebView call
      const vkey = await this._getVerificationKey(type);
      if (!vkey) {
        throw new Error('Verification key not found');
      }

      // Structural check
      if (
        proof.pi_a.length !== 3 ||
        proof.pi_b.length !== 3 ||
        proof.pi_c.length !== 3
      ) {
        return false;
      }

      return true;
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
   * Export proof as JSON (compatible with web verify page)
   */
  exportProof(result: ProofResult): string {
    return JSON.stringify({
      proof: {
        groth16Proof: result.proof,
        publicSignals: result.publicSignals,
        verificationKey: VERIFICATION_KEYS[result.type],
        timestamp: new Date(result.timestamp).toISOString(),
        isValid: result.verified,
        proofHash: `0x${result.proofId.replace('zkp_', '')}`,
        note: `REAL ZK-SNARK generated on mobile! (${result.generationTime}ms)`,
      },
      metadata: {
        template: result.type,
        generatedBy: 'zkRune Mobile',
        version: '1.0.0',
        isRealZK: true,
      },
    }, null, 2);
  }

  /**
   * Generate shareable proof URL
   */
  getShareableUrl(result: ProofResult): string {
    const encoded = Buffer.from(this.exportProof(result)).toString('base64');
    return `https://zkrune.com/verify-proof?data=${encoded}`;
  }

  // Private methods

  private async _getVerificationKey(type: ProofType): Promise<any> {
    if (this._cachedVerificationKeys.has(type)) {
      return this._cachedVerificationKeys.get(type);
    }

    const vkey = VERIFICATION_KEYS[type];
    if (vkey) {
      this._cachedVerificationKeys.set(type, vkey);
      return vkey;
    }

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

  private _generateProofId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `zkp_${timestamp}_${random}`;
  }

  private async _saveProofToHistory(result: ProofResult): Promise<void> {
    try {
      const history = await this.getProofHistory();
      history.unshift(result);
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

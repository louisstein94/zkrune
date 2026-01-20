/**
 * zkRune Mobile - useZkProof Hook
 * React hook for ZK proof generation and verification
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  zkProofService, 
  ProofType, 
  ProofInput, 
  ProofResult,
  PROOF_TEMPLATES,
} from '../services/zkProofService';
import { notificationService } from '../services/notificationService';

export interface UseZkProofReturn {
  // State
  isGenerating: boolean;
  isVerifying: boolean;
  isDownloading: boolean;
  currentProof: ProofResult | null;
  proofHistory: ProofResult[];
  error: string | null;
  progress: number;
  statusMessage: string;
  
  // Circuit management
  downloadedCircuits: ProofType[];
  isCircuitReady: (type: ProofType) => Promise<boolean>;
  downloadCircuit: (type: ProofType) => Promise<boolean>;
  
  // Actions
  generateProof: (input: ProofInput) => Promise<ProofResult | null>;
  verifyProof: (proofResult: ProofResult) => Promise<boolean>;
  exportProof: (proofResult: ProofResult) => string;
  getShareableUrl: (proofResult: ProofResult) => string;
  clearCurrentProof: () => void;
  loadHistory: () => Promise<void>;
  
  // Templates
  templates: Array<{
    type: ProofType;
    name: string;
    description: string;
    icon: string;
    color: string;
    conditionLabel?: string;
    conditionSuccessText?: string;
    conditionFailText?: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'number' | 'text' | 'secret';
      placeholder: string;
      required: boolean;
      isPrivate?: boolean;
    }>;
  }>;
  getTemplate: (type: ProofType) => typeof PROOF_TEMPLATES[ProofType];
}

export function useZkProof(): UseZkProofReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentProof, setCurrentProof] = useState<ProofResult | null>(null);
  const [proofHistory, setProofHistory] = useState<ProofResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadedCircuits, setDownloadedCircuits] = useState<ProofType[]>([]);

  // Initialize and load history on mount
  useEffect(() => {
    zkProofService.init();
    loadHistory();
    loadDownloadedCircuits();
  }, []);

  // Load proof history
  const loadHistory = useCallback(async (): Promise<void> => {
    try {
      const history = await zkProofService.getProofHistory();
      setProofHistory(history);
    } catch (err) {
      console.error('[useZkProof] Failed to load history:', err);
    }
  }, []);

  // Load downloaded circuits
  const loadDownloadedCircuits = useCallback(async (): Promise<void> => {
    try {
      const circuits = await zkProofService.getDownloadedCircuits();
      setDownloadedCircuits(circuits);
    } catch (err) {
      console.error('[useZkProof] Failed to load downloaded circuits:', err);
    }
  }, []);

  // Check if circuit is ready
  const isCircuitReady = useCallback(async (type: ProofType): Promise<boolean> => {
    return zkProofService.isCircuitReady(type);
  }, []);

  // Download circuit
  const downloadCircuit = useCallback(async (type: ProofType): Promise<boolean> => {
    setIsDownloading(true);
    setError(null);
    setProgress(0);
    setStatusMessage('Starting download...');

    try {
      const success = await zkProofService.downloadCircuit(type, (prog, status) => {
        setProgress(prog);
        setStatusMessage(status);
      });

      if (success) {
        await loadDownloadedCircuits();
        setStatusMessage('Download complete!');
      } else {
        setError('Failed to download circuit');
      }

      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
      return false;
    } finally {
      setIsDownloading(false);
      setTimeout(() => {
        setProgress(0);
        setStatusMessage('');
      }, 1000);
    }
  }, [loadDownloadedCircuits]);

  // Generate proof
  const generateProof = useCallback(async (input: ProofInput): Promise<ProofResult | null> => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setStatusMessage('Initializing...');

    try {
      // Check if circuit is downloaded
      const ready = await zkProofService.isCircuitReady(input.type);
      if (!ready) {
        setError('Circuit not downloaded. Please download first.');
        return null;
      }

      const result = await zkProofService.generateProof(input, (status) => {
        setStatusMessage(status);
        // Estimate progress based on status
        if (status.includes('Loading')) setProgress(20);
        if (status.includes('Preparing')) setProgress(40);
        if (status.includes('groth16')) setProgress(60);
        if (status.includes('Verifying')) setProgress(80);
      });

      setProgress(100);

      if (result) {
        setCurrentProof(result);
        setStatusMessage('Proof generated successfully!');
        
        // Send notification
        await notificationService.notifyProofGenerated(
          PROOF_TEMPLATES[input.type].name,
          result.proofId
        );

        // Refresh history
        await loadHistory();
      } else {
        setError('Failed to generate proof');
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setProgress(0);
        setStatusMessage('');
      }, 2000);
    }
  }, [loadHistory]);

  // Verify proof
  const verifyProof = useCallback(async (proofResult: ProofResult): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await zkProofService.verifyProof(
        proofResult.proof,
        proofResult.publicSignals,
        proofResult.type
      );

      if (isValid) {
        await notificationService.notifyProofVerified(proofResult.proofId);
      }

      return isValid;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Export proof
  const exportProof = useCallback((proofResult: ProofResult): string => {
    return zkProofService.exportProof(proofResult);
  }, []);

  // Get shareable URL
  const getShareableUrl = useCallback((proofResult: ProofResult): string => {
    return zkProofService.getShareableUrl(proofResult);
  }, []);

  // Clear current proof
  const clearCurrentProof = useCallback((): void => {
    setCurrentProof(null);
    setError(null);
    setProgress(0);
    setStatusMessage('');
  }, []);

  // Get template
  const getTemplate = useCallback((type: ProofType) => {
    return zkProofService.getTemplate(type);
  }, []);

  // Get all templates
  const templates = zkProofService.getAllTemplates();

  return {
    isGenerating,
    isVerifying,
    isDownloading,
    currentProof,
    proofHistory,
    error,
    progress,
    statusMessage,
    downloadedCircuits,
    isCircuitReady,
    downloadCircuit,
    generateProof,
    verifyProof,
    exportProof,
    getShareableUrl,
    clearCurrentProof,
    loadHistory,
    templates,
    getTemplate,
  };
}

export default useZkProof;

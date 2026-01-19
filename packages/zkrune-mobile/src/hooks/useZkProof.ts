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
  currentProof: ProofResult | null;
  proofHistory: ProofResult[];
  error: string | null;
  progress: number; // 0-100
  
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
    fields: Array<{
      name: string;
      label: string;
      type: 'number' | 'text' | 'secret';
      placeholder: string;
      required: boolean;
    }>;
  }>;
  getTemplate: (type: ProofType) => typeof PROOF_TEMPLATES[ProofType];
}

export function useZkProof(): UseZkProofReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentProof, setCurrentProof] = useState<ProofResult | null>(null);
  const [proofHistory, setProofHistory] = useState<ProofResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Initialize and load history on mount
  useEffect(() => {
    zkProofService.init();
    loadHistory();
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

  // Generate proof
  const generateProof = useCallback(async (input: ProofInput): Promise<ProofResult | null> => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const result = await zkProofService.generateProof(input);

      clearInterval(progressInterval);
      setProgress(100);

      if (result) {
        setCurrentProof(result);
        
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
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 1000);
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
    currentProof,
    proofHistory,
    error,
    progress,
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

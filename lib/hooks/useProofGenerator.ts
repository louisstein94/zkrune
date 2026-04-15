/**
 * Custom hook for proof generation with caching and optimization
 */

import { useState, useCallback, useRef } from 'react';
import { generateClientProof } from '@/lib/clientZkProof';

interface ProofCache {
  [key: string]: {
    proof: any;
    timestamp: number;
    inputs: any;
  };
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function useProofGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<ProofCache>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateProof = useCallback(
    async (templateId: string, inputs: any, options?: { forceRefresh?: boolean }) => {
      // Check cache first
      const cacheKey = `${templateId}-${JSON.stringify(inputs)}`;
      const cached = cacheRef.current[cacheKey];
      
      if (
        !options?.forceRefresh &&
        cached &&
        Date.now() - cached.timestamp < CACHE_DURATION
      ) {
        console.log('[ProofGen] Using cached proof');
        return {
          success: true,
          proof: cached.proof,
          fromCache: true,
        };
      }

      // Abort any in-flight generation before starting a new one.
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsGenerating(true);
      setProgress(0);
      setError(null);

      // Progress tick lives in a ref so the `finally` block can always
      // clear it, even when the component unmounts mid-generation.
      let progressInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const stopProgress = () => {
        if (progressInterval !== null) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      };

      try {
        const result = await generateClientProof(templateId, inputs);

        // Respect cancellation: if another call aborted this controller
        // while snarkjs was running, discard the result rather than
        // flipping progress to 100 on a cancelled job.
        if (controller.signal.aborted) {
          return { success: false, error: 'Cancelled' };
        }

        stopProgress();
        setProgress(100);

        if (result.success && result.proof) {
          cacheRef.current[cacheKey] = {
            proof: result.proof,
            timestamp: Date.now(),
            inputs,
          };
          return {
            success: true,
            proof: result.proof,
            timing: result.timing,
            fromCache: false,
          };
        }
        throw new Error(result.error || 'Proof generation failed');
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          return { success: false, error: 'Cancelled' };
        }
        const errorMessage = err.message || 'Unknown error during proof generation';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        stopProgress();
        setIsGenerating(false);
        // Only clear the ref if we are still the current controller; a
        // newer call may have replaced it already.
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    []
  );

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return {
    generateProof,
    cancelGeneration,
    clearCache,
    isGenerating,
    progress,
    error,
  };
}


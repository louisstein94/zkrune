'use client';

import { useState, useCallback } from 'react';

interface PublishResult {
  proofId: string;
  blinkUrl: string;
  directUrl: string;
  expiresAt: string;
}

interface UsePublishBlinkReturn {
  publish: (params: {
    circuitName: string;
    proof: any;
    publicSignals: string[];
    label?: string;
    description?: string;
    walletAddress?: string;
  }) => Promise<PublishResult | null>;
  isPublishing: boolean;
  result: PublishResult | null;
  error: string | null;
  reset: () => void;
}

export function usePublishBlink(): UsePublishBlinkReturn {
  const [isPublishing, setIsPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publish = useCallback(async (params: {
    circuitName: string;
    proof: any;
    publicSignals: string[];
    label?: string;
    description?: string;
    walletAddress?: string;
  }): Promise<PublishResult | null> => {
    setIsPublishing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/actions/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        const debugInfo = data.debug ? `\n${JSON.stringify(data.debug, null, 2)}` : '';
        throw new Error((data.error || 'Failed to publish Blink') + debugInfo);
      }

      const publishResult: PublishResult = {
        proofId: data.proofId,
        blinkUrl: data.blinkUrl,
        directUrl: data.directUrl,
        expiresAt: data.expiresAt,
      };

      setResult(publishResult);
      return publishResult;
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      setError(msg);
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsPublishing(false);
  }, []);

  return { publish, isPublishing, result, error, reset };
}

import { useState, useEffect, useCallback } from 'react';
import { PREMIUM_TIERS, type PremiumTier } from '@/lib/token/config';
import { useWalletAuth } from '@/lib/auth/useWalletAuth';

export interface PremiumStatus {
  wallet: string;
  tier: PremiumTier;
  total_burned: number;
  unlocked_at?: string;
  expires_at?: string;
  features: readonly string[];
  expired?: boolean;
}

export interface BurnRecord {
  id: string;
  wallet: string;
  amount: number;
  tier: string;
  transaction_signature: string;
  created_at: string;
}

export function usePremium(walletAddress?: string) {
  const { buildSignedPayload } = useWalletAuth();
  const [status, setStatus] = useState<PremiumStatus>({
    wallet: walletAddress || '',
    tier: 'FREE',
    total_burned: 0,
    features: PREMIUM_TIERS.FREE.features,
  });
  const [burnHistory, setBurnHistory] = useState<BurnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!walletAddress) {
      setStatus({
        wallet: '',
        tier: 'FREE',
        total_burned: 0,
        features: PREMIUM_TIERS.FREE.features,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/premium?wallet=${walletAddress}`);
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.error || 'Failed to fetch premium status');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const fetchBurnHistory = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/premium/history?wallet=${walletAddress}`);
      const data = await response.json();

      if (data.success) {
        setBurnHistory(data.data);
      }
    } catch {
      // Ignore history errors
    }
  }, [walletAddress]);

  const burnForPremium = useCallback(async (
    amount: number,
    targetTier: PremiumTier,
    transactionSignature: string
  ) => {
    if (!walletAddress) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      // Bind signature to burn amount, tier, and the on-chain tx — prevents replaying
      // a valid signature against a different tier or transaction
      const { signedMessage, signature } = await buildSignedPayload('premium', {
        amount: String(amount),
        targetTier,
        transactionSignature,
      });

      const response = await fetch('/api/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: walletAddress,
          amount,
          targetTier,
          transactionSignature,
          signedMessage,
          signature,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchStatus();
        await fetchBurnHistory();
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [walletAddress, fetchStatus, fetchBurnHistory, buildSignedPayload]);

  const hasFeatureAccess = useCallback((feature: string): boolean => {
    const featureRequirements: Record<string, PremiumTier[]> = {
      'unlimited-proofs': ['BUILDER', 'PRO', 'PROTOCOL'],
      'all-templates': ['BUILDER', 'PRO', 'PROTOCOL'],
      'private-verification': ['BUILDER', 'PRO', 'PROTOCOL'],
      'api-access': ['BUILDER', 'PRO', 'PROTOCOL'],
      'proof-batching': ['BUILDER', 'PRO', 'PROTOCOL'],
      'custom-circuits': ['PRO', 'PROTOCOL'],
      'private-tx-builder': ['PRO', 'PROTOCOL'],
      'multi-proof-compose': ['PRO', 'PROTOCOL'],
      'encrypted-proof-storage': ['PRO', 'PROTOCOL'],
      'private-rpc-relay': ['PROTOCOL'],
      'confidential-contracts': ['PROTOCOL'],
      'privacy-vault': ['PROTOCOL'],
      'compliance-modules': ['PROTOCOL'],
    };

    const requiredTiers = featureRequirements[feature];
    if (!requiredTiers) return true;

    return requiredTiers.includes(status.tier);
  }, [status.tier]);

  const getTokensForNextTier = useCallback((): { tier: PremiumTier; tokensNeeded: number } | null => {
    const tiers: PremiumTier[] = ['FREE', 'BUILDER', 'PRO', 'PROTOCOL'];
    const currentIndex = tiers.indexOf(status.tier);

    if (currentIndex >= tiers.length - 1) return null;

    const nextTier = tiers[currentIndex + 1];
    return {
      tier: nextTier,
      tokensNeeded: PREMIUM_TIERS[nextTier].burnRequired - status.total_burned,
    };
  }, [status]);

  const getTierProgress = useCallback((): number => {
    if (status.tier === 'PROTOCOL') return 100;

    const tiers: PremiumTier[] = ['FREE', 'BUILDER', 'PRO', 'PROTOCOL'];
    const currentIndex = tiers.indexOf(status.tier);
    const nextTier = tiers[currentIndex + 1];

    if (!nextTier) return 100;

    const currentRequired = PREMIUM_TIERS[status.tier].burnRequired;
    const nextRequired = PREMIUM_TIERS[nextTier].burnRequired;
    const progress = ((status.total_burned - currentRequired) / (nextRequired - currentRequired)) * 100;

    return Math.min(Math.max(progress, 0), 100);
  }, [status]);

  useEffect(() => {
    fetchStatus();
    fetchBurnHistory();
  }, [fetchStatus, fetchBurnHistory]);

  return {
    status,
    burnHistory,
    isLoading,
    error,
    fetchStatus,
    burnForPremium,
    hasFeatureAccess,
    getTokensForNextTier,
    getTierProgress,
    tiers: PREMIUM_TIERS,
    isPremium: status.tier !== 'FREE',
  };
}

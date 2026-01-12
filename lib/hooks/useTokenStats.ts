'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TokenStats {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: number;
  circulatingSupply: number;
  burned: number;
  holders: number;
  liquidity: number;
  lastUpdated: string;
}

interface UseTokenStatsResult {
  stats: TokenStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Default stats as fallback
const DEFAULT_STATS: TokenStats = {
  price: 0.0000042,
  priceChange24h: 0,
  marketCap: 4200,
  volume24h: 0,
  totalSupply: 1_000_000_000,
  circulatingSupply: 980_000_000,
  burned: 20_000_000,
  holders: 150,
  liquidity: 2000,
  lastUpdated: new Date().toISOString()
};

export function useTokenStats(): UseTokenStatsResult {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/token-stats');
      const data = await response.json();

      if (data.success && data.data) {
        setStats(data.data);
      } else {
        setStats(DEFAULT_STATS);
      }
    } catch (err) {
      console.error('Error fetching token stats:', err);
      setError('Failed to fetch token stats');
      setStats(DEFAULT_STATS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
}

// Calculate dynamic burn amounts based on market cap
export function calculateDynamicBurnTiers(stats: TokenStats | null) {
  if (!stats) {
    return {
      BUILDER: 100,
      PRO: 500,
      ENTERPRISE: 2000
    };
  }

  // Dynamic pricing based on market cap
  // At $1000 MC: 100/500/2000 tokens
  // At $10000 MC: 50/250/1000 tokens
  // At $100000 MC: 25/125/500 tokens
  // Formula: base * (1000 / marketCap) ^ 0.3

  const mcMultiplier = Math.pow(1000 / Math.max(stats.marketCap, 100), 0.3);
  
  return {
    BUILDER: Math.max(10, Math.round(100 * mcMultiplier)),
    PRO: Math.max(50, Math.round(500 * mcMultiplier)),
    ENTERPRISE: Math.max(200, Math.round(2000 * mcMultiplier))
  };
}

// Calculate USD value of tokens
export function calculateUsdValue(tokens: number, price: number): number {
  return tokens * price;
}

// Format currency
export function formatUsd(amount: number): string {
  if (amount < 0.01) {
    return `$${amount.toFixed(6)}`;
  }
  if (amount < 1) {
    return `$${amount.toFixed(4)}`;
  }
  if (amount < 1000) {
    return `$${amount.toFixed(2)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

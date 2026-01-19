/**
 * zkRune Mobile - usePrice Hook
 * React hook for live token prices
 */

import { useState, useEffect, useCallback } from 'react';
import { priceService, TokenPrice } from '../services/priceService';

export interface UsePriceReturn {
  zkRunePrice: TokenPrice | null;
  solPrice: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  formatPrice: (price: number) => string;
  formatChange: (change: number) => string;
}

export function usePrice(): UsePriceReturn {
  const [zkRunePrice, setZkRunePrice] = useState<TokenPrice | null>(null);
  const [solPrice, setSolPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [zkPrice, solPriceResult] = await Promise.all([
        priceService.getZkRunePrice(),
        priceService.getSolPrice(),
      ]);

      setZkRunePrice(zkPrice);
      setSolPrice(solPriceResult);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch prices on mount and every 60 seconds
  useEffect(() => {
    fetchPrices();
    
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const formatPrice = useCallback((price: number) => {
    return priceService.formatPrice(price);
  }, []);

  const formatChange = useCallback((change: number) => {
    return priceService.formatPriceChange(change);
  }, []);

  return {
    zkRunePrice,
    solPrice,
    isLoading,
    error,
    refresh: fetchPrices,
    formatPrice,
    formatChange,
  };
}

export default usePrice;

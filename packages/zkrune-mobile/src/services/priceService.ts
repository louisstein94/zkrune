/**
 * zkRune Mobile - Price Service
 * Fetches live token prices from Helius DAS API
 */

import Constants from 'expo-constants';
import { ZKRUNE_TOKEN, DEFAULT_MAINNET_RPC } from './solanaRpc';

// Helius API key from environment
const HELIUS_API_KEY = Constants.expoConfig?.extra?.heliusApiKey || '';
const HELIUS_API_BASE = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : DEFAULT_MAINNET_RPC;

// Fallback API (CoinGecko for SOL)
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

export interface TokenPrice {
  price: number;
  priceChange24h: number;
  volume24h?: number;
  marketCap?: number;
  lastUpdated: number;
}

class PriceService {
  private _cache: Map<string, TokenPrice> = new Map();
  private _cacheTimeout = 30000; // 30 seconds
  private _solPrice: number = 0;
  private _solPriceUpdated: number = 0;

  /**
   * Get zkRUNE price from Helius DAS API
   */
  async getZkRunePrice(): Promise<TokenPrice | null> {
    return this.getTokenPrice(ZKRUNE_TOKEN.mint);
  }

  /**
   * Get token price by mint address using Helius
   */
  async getTokenPrice(mintAddress: string): Promise<TokenPrice | null> {
    // Check cache
    const cached = this._cache.get(mintAddress);
    if (cached && Date.now() - cached.lastUpdated < this._cacheTimeout) {
      return cached;
    }

    try {
      // Try Helius DAS API
      const heliusPrice = await this._fetchHeliusPrice(mintAddress);
      if (heliusPrice) {
        this._cache.set(mintAddress, heliusPrice);
        return heliusPrice;
      }

      // Fallback: Get from Helius asset data
      const assetPrice = await this._fetchHeliusAssetPrice(mintAddress);
      if (assetPrice) {
        this._cache.set(mintAddress, assetPrice);
        return assetPrice;
      }

      return null;
    } catch (error) {
      console.error('[PriceService] Failed to fetch price:', error);
      return cached || null;
    }
  }

  /**
   * Get SOL price from CoinGecko
   */
  async getSolPrice(): Promise<number> {
    // Check cache (5 minutes for SOL price)
    if (this._solPrice > 0 && Date.now() - this._solPriceUpdated < 300000) {
      return this._solPrice;
    }

    try {
      const response = await fetch(
        `${COINGECKO_API}?ids=solana&vs_currencies=usd&include_24hr_change=true`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await response.json();
      
      if (data.solana?.usd) {
        this._solPrice = data.solana.usd;
        this._solPriceUpdated = Date.now();
        console.log('[PriceService] SOL price updated:', this._solPrice);
        return this._solPrice;
      }
      
      return this._solPrice || 200; // Fallback to ~$200
    } catch (error) {
      console.error('[PriceService] Failed to fetch SOL price:', error);
      return this._solPrice || 200;
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price: number, decimals: number = 4): string {
    if (price === 0) return '$0.00';
    if (price < 0.0001) {
      return '$' + price.toExponential(2);
    }
    if (price < 0.01) {
      return '$' + price.toFixed(6);
    }
    if (price < 1) {
      return '$' + price.toFixed(decimals);
    }
    return '$' + price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Format price change percentage
   */
  formatPriceChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  // =====================================================
  // HELIUS API METHODS
  // =====================================================

  /**
   * Fetch token price using Helius getAsset RPC
   */
  private async _fetchHeliusPrice(mintAddress: string): Promise<TokenPrice | null> {
    try {
      const response = await fetch(HELIUS_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'price-fetch',
          method: 'getAsset',
          params: {
            id: mintAddress,
            displayOptions: {
              showFungible: true,
            },
          },
        }),
      });

      const data = await response.json();
      
      if (data.result?.token_info?.price_info) {
        const priceInfo = data.result.token_info.price_info;
        console.log('[PriceService] Helius price info:', priceInfo);
        
        return {
          price: priceInfo.price_per_token || 0,
          priceChange24h: priceInfo.price_change_24h || 0,
          volume24h: priceInfo.volume_24h,
          marketCap: priceInfo.market_cap,
          lastUpdated: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('[PriceService] Helius getAsset failed:', error);
      return null;
    }
  }

  /**
   * Alternative: Get price from token account balances
   */
  private async _fetchHeliusAssetPrice(mintAddress: string): Promise<TokenPrice | null> {
    try {
      // Use getAssetsByOwner to get price data
      const response = await fetch(HELIUS_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'asset-price',
          method: 'searchAssets',
          params: {
            ownerAddress: null, // Search by mint
            tokenMint: mintAddress,
            page: 1,
            limit: 1,
          },
        }),
      });

      const data = await response.json();
      
      if (data.result?.items?.[0]?.token_info?.price_info) {
        const priceInfo = data.result.items[0].token_info.price_info;
        return {
          price: priceInfo.price_per_token || 0,
          priceChange24h: 0,
          lastUpdated: Date.now(),
        };
      }

      // If no price data, return a placeholder
      // In production, you'd integrate with DEX aggregator
      console.log('[PriceService] No price data found for:', mintAddress);
      return {
        price: 0,
        priceChange24h: 0,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('[PriceService] Helius searchAssets failed:', error);
      return null;
    }
  }

  /**
   * Clear price cache
   */
  clearCache(): void {
    this._cache.clear();
    this._solPrice = 0;
    this._solPriceUpdated = 0;
  }
}

export const priceService = new PriceService();
export default priceService;

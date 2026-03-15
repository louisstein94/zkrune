/**
 * zkRune Mobile - Price Service
 * Jupiter Price API (primary) + Helius DAS API (fallback)
 */

import Constants from 'expo-constants';
import { ZKRUNE_TOKEN, DEFAULT_MAINNET_RPC } from './solanaRpc';

const HELIUS_API_KEY = Constants.expoConfig?.extra?.heliusApiKey;
const HELIUS_API_BASE = HELIUS_API_KEY && HELIUS_API_KEY !== 'HELIUS_API_KEY_REDACTED'
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : null;

const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2';
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
  private _cacheTimeout = 30000;
  private _solPrice: number = 0;
  private _solPriceUpdated: number = 0;

  async getZkRunePrice(): Promise<TokenPrice | null> {
    return this.getTokenPrice(ZKRUNE_TOKEN.mint);
  }

  async getTokenPrice(mintAddress: string): Promise<TokenPrice | null> {
    const cached = this._cache.get(mintAddress);
    if (cached && Date.now() - cached.lastUpdated < this._cacheTimeout) {
      return cached;
    }

    try {
      // 1) Jupiter Price API — most reliable for Solana SPL tokens
      const jupiterPrice = await this._fetchJupiterPrice(mintAddress);
      if (jupiterPrice && jupiterPrice.price > 0) {
        this._cache.set(mintAddress, jupiterPrice);
        return jupiterPrice;
      }

      // 2) Helius DAS API fallback (if valid key configured)
      if (HELIUS_API_BASE) {
        const heliusPrice = await this._fetchHeliusPrice(mintAddress);
        if (heliusPrice && heliusPrice.price > 0) {
          this._cache.set(mintAddress, heliusPrice);
          return heliusPrice;
        }
      }

      // 3) DexScreener fallback
      const dexPrice = await this._fetchDexScreenerPrice(mintAddress);
      if (dexPrice && dexPrice.price > 0) {
        this._cache.set(mintAddress, dexPrice);
        return dexPrice;
      }

      return cached || { price: 0, priceChange24h: 0, lastUpdated: Date.now() };
    } catch (error) {
      console.error('[PriceService] Failed to fetch price:', error);
      return cached || { price: 0, priceChange24h: 0, lastUpdated: Date.now() };
    }
  }

  async getSolPrice(): Promise<number> {
    if (this._solPrice > 0 && Date.now() - this._solPriceUpdated < 300000) {
      return this._solPrice;
    }

    try {
      // Try Jupiter first for SOL price (via wrapped SOL)
      const solMint = 'So11111111111111111111111111111111111111112';
      const jupResponse = await fetch(
        `${JUPITER_PRICE_API}?ids=${solMint}`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!jupResponse.ok) throw new Error(`HTTP ${jupResponse.status}`);
      const jupData = await jupResponse.json();
      if (jupData.data?.[solMint]?.price) {
        this._solPrice = parseFloat(jupData.data[solMint].price);
        this._solPriceUpdated = Date.now();
        return this._solPrice;
      }
    } catch {}

    try {
      const response = await fetch(
        `${COINGECKO_API}?ids=solana&vs_currencies=usd&include_24hr_change=true`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.solana?.usd) {
        this._solPrice = data.solana.usd;
        this._solPriceUpdated = Date.now();
        return this._solPrice;
      }

      return this._solPrice || 0;
    } catch (error) {
      console.error('[PriceService] Failed to fetch SOL price:', error);
      return this._solPrice || 0;
    }
  }

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

  formatPriceChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  // ===========================================
  // Jupiter Price API
  // ===========================================

  private async _fetchJupiterPrice(mintAddress: string): Promise<TokenPrice | null> {
    try {
      const response = await fetch(
        `${JUPITER_PRICE_API}?ids=${mintAddress}&showExtraInfo=true`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const tokenData = data.data?.[mintAddress];
      if (tokenData?.price) {
        const price = parseFloat(tokenData.price);
        const extraInfo = tokenData.extraInfo;

        let priceChange24h = 0;
        if (extraInfo?.lastSwappedPrice?.lastJupiterSellPrice) {
          const lastPrice = parseFloat(extraInfo.lastSwappedPrice.lastJupiterSellPrice);
          if (lastPrice > 0) {
            priceChange24h = ((price - lastPrice) / lastPrice) * 100;
          }
        }

        console.log('[PriceService] Jupiter price:', price, 'change:', priceChange24h);
        return {
          price,
          priceChange24h,
          lastUpdated: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('[PriceService] Jupiter API failed:', error);
      return null;
    }
  }

  // ===========================================
  // Helius DAS API
  // ===========================================

  private async _fetchHeliusPrice(mintAddress: string): Promise<TokenPrice | null> {
    if (!HELIUS_API_BASE) return null;

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
            displayOptions: { showFungible: true },
          },
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.result?.token_info?.price_info) {
        const priceInfo = data.result.token_info.price_info;
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

  // ===========================================
  // DexScreener API (last resort)
  // ===========================================

  private async _fetchDexScreenerPrice(mintAddress: string): Promise<TokenPrice | null> {
    try {
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const pair = data.pairs?.[0];
      if (pair?.priceUsd) {
        return {
          price: parseFloat(pair.priceUsd),
          priceChange24h: pair.priceChange?.h24 || 0,
          volume24h: pair.volume?.h24,
          marketCap: pair.marketCap,
          lastUpdated: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('[PriceService] DexScreener failed:', error);
      return null;
    }
  }

  clearCache(): void {
    this._cache.clear();
    this._solPrice = 0;
    this._solPriceUpdated = 0;
  }
}

export const priceService = new PriceService();
export default priceService;

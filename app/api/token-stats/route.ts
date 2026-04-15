import { NextResponse } from 'next/server';

// zkRUNE Token Address on Pump.fun (Solana)
const TOKEN_MINT = '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump';

// Pump.fun standard token supply
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens
const DECIMALS = 6;

interface TokenStats {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: number;
  // null when the data source does not expose an authoritative value.
  circulatingSupply: number | null;
  burned: number | null;
  holders: number;
  liquidity: number;
  lastUpdated: string;
}

export async function GET() {
  try {
    // Try to fetch from DexScreener API (free, no auth required)
    const dexScreenerData = await fetchDexScreener();
    
    if (dexScreenerData) {
      return NextResponse.json({
        success: true,
        data: dexScreenerData,
        source: 'dexscreener'
      });
    }

    // Fallback to mock data if API fails
    return NextResponse.json({
      success: true,
      data: getMockTokenStats(),
      source: 'fallback'
    });

  } catch (error) {
    console.error('Error fetching token stats:', error);
    return NextResponse.json({
      success: true,
      data: getMockTokenStats(),
      source: 'fallback'
    });
  }
}

async function fetchDexScreener(): Promise<TokenStats | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`,
      { 
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      // Get the main pair (usually the one with highest liquidity)
      const mainPair = data.pairs.reduce((prev: any, curr: any) => 
        (parseFloat(curr.liquidity?.usd || 0) > parseFloat(prev.liquidity?.usd || 0)) ? curr : prev
      );

      const price = parseFloat(mainPair.priceUsd) || 0;
      const priceChange24h = parseFloat(mainPair.priceChange?.h24) || 0;
      const volume24h = parseFloat(mainPair.volume?.h24) || 0;
      const liquidity = parseFloat(mainPair.liquidity?.usd) || 0;
      const marketCap = parseFloat(mainPair.marketCap) || (price * TOTAL_SUPPLY);
      
      // Burned amount is NOT known from DexScreener. Return null so the
      // UI can render "—" instead of a fabricated 2%-of-supply number.
      // Authoritative burn totals come from /api/premium/history which
      // sums on-chain burn_history rows.
      return {
        price,
        priceChange24h,
        marketCap,
        volume24h,
        totalSupply: TOTAL_SUPPLY,
        circulatingSupply: null,
        burned: null,
        holders: 0, // DexScreener doesn't provide this
        liquidity,
        lastUpdated: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('DexScreener fetch error:', error);
    return null;
  }
}

function getMockTokenStats(): TokenStats {
  // Placeholder data used when no real source is available. burned /
  // circulatingSupply are null here too — the UI should treat this
  // response as "no data yet" and fall back to "—".
  return {
    price: 0.0000042,
    priceChange24h: 12.5,
    marketCap: 4200,
    volume24h: 850,
    totalSupply: TOTAL_SUPPLY,
    circulatingSupply: null,
    burned: null,
    holders: 156,
    liquidity: 2100,
    lastUpdated: new Date().toISOString()
  };
}

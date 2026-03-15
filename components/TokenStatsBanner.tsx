'use client';

import { useTokenStats, formatUsd, formatNumber } from '@/lib/hooks/useTokenStats';

interface TokenStatsBannerProps {
  compact?: boolean;
  showBuyButton?: boolean;
}

export default function TokenStatsBanner({ compact = false, showBuyButton = true }: TokenStatsBannerProps) {
  const { stats, isLoading } = useTokenStats();

  if (isLoading || !stats) {
    return (
      <div className="bg-gradient-to-r from-[#6366F1]/5 to-[#8B5CF6]/5 border border-white/10 rounded-xl p-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex gap-6">
            <div className="h-10 w-24 bg-white/10 rounded" />
            <div className="h-10 w-24 bg-white/10 rounded" />
            <div className="h-10 w-24 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">zkRUNE:</span>
          <span className="font-medium text-white">{formatUsd(stats.price)}</span>
          <span className={`${stats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.priceChange24h >= 0 ? '+' : ''}{stats.priceChange24h.toFixed(1)}%
          </span>
        </div>
        <div className="border-l border-white/10 pl-4">
          <span className="text-gray-400">MC:</span>
          <span className="font-medium text-[#6366F1] ml-1">{formatUsd(stats.marketCap)}</span>
        </div>
        {showBuyButton && (
          <a
            href="https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6366F1] hover:text-[#4F46E5] transition font-medium"
          >
            Buy →
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border border-white/10 rounded-xl p-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Price</div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {formatUsd(stats.price)}
              <span className={`text-sm ${stats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(stats.priceChange24h).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="border-l border-white/10 pl-6">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Market Cap</div>
            <div className="text-lg font-bold text-[#6366F1]">{formatUsd(stats.marketCap)}</div>
          </div>
          <div className="border-l border-white/10 pl-6">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Burned</div>
            <div className="text-lg font-bold text-orange-400">{formatNumber(stats.burned)}</div>
          </div>
          <div className="border-l border-white/10 pl-6">
            <div className="text-xs text-gray-400 uppercase tracking-wider">24h Volume</div>
            <div className="text-lg font-bold text-white">{formatUsd(stats.volume24h)}</div>
          </div>
          <div className="border-l border-white/10 pl-6">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Liquidity</div>
            <div className="text-lg font-bold text-[#8B5CF6]">{formatUsd(stats.liquidity)}</div>
          </div>
        </div>
        {showBuyButton && (
          <a
            href="https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition font-bold text-sm"
          >
            Buy zkRUNE on Pump.fun
          </a>
        )}
      </div>
    </div>
  );
}

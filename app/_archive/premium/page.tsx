'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);
import {
  getUserPremiumStatus,
  simulateBurn,
  getBurnHistory,
  getTierFromBurnedAmount,
  getTokensForNextTier,
  type UserPremiumStatus,
} from '@/lib/token/burn';
import { PREMIUM_TIERS, type PremiumTier, formatTokenAmount } from '@/lib/token/config';
import { useTokenStats, formatUsd, formatNumber, calculateDynamicBurnTiers } from '@/lib/hooks/useTokenStats';
import { useTokenBurn } from '@/lib/hooks/useTokenBurn';

export default function PremiumPage() {
  const { publicKey, connected } = useWallet();
  const { stats: tokenStats, isLoading: statsLoading } = useTokenStats();
  const { burnTokens, isBurning, result: burnResult } = useTokenBurn();
  const [status, setStatus] = useState<UserPremiumStatus | null>(null);
  const [selectedTier, setSelectedTier] = useState<PremiumTier>('BUILDER');
  const [burnAmount, setBurnAmount] = useState('');
  const [burnHistory, setBurnHistory] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // Calculate dynamic burn tiers based on current market cap
  const dynamicTiers = calculateDynamicBurnTiers(tokenStats);

  useEffect(() => {
    loadUserStatus();
  }, [publicKey]);

  function loadUserStatus() {
    const userStatus = getUserPremiumStatus(publicKey?.toBase58());
    setStatus(userStatus);
    setBurnHistory(getBurnHistory().slice(0, 10));
  }

  async function handleBurn() {
    if (!publicKey || !burnAmount) return;

    const amount = parseFloat(burnAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Perform real on-chain burn
    const result = await burnTokens(amount);
    
    if (result.success) {
      setShowSuccess(true);
      setTxSignature(result.signature || null);
      
      // Also update local state for premium status tracking
      simulateBurn(publicKey.toBase58(), amount, selectedTier);
      loadUserStatus();
      setBurnAmount('');
      
      setTimeout(() => {
        setShowSuccess(false);
        setTxSignature(null);
      }, 5000);
    } else {
      alert(result.error || 'Burn failed');
    }
  }

  function handleTierSelect(tier: PremiumTier) {
    setSelectedTier(tier);
    const required = PREMIUM_TIERS[tier].burnRequired - (status?.totalBurned || 0);
    if (required > 0) {
      setBurnAmount(required.toString());
    }
  }

  const tiers = Object.entries(PREMIUM_TIERS) as [PremiumTier, typeof PREMIUM_TIERS[PremiumTier]][];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#6366F1]">
            zkRune
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/governance" className="text-gray-400 hover:text-white transition">
              Governance
            </Link>
            <Link href="/marketplace" className="text-gray-400 hover:text-white transition">
              Marketplace
            </Link>
            <Link href="/staking" className="text-gray-400 hover:text-white transition">
              Staking
            </Link>
            <WalletMultiButton className="!bg-[#6366F1] hover:!bg-[#5b4bd4] !text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-24 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-4 rounded-lg z-50 animate-fade-in max-w-md">
            <div className="font-semibold mb-1">Tokens burned successfully!</div>
            <div className="text-sm text-green-300/80">Your tier has been upgraded.</div>
            {txSignature && (
              <a 
                href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-400 hover:text-green-300 underline mt-2 block"
              >
                View on Solscan
              </a>
            )}
          </div>
        )}

        {/* Live Token Stats Banner */}
        {tokenStats && (
          <div className="bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border border-white/10 rounded-xl p-4 mb-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-400">zkRUNE Price</div>
                  <div className="text-lg font-bold text-white">
                    {formatUsd(tokenStats.price)}
                    <span className={`text-sm ml-2 ${tokenStats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tokenStats.priceChange24h >= 0 ? '+' : ''}{tokenStats.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <div className="text-xs text-gray-400">Market Cap</div>
                  <div className="text-lg font-bold text-[#6366F1]">{formatUsd(tokenStats.marketCap)}</div>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <div className="text-xs text-gray-400">Total Burned</div>
                  <div className="text-lg font-bold text-emerald-400">{formatNumber(tokenStats.burned)} zkRUNE</div>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <div className="text-xs text-gray-400">24h Volume</div>
                  <div className="text-lg font-bold text-white">{formatUsd(tokenStats.volume24h)}</div>
                </div>
              </div>
              <a
                href="https://pump.fun/coin/51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#6366F1]/20 text-[#6366F1] rounded-lg hover:bg-[#6366F1]/30 transition text-sm font-medium"
              >
                Buy on Pump.fun →
              </a>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Privacy Infrastructure Tiers
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Burn zkRUNE to unlock advanced privacy tools. Thresholds scale with circulating supply —
            as more tokens are burned, requirements decrease for everyone.
          </p>
          {tokenStats && (
            <p className="text-sm text-[#8B5CF6] mt-2">
              Current circulating supply: {formatNumber(tokenStats.circulatingSupply)} zkRUNE · Burned: {formatNumber(tokenStats.burned)} zkRUNE
            </p>
          )}
        </div>

        {/* Current Status */}
        {connected && status && (
          <div className="bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Your Current Tier</div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  {status.tier === 'FREE' && 'Free'}
                  {status.tier === 'BUILDER' && 'Builder'}
                  {status.tier === 'PRO' && 'Pro'}
                  {status.tier === 'PROTOCOL' && 'Protocol'}
                  {status.tier !== 'FREE' && (
                    <span className="text-sm px-2 py-1 bg-[#6366F1]/20 text-[#6366F1] rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Total Burned</div>
                <div className="text-2xl font-bold text-[#6366F1]">
                  {formatTokenAmount(status.totalBurned)} zkRUNE
                </div>
              </div>
              {status.tier !== 'PROTOCOL' && (
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Next Tier</div>
                  {(() => {
                    const next = getTokensForNextTier(status.tier);
                    return next ? (
                        <div className="text-lg text-white">
                        {next.tier}: <span className="text-[#8B5CF6]">{next.tokensNeeded} more</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tier Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map(([tierKey, tier]) => {
            const isCurrentTier = status?.tier === tierKey;
            const isUnlocked = status && 
              tiers.findIndex(([k]) => k === status.tier) >= tiers.findIndex(([k]) => k === tierKey);
            
            return (
              <div
                key={tierKey}
                className={`relative bg-white/5 border rounded-xl p-6 transition-all ${
                  isCurrentTier
                    ? 'border-[#6366F1] ring-2 ring-[#6366F1]/20'
                    : selectedTier === tierKey
                    ? 'border-[#8B5CF6]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#6366F1] text-white text-xs font-bold rounded-full">
                    CURRENT
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                
                <div className="mb-4">
                  {tier.burnRequired === 0 ? (
                    <span className="text-gray-400">Free</span>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-[#6366F1]">
                        {formatTokenAmount(tier.burnRequired)}
                      </span>
                      <span className="text-gray-400 ml-1">zkRUNE</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className={isUnlocked ? 'text-[#6366F1]' : 'text-gray-500'}>
                        {isUnlocked ? 'check' : 'x'}
                      </span>
                      <span className={isUnlocked ? 'text-gray-300' : 'text-gray-500'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {tierKey !== 'FREE' && !isUnlocked && (
                  <button
                    onClick={() => handleTierSelect(tierKey)}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      selectedTier === tierKey
                        ? 'bg-[#8B5CF6] text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    Select
                  </button>
                )}

                {isUnlocked && tierKey !== 'FREE' && (
                  <div className="text-center text-[#6366F1] font-medium py-2">
                    Unlocked
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Burn Section */}
        {connected ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Burn Tokens</h3>
            
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-gray-400 mb-2">
                  Amount to Burn
                </label>
                <input
                  type="number"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:border-[#6366F1] focus:outline-none"
                />
              </div>
              
              <button
                onClick={handleBurn}
                disabled={isBurning || !burnAmount}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBurning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Burning...
                  </span>
                ) : (
                  'Burn zkRUNE'
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Burned tokens are permanently destroyed and cannot be recovered. 
              This is a deflationary mechanism that reduces total supply.
            </p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center mb-8">
            <p className="text-gray-400 mb-4">Connect your wallet to burn tokens and unlock premium features</p>
            <WalletMultiButton className="!bg-[#6366F1] hover:!bg-[#5b4bd4] !text-white" />
          </div>
        )}

        {/* Burn History */}
        {burnHistory.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Burns</h3>
            
            <div className="space-y-3">
              {burnHistory.map((record, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-3 border-b border-white/5 last:border-0"
                >
                  <div>
                    <div className="text-white font-medium">
                      {formatTokenAmount(record.amount)} zkRUNE
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(record.timestamp).toLocaleDateString('en-US', { timeZone: 'UTC' })} - 
                      Unlocked {record.tier}
                    </div>
                  </div>
                  <div className="text-right">
                    <a
                      href={`https://solscan.io/tx/${record.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#8B5CF6] hover:underline"
                    >
                      {record.signature.slice(0, 8)}...
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-[#6366F1] text-2xl mb-3">Supply-Linked</div>
            <h4 className="text-white font-semibold mb-2">Burns Shrink Requirements</h4>
            <p className="text-gray-400 text-sm">
              Tier thresholds are a fixed percentage of circulating supply. As more tokens
              are burned, the cost to unlock every tier drops proportionally.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-[#8B5CF6] text-2xl mb-3">Privacy-Native</div>
            <h4 className="text-white font-semibold mb-2">Real ZK Infrastructure</h4>
            <p className="text-gray-400 text-sm">
              Each tier unlocks actual privacy primitives — private verification,
              custom circuits, encrypted storage, and on-chain privacy vaults.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="text-emerald-400 text-2xl mb-3">Cumulative</div>
            <h4 className="text-white font-semibold mb-2">Burns Stack Up</h4>
            <p className="text-gray-400 text-sm">
              All your burns accumulate. Burn in small amounts over time or all at once 
              to reach your desired tier.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}


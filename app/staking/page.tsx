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
  getUserStakingInfo,
  createStake,
  claimRewards,
  unstake,
  getStakingStats,
  getLockPeriodOptions,
  getTimeUntilUnlock,
  calculatePendingRewards,
  type StakePosition,
  type UserStakingInfo,
} from '@/lib/token/staking';
import { STAKING_CONFIG, formatTokenAmount } from '@/lib/token/config';
import { useStakingOnChain } from '@/lib/hooks/useStakingOnChain';

export default function StakingPage() {
  const { publicKey, connected } = useWallet();
  const { stakeTokens, isStaking, isVaultConfigured } = useStakingOnChain();
  const [userInfo, setUserInfo] = useState<UserStakingInfo | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getStakingStats> | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'stake' | 'positions'>('stake');
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const lockPeriods = getLockPeriodOptions();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [publicKey]);

  function loadData() {
    if (publicKey) {
      setUserInfo(getUserStakingInfo(publicKey.toBase58()));
    }
    setStats(getStakingStats());
  }

  async function handleStake() {
    if (!publicKey || !stakeAmount) return;

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount < STAKING_CONFIG.MIN_STAKE) {
      alert(`Minimum stake is ${STAKING_CONFIG.MIN_STAKE} zkRUNE`);
      return;
    }

    setIsProcessing(true);

    // Try on-chain staking first if vault is configured
    if (isVaultConfigured()) {
      const onChainResult = await stakeTokens(amount);
      if (!onChainResult.success) {
        alert(onChainResult.error || 'On-chain staking failed');
        setIsProcessing(false);
        return;
      }
      setTxSignature(onChainResult.signature || null);
    }

    // Record stake in local state
    const result = createStake(publicKey.toBase58(), amount, selectedPeriod);
    
    if (result.success) {
      loadData();
      setStakeAmount('');
      setTimeout(() => setTxSignature(null), 5000);
    } else {
      alert(result.error || 'Staking failed');
    }

    setIsProcessing(false);
  }

  async function handleClaim(positionId: string) {
    if (!publicKey) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = claimRewards(positionId, publicKey.toBase58());
    
    if (result.success) {
      loadData();
      alert(`Claimed ${formatTokenAmount(result.amount || 0)} zkRUNE!`);
    } else {
      alert(result.error || 'Claim failed');
    }

    setIsProcessing(false);
  }

  async function handleUnstake(positionId: string) {
    if (!publicKey) return;

    const position = userInfo?.positions.find(p => p.id === positionId);
    if (!position) return;

    const timeInfo = getTimeUntilUnlock(position);
    
    if (!timeInfo.isUnlocked) {
      const confirmed = confirm(
        `Your stake is locked for ${timeInfo.days}d ${timeInfo.hours}h more. ` +
        `Early withdrawal will result in a 50% penalty. Continue?`
      );
      if (!confirmed) return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = unstake(positionId, publicKey.toBase58());
    
    if (result.success) {
      loadData();
      alert(
        `Unstaked ${formatTokenAmount(result.amount || 0)} zkRUNE` +
        (result.rewards ? ` + ${formatTokenAmount(result.rewards)} rewards` : '')
      );
    } else {
      alert(result.error || 'Unstake failed');
    }

    setIsProcessing(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#00FFA3]">
            zkRune
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/governance" className="text-gray-400 hover:text-white transition">
              Governance
            </Link>
            <Link href="/premium" className="text-gray-400 hover:text-white transition">
              Premium
            </Link>
            <Link href="/marketplace" className="text-gray-400 hover:text-white transition">
              Marketplace
            </Link>
            <WalletMultiButton className="!bg-[#6B4CFF] hover:!bg-[#5a3de6]" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Toast */}
        {txSignature && (
          <div className="fixed top-24 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-4 rounded-lg z-50 animate-fade-in max-w-md">
            <div className="font-semibold mb-1">Staking successful!</div>
            <a 
              href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 hover:text-green-300 underline"
            >
              View on Solscan
            </a>
          </div>
        )}

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Staking Rewards
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stake your zkRUNE tokens to earn rewards. Longer lock periods earn higher APY. 
            Earn up to {STAKING_CONFIG.MAX_APY}% APY.
          </p>
        </div>

        {/* Global Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatTokenAmount(stats.totalStaked)}
              </div>
              <div className="text-gray-400 text-sm">Total Staked</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#00FFA3]">{stats.totalStakers}</div>
              <div className="text-gray-400 text-sm">Stakers</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stats.averageAPY.toFixed(1)}%
              </div>
              <div className="text-gray-400 text-sm">Average APY</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatTokenAmount(stats.totalRewardsPaid)}
              </div>
              <div className="text-gray-400 text-sm">Rewards Paid</div>
            </div>
          </div>
        )}

        {/* User Stats */}
        {connected && userInfo && (
          <div className="bg-gradient-to-r from-[#6B4CFF]/20 to-[#00FFA3]/20 border border-white/10 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Your Staked</div>
                <div className="text-2xl font-bold text-white">
                  {formatTokenAmount(userInfo.totalStaked)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Pending Rewards</div>
                <div className="text-2xl font-bold text-[#00FFA3]">
                  {formatTokenAmount(userInfo.totalPendingRewards)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Claimed</div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatTokenAmount(userInfo.totalClaimed)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Effective APY</div>
                <div className="text-2xl font-bold text-purple-400">
                  {userInfo.effectiveAPY.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('stake')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'stake'
                ? 'bg-[#00FFA3] text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Stake
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'positions'
                ? 'bg-[#00FFA3] text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            My Positions {userInfo?.positions.length ? `(${userInfo.positions.length})` : ''}
          </button>
        </div>

        {activeTab === 'stake' ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Stake Form */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Stake zkRUNE</h3>

              {connected ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount</label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder={`Min ${STAKING_CONFIG.MIN_STAKE}`}
                      min={STAKING_CONFIG.MIN_STAKE}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-lg focus:border-[#00FFA3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Lock Period</label>
                    <div className="grid grid-cols-2 gap-3">
                      {lockPeriods.map((period) => (
                        <button
                          key={period.days}
                          onClick={() => setSelectedPeriod(period.days)}
                          className={`p-4 rounded-lg border transition ${
                            selectedPeriod === period.days
                              ? 'border-[#00FFA3] bg-[#00FFA3]/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="text-white font-semibold">{period.name}</div>
                          <div className="text-[#00FFA3] text-lg font-bold">
                            {period.apy}% APY
                          </div>
                          <div className="text-gray-400 text-sm">
                            {period.multiplier}x multiplier
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {stakeAmount && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Estimated Daily</span>
                        <span className="text-white">
                          {formatTokenAmount(
                            parseFloat(stakeAmount) * 
                            (lockPeriods.find(p => p.days === selectedPeriod)?.apy || 12) / 
                            365 / 100
                          )} zkRUNE
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Estimated Yearly</span>
                        <span className="text-[#00FFA3] font-semibold">
                          {formatTokenAmount(
                            parseFloat(stakeAmount) * 
                            (lockPeriods.find(p => p.days === selectedPeriod)?.apy || 12) / 
                            100
                          )} zkRUNE
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleStake}
                    disabled={isProcessing || isStaking || !stakeAmount}
                    className="w-full py-3 bg-[#00FFA3] text-black font-semibold rounded-lg hover:bg-[#00cc82] transition disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Stake Now'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Connect your wallet to stake</p>
                  <WalletMultiButton className="!bg-[#6B4CFF] hover:!bg-[#5a3de6]" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">How Staking Works</h4>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFA3]">1.</span>
                    Choose your stake amount and lock period
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFA3]">2.</span>
                    Longer locks earn higher APY (up to 3x multiplier)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFA3]">3.</span>
                    Claim rewards daily without unstaking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00FFA3]">4.</span>
                    Unstake after lock period ends with no penalty
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">!</span>
                    Early withdrawal incurs 50% penalty
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">APY Breakdown</h4>
                <div className="space-y-3">
                  {lockPeriods.map((period) => (
                    <div key={period.days} className="flex justify-between items-center">
                      <span className="text-gray-400">{period.name}</span>
                      <div className="text-right">
                        <span className="text-white font-semibold">{period.apy}%</span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({period.multiplier}x)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Positions Tab */
          <div className="space-y-4">
            {!userInfo?.positions.length ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400 mb-4">No staking positions yet</p>
                <button
                  onClick={() => setActiveTab('stake')}
                  className="px-6 py-2 bg-[#00FFA3] text-black font-medium rounded-lg"
                >
                  Start Staking
                </button>
              </div>
            ) : (
              userInfo.positions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  onClaim={handleClaim}
                  onUnstake={handleUnstake}
                  isProcessing={isProcessing}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PositionCard({
  position,
  onClaim,
  onUnstake,
  isProcessing,
}: {
  position: StakePosition;
  onClaim: (id: string) => void;
  onUnstake: (id: string) => void;
  isProcessing: boolean;
}) {
  const timeInfo = getTimeUntilUnlock(position);
  const pendingRewards = calculatePendingRewards(position);
  const lockPeriods = getLockPeriodOptions();
  const periodInfo = lockPeriods.find(p => p.days === position.lockPeriodDays);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-white">
            {formatTokenAmount(position.amount)} zkRUNE
          </div>
          <div className="text-gray-400 text-sm">
            Staked {new Date(position.stakedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${timeInfo.isUnlocked ? 'text-[#00FFA3]' : 'text-orange-400'}`}>
            {timeInfo.isUnlocked ? 'Unlocked' : `${timeInfo.days}d ${timeInfo.hours}h left`}
          </div>
          <div className="text-gray-400 text-sm">
            {periodInfo?.name} ({periodInfo?.apy}% APY)
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="bg-white/5 rounded-lg px-4 py-2">
          <div className="text-sm text-gray-400">Pending Rewards</div>
          <div className="text-lg font-semibold text-[#00FFA3]">
            {formatTokenAmount(pendingRewards)} zkRUNE
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onClaim(position.id)}
            disabled={isProcessing || pendingRewards < 0.01}
            className="px-4 py-2 bg-[#00FFA3] text-black font-medium rounded-lg hover:bg-[#00cc82] transition disabled:opacity-50"
          >
            Claim
          </button>
          <button
            onClick={() => onUnstake(position.id)}
            disabled={isProcessing}
            className={`px-4 py-2 font-medium rounded-lg transition ${
              timeInfo.isUnlocked
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
          >
            {timeInfo.isUnlocked ? 'Unstake' : 'Early Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
}


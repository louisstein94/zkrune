'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useStakingOnChain, LOCK_PERIODS } from '@/lib/hooks/useStakingOnChain';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const DEVNET_TOKEN_MINT = process.env.NEXT_PUBLIC_STAKING_TOKEN_MINT || 'A619D39h4CxHT7rSSurWAb2Un36c6W8BLyJWBYGxzstP';

function formatTokenAmount(amount: number): string {
  if (amount === 0) return '0';
  if (amount < 0.001) return amount.toFixed(6);
  if (amount < 1) return amount.toFixed(4);
  if (amount < 1000) return amount.toFixed(2);
  if (amount < 1000000) return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return (amount / 1000000).toFixed(2) + 'M';
}

function formatTimeRemaining(days: number, hours: number, minutes: number): string {
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function StakingPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const {
    stakeTokens,
    unstakeTokens,
    claimRewards,
    refreshData,
    isStaking,
    isUnstaking,
    isClaiming,
    isLoading,
    poolState,
    userStake,
    result,
    error,
    getTimeUntilUnlock,
    isProgramReady,
    programId,
  } = useStakingOnChain();

  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'stake' | 'position'>('stake');
  const [programReady, setProgramReady] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [showTestGuide, setShowTestGuide] = useState(true);

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    if (!publicKey || !connection) return;
    try {
      const mint = new PublicKey(DEVNET_TOKEN_MINT);
      const ata = getAssociatedTokenAddressSync(mint, publicKey);
      const account = await getAccount(connection, ata);
      setTokenBalance(Number(account.amount) / 1_000_000);
    } catch {
      setTokenBalance(0);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected) {
      fetchTokenBalance();
    }
  }, [connected, fetchTokenBalance]);

  useEffect(() => {
    async function init() {
      const ready = await isProgramReady();
      setProgramReady(ready);
      if (ready) {
        await refreshData();
      }
    }
    init();
  }, [isProgramReady, refreshData]);

  useEffect(() => {
    if (connected && programReady) {
      refreshData();
    }
  }, [connected, programReady, refreshData]);

  useEffect(() => {
    if (!programReady) return;
    const interval = setInterval(() => {
      refreshData();
      fetchTokenBalance();
    }, 30000);
    return () => clearInterval(interval);
  }, [programReady, refreshData, fetchTokenBalance]);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  async function handleStake() {
    if (!publicKey || !stakeAmount) return;

    const amount = parseFloat(stakeAmount);
    const minStake = poolState?.minStakeAmount || 100;

    if (isNaN(amount) || amount < minStake) {
      showNotification('error', `Minimum stake is ${minStake} zkRUNE`);
      return;
    }

    if (tokenBalance !== null && amount > tokenBalance) {
      showNotification('error', 'Insufficient balance');
      return;
    }

    const res = await stakeTokens(amount, selectedPeriodIndex);

    if (res.success) {
      setStakeAmount('');
      showNotification('success', `Staked ${amount} zkRUNE for ${LOCK_PERIODS[selectedPeriodIndex].label}`);
      fetchTokenBalance();
    } else {
      showNotification('error', res.error || 'Staking failed');
    }
  }

  async function handleClaim() {
    const res = await claimRewards();
    if (res.success) {
      showNotification('success', 'Rewards claimed successfully');
      fetchTokenBalance();
    } else {
      showNotification('error', res.error || 'Claim failed');
    }
  }

  async function handleUnstake() {
    const timeInfo = getTimeUntilUnlock();

    if (timeInfo && !timeInfo.isUnlocked) {
      const confirmed = confirm(
        `Your stake is locked for ${timeInfo.days}d ${timeInfo.hours}h more.\n\nEarly withdrawal will result in a 50% penalty.\n\nContinue?`
      );
      if (!confirmed) return;
    }

    const res = await unstakeTokens();
    if (res.success) {
      showNotification('success', 'Unstaked successfully');
      setActiveTab('stake');
      fetchTokenBalance();
    } else {
      showNotification('error', res.error || 'Unstake failed');
    }
  }

  function handleFaucetRequest() {
    if (!publicKey) return;
    
    // Copy wallet address to clipboard
    navigator.clipboard.writeText(publicKey.toString());
    showNotification('success', 'Wallet address copied! Share on Twitter/Discord to receive test tokens.');
    
    // Open Twitter with pre-filled message
    const tweetText = encodeURIComponent(
      `@zkaborr I need test zkRUNE tokens for staking on devnet!\n\nMy wallet: ${publicKey.toString()}\n\n#zkRune #Solana`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  }

  const timeUntilUnlock = getTimeUntilUnlock();
  const selectedPeriod = LOCK_PERIODS[selectedPeriodIndex];
  const baseApy = poolState?.baseApyBps ? poolState.baseApyBps / 100 : 12;

  const estimatedDaily = stakeAmount
    ? (parseFloat(stakeAmount) * (baseApy * selectedPeriod.multiplier) / 100) / 365
    : 0;
  const estimatedYearly = stakeAmount
    ? parseFloat(stakeAmount) * (baseApy * selectedPeriod.multiplier) / 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FFA3]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6B4CFF]/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFA3] to-[#6B4CFF] flex items-center justify-center">
              <span className="text-black font-bold text-sm">zk</span>
            </div>
            <span className="text-xl font-bold text-white">zkRune</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/marketplace" className="text-gray-400 hover:text-white transition text-sm">
                Marketplace
              </Link>
              <Link href="/governance" className="text-gray-400 hover:text-white transition text-sm">
                Governance
              </Link>
              <Link href="/docs" className="text-gray-400 hover:text-white transition text-sm">
                Docs
              </Link>
            </nav>
            <WalletMultiButton className="!bg-gradient-to-r !from-[#6B4CFF] !to-[#8B6CFF] hover:!opacity-90 !rounded-xl !h-10 !text-sm !font-medium" />
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-xl border backdrop-blur-xl shadow-2xl animate-slide-in ${
          notification.type === 'success' 
            ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30 text-[#00FFA3]' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <p className="font-medium">{notification.message}</p>
          {result && 'explorerUrl' in result && result.explorerUrl && (
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs opacity-70 hover:opacity-100 underline mt-1 block"
            >
              View transaction
            </a>
          )}
        </div>
      )}

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[#00FFA3] text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
            Devnet - Test Environment
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stake <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#6B4CFF]">zkRUNE</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Earn up to {(baseApy * 3).toFixed(0)}% APY by staking your tokens on-chain
          </p>
        </div>

        {/* Test Guide & Faucet Section */}
        {showTestGuide && (
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6B4CFF]/20 via-[#00FFA3]/20 to-[#6B4CFF]/20 rounded-3xl blur-xl" />
            <div className="relative bg-[#0d0d15]/90 border border-white/10 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B4CFF] to-[#00FFA3] flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">How to Test Staking</h3>
                    <p className="text-sm text-gray-400">Get started in 3 simple steps</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTestGuide(false)}
                  className="text-gray-500 hover:text-white transition p-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Step 1 */}
                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6B4CFF]/20 border border-[#6B4CFF]/30 flex items-center justify-center text-[#6B4CFF] font-bold text-sm group-hover:bg-[#6B4CFF]/30 transition">
                        1
                      </div>
                      <h4 className="text-white font-medium">Switch to Devnet</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed pl-11">
                      Open your Solana wallet (Phantom, Solflare) and switch network to <span className="text-white font-medium">Devnet</span> in settings.
                    </p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#00FFA3]/20 border border-[#00FFA3]/30 flex items-center justify-center text-[#00FFA3] font-bold text-sm group-hover:bg-[#00FFA3]/30 transition">
                        2
                      </div>
                      <h4 className="text-white font-medium">Get Test Tokens</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed pl-11">
                      Connect wallet and click the <span className="text-[#00FFA3] font-medium">Faucet</span> button below to receive free test zkRUNE tokens.
                    </p>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm group-hover:bg-purple-500/30 transition">
                        3
                      </div>
                      <h4 className="text-white font-medium">Start Staking</h4>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed pl-11">
                      Choose a lock period and stake amount. <span className="text-orange-400">Lock times are shortened to seconds</span> for easy testing.
                    </p>
                  </div>
                </div>
                
                {/* Faucet Section */}
                <div className="bg-gradient-to-r from-[#00FFA3]/5 to-[#6B4CFF]/5 border border-white/5 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FFA3] to-[#00DD8C] flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-semibold">Test Token Faucet</div>
                        <div className="text-gray-400 text-sm">
                          {connected 
                            ? tokenBalance !== null 
                              ? `Your balance: ${formatTokenAmount(tokenBalance)} zkRUNE`
                              : 'Loading balance...'
                            : 'Connect wallet to claim tokens'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {connected ? (
                      <button
                        onClick={handleFaucetRequest}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#00FFA3] to-[#00DD8C] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00FFA3]/20 transition-all flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Request Test Tokens
                      </button>
                    ) : (
                      <WalletMultiButton className="!bg-gradient-to-r !from-[#6B4CFF] !to-[#8B6CFF] hover:!opacity-90 !rounded-xl !h-12 !px-6 !text-sm !font-semibold" />
                    )}
                  </div>
                  
                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
                    <span>No real value</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>Devnet only</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>Rate limited</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <a 
                      href="https://faucet.solana.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#00FFA3] hover:underline"
                    >
                      Need Devnet SOL?
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Test Guide Toggle */}
        {!showTestGuide && (
          <button
            onClick={() => setShowTestGuide(true)}
            className="mb-8 mx-auto flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Show Testing Guide
          </button>
        )}

        {/* Stats Grid */}
        {poolState && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Staked', value: formatTokenAmount(poolState.totalStaked), color: 'text-white' },
              { label: 'Stakers', value: poolState.totalStakers.toString(), color: 'text-[#00FFA3]' },
              { label: 'Reward Pool', value: formatTokenAmount(poolState.rewardPoolBalance), color: 'text-blue-400' },
              { label: 'Distributed', value: formatTokenAmount(poolState.totalRewardsDistributed), color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center hover:bg-white/[0.04] transition">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet Balance Card */}
        {connected && (
          <div className="bg-gradient-to-r from-[#6B4CFF]/10 to-[#00FFA3]/10 border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Your Balance</div>
                <div className="text-3xl font-bold text-white">
                  {tokenBalance !== null ? formatTokenAmount(tokenBalance) : '...'} <span className="text-lg text-gray-400">zkRUNE</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-gray-500">Token (Devnet)</div>
                  <div className="text-xs text-gray-400 font-mono">{DEVNET_TOKEN_MINT.slice(0, 8)}...</div>
                </div>
                <a
                  href={`https://solscan.io/token/${DEVNET_TOKEN_MINT}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition"
                >
                  View Token
                </a>
              </div>
            </div>
            {userStake?.isActive && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Staked</div>
                  <div className="text-lg font-semibold text-white">{formatTokenAmount(userStake.amount)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Pending Rewards</div>
                  <div className="text-lg font-semibold text-[#00FFA3]">{formatTokenAmount(userStake.pendingRewards)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Lock Status</div>
                  <div className={`text-lg font-semibold ${timeUntilUnlock?.isUnlocked ? 'text-[#00FFA3]' : 'text-orange-400'}`}>
                    {timeUntilUnlock?.isUnlocked ? 'Unlocked' : formatTimeRemaining(timeUntilUnlock?.days || 0, timeUntilUnlock?.hours || 0, timeUntilUnlock?.minutes || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Your APY</div>
                  <div className="text-lg font-semibold text-purple-400">
                    {(baseApy * LOCK_PERIODS[userStake.lockPeriodIndex].multiplier).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Stake/Position */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('stake')}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeTab === 'stake'
                    ? 'bg-gradient-to-r from-[#00FFA3] to-[#00DD8C] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Stake
              </button>
              <button
                onClick={() => setActiveTab('position')}
                disabled={!userStake?.isActive}
                className={`px-5 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeTab === 'position'
                    ? 'bg-gradient-to-r from-[#00FFA3] to-[#00DD8C] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                My Position
              </button>
            </div>

            {activeTab === 'stake' ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                {!connected ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                      </svg>
                    </div>
                    <p className="text-gray-400 mb-4">Connect your wallet to start staking</p>
                    <WalletMultiButton className="!bg-gradient-to-r !from-[#6B4CFF] !to-[#8B6CFF] !rounded-xl" />
                  </div>
                ) : userStake?.isActive ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">You have an active stake position</p>
                    <button
                      onClick={() => setActiveTab('position')}
                      className="px-6 py-3 bg-gradient-to-r from-[#6B4CFF] to-[#8B6CFF] text-white font-medium rounded-xl hover:opacity-90 transition"
                    >
                      View Position
                    </button>
                  </div>
                ) : programReady === false ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Staking pool is not initialized yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-400">Amount</label>
                        {tokenBalance !== null && (
                          <button 
                            onClick={() => setStakeAmount(tokenBalance.toString())}
                            className="text-xs text-[#00FFA3] hover:underline"
                          >
                            Max: {formatTokenAmount(tokenBalance)}
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-xl font-medium focus:border-[#00FFA3]/50 focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/20 transition"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">zkRUNE</span>
                      </div>
                    </div>

                    {/* Lock Period Selection */}
                    <div>
                      <label className="text-sm text-gray-400 mb-3 block">Lock Period</label>
                      <div className="grid grid-cols-2 gap-3">
                        {LOCK_PERIODS.map((period, index) => (
                          <button
                            key={period.days}
                            onClick={() => setSelectedPeriodIndex(index)}
                            className={`relative p-4 rounded-xl border transition overflow-hidden ${
                              selectedPeriodIndex === index
                                ? 'border-[#00FFA3]/50 bg-[#00FFA3]/5'
                                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                            }`}
                          >
                            {selectedPeriodIndex === index && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00FFA3]" />
                            )}
                            <div className="text-white font-semibold">{period.label}</div>
                            <div className="text-[#00FFA3] text-xl font-bold mt-1">
                              {(baseApy * period.multiplier).toFixed(0)}%
                            </div>
                            <div className="text-gray-500 text-xs mt-1">{period.multiplier}x multiplier</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Estimate */}
                    {stakeAmount && parseFloat(stakeAmount) > 0 && (
                      <div className="bg-white/[0.02] rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Daily earnings</span>
                          <span className="text-white font-medium">~{formatTokenAmount(estimatedDaily)} zkRUNE</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Yearly earnings</span>
                          <span className="text-[#00FFA3] font-semibold">~{formatTokenAmount(estimatedYearly)} zkRUNE</span>
                        </div>
                      </div>
                    )}

                    {/* Stake Button */}
                    <button
                      onClick={handleStake}
                      disabled={isStaking || !stakeAmount || isLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#00FFA3] to-[#00DD8C] text-black font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {isStaking ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Staking...
                        </span>
                      ) : 'Stake Now'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Position Tab */
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                {userStake && userStake.isActive ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Your Staked Amount</div>
                        <div className="text-3xl font-bold text-white">{formatTokenAmount(userStake.amount)} zkRUNE</div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        timeUntilUnlock?.isUnlocked 
                          ? 'bg-[#00FFA3]/10 text-[#00FFA3]' 
                          : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {timeUntilUnlock?.isUnlocked ? 'Unlocked' : `${formatTimeRemaining(timeUntilUnlock?.days || 0, timeUntilUnlock?.hours || 0, timeUntilUnlock?.minutes || 0)} left`}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.02] rounded-xl p-4">
                        <div className="text-sm text-gray-500 mb-1">Pending Rewards</div>
                        <div className="text-2xl font-bold text-[#00FFA3]">{formatTokenAmount(userStake.pendingRewards)}</div>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-4">
                        <div className="text-sm text-gray-500 mb-1">Total Claimed</div>
                        <div className="text-2xl font-bold text-blue-400">{formatTokenAmount(userStake.totalClaimed)}</div>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Lock Period</span>
                          <div className="text-white mt-1">{LOCK_PERIODS[userStake.lockPeriodIndex].label}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">APY</span>
                          <div className="text-[#00FFA3] mt-1 font-semibold">
                            {(baseApy * LOCK_PERIODS[userStake.lockPeriodIndex].multiplier).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Staked At</span>
                          <div className="text-white mt-1">{userStake.stakedAt.toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Unlocks At</span>
                          <div className="text-white mt-1">{userStake.unlocksAt.toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleClaim}
                        disabled={isClaiming || userStake.pendingRewards < 0.000001}
                        className="flex-1 py-3.5 bg-gradient-to-r from-[#00FFA3] to-[#00DD8C] text-black font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                      </button>
                      <button
                        onClick={handleUnstake}
                        disabled={isUnstaking}
                        className={`flex-1 py-3.5 font-semibold rounded-xl transition disabled:opacity-50 ${
                          timeUntilUnlock?.isUnlocked
                            ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                        }`}
                      >
                        {isUnstaking ? 'Unstaking...' : timeUntilUnlock?.isUnlocked ? 'Unstake' : 'Early Withdraw'}
                      </button>
                    </div>

                    {!timeUntilUnlock?.isUnlocked && (
                      <p className="text-center text-red-400/60 text-sm">
                        Early withdrawal incurs 50% penalty
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">No active position</p>
                    <button
                      onClick={() => setActiveTab('stake')}
                      className="px-6 py-3 bg-gradient-to-r from-[#00FFA3] to-[#00DD8C] text-black font-medium rounded-xl"
                    >
                      Start Staking
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* APY Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">APY Tiers</h3>
              <div className="space-y-3">
                {LOCK_PERIODS.map((period) => (
                  <div key={period.days} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <span className="text-white">{period.label}</span>
                      <span className="text-gray-500 text-sm ml-2">({period.multiplier}x)</span>
                    </div>
                    <span className="text-[#00FFA3] font-bold text-lg">{(baseApy * period.multiplier).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: '1', text: 'Choose amount and lock period' },
                  { step: '2', text: 'Longer locks = higher APY' },
                  { step: '3', text: 'Claim rewards anytime' },
                  { step: '4', text: 'Unstake after lock ends' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00FFA3]/10 text-[#00FFA3] flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <span className="text-gray-400 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    !
                  </div>
                  <span className="text-red-400/80 text-sm">Early withdrawal = 50% penalty</span>
                </div>
              </div>
            </div>

            {/* Contract Info */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contract Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Program ID</div>
                  <a 
                    href={`https://solscan.io/account/${programId.toString()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00FFA3] hover:underline font-mono text-xs break-all"
                  >
                    {programId.toString()}
                  </a>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Token</div>
                  <a 
                    href={`https://solscan.io/token/${DEVNET_TOKEN_MINT}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00FFA3] hover:underline font-mono text-xs break-all"
                  >
                    {DEVNET_TOKEN_MINT}
                  </a>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Network</div>
                  <span className="text-white">Solana Devnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8 text-center">
            <div className="animate-spin w-10 h-10 border-2 border-[#00FFA3] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

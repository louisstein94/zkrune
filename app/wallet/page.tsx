'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSolana } from '@/lib/hooks/useSolana';
import { SOLANA_NETWORK } from '@/components/ClientWalletProvider';
import { ZKRUNE_TOKEN_CONFIG, getExplorerUrl, getSolscanUrl } from '@/lib/solana/config';
import Navigation from '@/components/Navigation';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

interface RecentTransaction {
  signature: string;
  type: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  amount?: number;
}

export default function WalletPage() {
  const {
    connected,
    connecting,
    publicKey,
    walletAddress,
    solBalance,
    zkruneBalance,
    isLoadingBalances,
    refreshBalances,
    error,
  } = useSolana();

  const [recentTxs, setRecentTxs] = useState<RecentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview');

  // Format balance for display
  const formatBalance = (balance: number, decimals: number = 4): string => {
    if (balance === 0) return '0';
    if (balance < 0.0001) return '< 0.0001';
    return balance.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals 
    });
  };

  // Truncate address for display
  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
    }
  };

  return (
    <div className="min-h-screen bg-zk-dark">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Wallet Dashboard
          </h1>
          <p className="text-zk-gray text-lg max-w-2xl mx-auto">
            Manage your zkRUNE tokens, view balances, and track transactions.
          </p>
          
          {/* Network Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-zk-darker rounded-full border border-white/10">
            <span className={`w-2 h-2 rounded-full ${
              SOLANA_NETWORK === 'mainnet-beta' ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            <span className="text-sm text-zk-gray">
              {SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : SOLANA_NETWORK}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {!connected ? (
          /* Not Connected State */
          <div className="bg-zk-darker border border-white/10 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-zk-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-zk-gray mb-6 max-w-md mx-auto">
              Connect your Solana wallet to view your zkRUNE balance and manage your tokens.
            </p>
            <WalletMultiButton className="!bg-zk-primary !text-zk-dark hover:!bg-zk-primary/90" />
          </div>
        ) : (
          /* Connected State */
          <>
            {/* Balance Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* zkRUNE Balance */}
              <div className="bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <span className="text-purple-400 font-bold">zk</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{ZKRUNE_TOKEN_CONFIG.SYMBOL}</div>
                      <div className="text-sm text-zk-gray">{ZKRUNE_TOKEN_CONFIG.NAME}</div>
                    </div>
                  </div>
                  <button 
                    onClick={refreshBalances}
                    disabled={isLoadingBalances}
                    className="p-2 hover:bg-white/5 rounded-lg transition"
                  >
                    <svg className={`w-5 h-5 text-zk-gray ${isLoadingBalances ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {isLoadingBalances ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    formatBalance(zkruneBalance?.uiAmount || 0, 2)
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Link
                    href={`https://pump.fun/coin/${ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS}`}
                    target="_blank"
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Buy on Pump.fun →
                  </Link>
                </div>
              </div>

              {/* SOL Balance */}
              <div className="bg-gradient-to-br from-green-500/20 to-transparent border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-bold">◎</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">SOL</div>
                    <div className="text-sm text-zk-gray">Solana</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {isLoadingBalances ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    formatBalance(solBalance, 4)
                  )}
                </div>
              </div>

              {/* Wallet Info */}
              <div className="bg-zk-darker border border-white/10 rounded-xl p-6">
                <div className="text-sm text-zk-gray mb-2">Connected Wallet</div>
                <div className="flex items-center gap-2 mb-4">
                  <code className="text-white font-mono text-sm">
                    {truncateAddress(walletAddress || '')}
                  </code>
                  <button 
                    onClick={copyAddress}
                    className="p-1 hover:bg-white/5 rounded transition"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4 text-zk-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  <a
                    href={getSolscanUrl(walletAddress || '', 'account')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zk-gray hover:text-white transition"
                  >
                    Solscan →
                  </a>
                  <a
                    href={getExplorerUrl(walletAddress || '', 'address')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zk-gray hover:text-white transition"
                  >
                    Explorer →
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link
                href="/templates"
                className="bg-zk-darker border border-white/10 rounded-xl p-6 hover:border-zk-primary/50 transition group"
              >
                <div className="w-12 h-12 bg-zk-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-zk-primary/20 transition">
                  <svg className="w-6 h-6 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-white font-medium mb-1">Generate Proof</div>
                <div className="text-sm text-zk-gray">Create ZK proofs</div>
              </Link>

              <Link
                href="/premium"
                className="bg-zk-darker border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition group"
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div className="text-white font-medium mb-1">Burn & Upgrade</div>
                <div className="text-sm text-zk-gray">Premium features</div>
              </Link>

              <Link
                href="/staking"
                className="bg-zk-darker border border-white/10 rounded-xl p-6 hover:border-yellow-500/50 transition group"
              >
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-white font-medium mb-1">Staking</div>
                <div className="text-sm text-zk-gray">Earn rewards</div>
              </Link>

              <Link
                href="/governance"
                className="bg-zk-darker border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition group"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <div className="text-white font-medium mb-1">Governance</div>
                <div className="text-sm text-zk-gray">Vote on proposals</div>
              </Link>
            </div>

            {/* Token Info */}
            <div className="bg-zk-darker border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Token Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-zk-gray mb-1">Token Address</div>
                  <code className="text-white text-sm font-mono break-all">
                    {ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-zk-gray mb-1">Decimals</div>
                  <div className="text-white">{ZKRUNE_TOKEN_CONFIG.DECIMALS}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <a
                  href={`https://solscan.io/token/${ZKRUNE_TOKEN_CONFIG.MINT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zk-primary hover:text-zk-primary/80 transition text-sm"
                >
                  View on Solscan →
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

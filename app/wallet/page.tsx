'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);
import { ZKRUNE_TOKEN, formatTokenAmount } from '@/lib/token/config';
import { getUserPremiumStatus } from '@/lib/token/burn';
import { getUserStakingInfo } from '@/lib/token/staking';

interface WalletBalance {
  zkrune: number;
  sol: number;
  zcash: number;
}

interface GaslessProof {
  id: string;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  txSignature?: string;
}

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<WalletBalance>({ zkrune: 0, sol: 0, zcash: 0 });
  const [recentProofs, setRecentProofs] = useState<GaslessProof[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'gasless' | 'bridge'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      loadWalletData();
    }
  }, [connected, publicKey]);

  function loadWalletData() {
    // Demo balances - in production would fetch from RPC
    setBalance({
      zkrune: 5000,
      sol: 2.5,
      zcash: 0.75,
    });

    // Demo recent proofs
    setRecentProofs([
      {
        id: 'proof_1',
        type: 'Age Verification',
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        txSignature: 'abc123...',
      },
      {
        id: 'proof_2',
        type: 'Balance Proof',
        status: 'completed',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        txSignature: 'def456...',
      },
    ]);
  }

  const premiumStatus = getUserPremiumStatus(publicKey?.toBase58());
  const stakingInfo = publicKey ? getUserStakingInfo(publicKey.toBase58()) : null;
  const hasGaslessAccess = premiumStatus.tier === 'PRO' || premiumStatus.tier === 'ENTERPRISE';

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
            <Link href="/staking" className="text-gray-400 hover:text-white transition">
              Staking
            </Link>
            <WalletMultiButton className="!bg-[#6B4CFF] hover:!bg-[#5a3de6]" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Mobile ZK Wallet
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your unified wallet for zkRune, Solana, and Zcash. Generate gasless proofs 
            and bridge assets between chains.
          </p>
        </div>

        {!connected ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <div className="text-6xl mb-6">wallet</div>
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your Solana wallet to access the zkRune Mobile Wallet features
            </p>
            <WalletMultiButton className="!bg-[#6B4CFF] hover:!bg-[#5a3de6]" />
          </div>
        ) : (
          <>
            {/* Wallet Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#6B4CFF]/20 to-transparent border border-[#6B4CFF]/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#6B4CFF]/20 rounded-full flex items-center justify-center text-[#6B4CFF]">
                    zk
                  </div>
                  <div className="text-gray-400">zkRUNE</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {formatTokenAmount(balance.zkrune)}
                </div>
                <div className="text-gray-500 text-sm">
                  + {formatTokenAmount(stakingInfo?.totalStaked || 0)} staked
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#00FFA3]/20 to-transparent border border-[#00FFA3]/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#00FFA3]/20 rounded-full flex items-center justify-center text-[#00FFA3]">
                    SOL
                  </div>
                  <div className="text-gray-400">Solana</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {balance.sol.toFixed(4)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400">
                    ZEC
                  </div>
                  <div className="text-gray-400">Zcash</div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {balance.zcash.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`mb-8 p-4 rounded-xl border ${
              hasGaslessAccess
                ? 'bg-[#00FFA3]/10 border-[#00FFA3]/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${hasGaslessAccess ? 'bg-[#00FFA3]' : 'bg-gray-500'}`} />
                    <span className="text-white font-medium">
                      {hasGaslessAccess ? 'Gasless Proofs Active' : 'Gasless Proofs Locked'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {hasGaslessAccess
                      ? 'Generate ZK proofs without paying gas fees'
                      : 'Upgrade to Pro tier to unlock gasless proof generation'}
                  </p>
                </div>
                {!hasGaslessAccess && (
                  <Link
                    href="/premium"
                    className="px-4 py-2 bg-[#6B4CFF] text-white font-medium rounded-lg hover:bg-[#5a3de6] transition"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === 'overview'
                    ? 'bg-[#00FFA3] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('gasless')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === 'gasless'
                    ? 'bg-[#00FFA3] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Gasless Proofs
              </button>
              <button
                onClick={() => setActiveTab('bridge')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === 'bridge'
                    ? 'bg-[#00FFA3] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Zcash Bridge
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Account Info */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Address</div>
                      <div className="font-mono text-white text-sm break-all">
                        {publicKey?.toBase58()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Premium Tier</div>
                      <div className="text-white flex items-center gap-2">
                        {premiumStatus.tier}
                        {premiumStatus.tier !== 'FREE' && (
                          <span className="px-2 py-0.5 bg-[#00FFA3]/20 text-[#00FFA3] text-xs rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Total Burned</div>
                      <div className="text-[#00FFA3] font-semibold">
                        {formatTokenAmount(premiumStatus.totalBurned)} zkRUNE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Proofs</h3>
                  {recentProofs.length === 0 ? (
                    <p className="text-gray-400">No recent proofs</p>
                  ) : (
                    <div className="space-y-3">
                      {recentProofs.map((proof) => (
                        <div
                          key={proof.id}
                          className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                        >
                          <div>
                            <div className="text-white">{proof.type}</div>
                            <div className="text-sm text-gray-400">
                              {proof.timestamp.toLocaleString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${
                            proof.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : proof.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {proof.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
                  <Link
                    href="/templates"
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#00FFA3]/50 transition text-center"
                  >
                    <div className="text-3xl mb-3">proof</div>
                    <div className="text-white font-medium">Generate Proof</div>
                    <div className="text-gray-400 text-sm">Create new ZK proof</div>
                  </Link>
                  <Link
                    href="/staking"
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#6B4CFF]/50 transition text-center"
                  >
                    <div className="text-3xl mb-3">stake</div>
                    <div className="text-white font-medium">Stake Tokens</div>
                    <div className="text-gray-400 text-sm">Earn up to 36% APY</div>
                  </Link>
                  <Link
                    href="/governance"
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition text-center"
                  >
                    <div className="text-3xl mb-3">vote</div>
                    <div className="text-white font-medium">Governance</div>
                    <div className="text-gray-400 text-sm">Vote on proposals</div>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'gasless' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Gasless Proof Generation</h3>
                
                {hasGaslessAccess ? (
                  <div className="space-y-6">
                    <p className="text-gray-400">
                      Generate ZK proofs without paying gas fees. Your proofs are sponsored by 
                      the zkRune relayer network.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Proofs Available</div>
                        <div className="text-2xl font-bold text-white">Unlimited</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Gas Saved</div>
                        <div className="text-2xl font-bold text-[#00FFA3]">0.125 SOL</div>
                      </div>
                    </div>

                    <Link
                      href="/templates"
                      className="inline-block px-6 py-3 bg-[#00FFA3] text-black font-semibold rounded-lg hover:bg-[#00cc82] transition"
                    >
                      Generate Gasless Proof
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4 opacity-50">lock</div>
                    <h4 className="text-xl font-semibold text-white mb-2">Pro Feature</h4>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Gasless proof generation is available for Pro and Enterprise tier members. 
                      Burn 500 zkRUNE to unlock.
                    </p>
                    <Link
                      href="/premium"
                      className="inline-block px-6 py-3 bg-[#6B4CFF] text-white font-semibold rounded-lg hover:bg-[#5a3de6] transition"
                    >
                      Upgrade to Pro
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bridge' && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Zcash Bridge</h3>
                
                <div className="text-center py-8">
                  <div className="flex justify-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 text-2xl mx-auto mb-2">
                        ZEC
                      </div>
                      <div className="text-white">Zcash</div>
                    </div>
                    <div className="flex items-center text-gray-500 text-2xl">
                      bridge
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#00FFA3]/20 rounded-full flex items-center justify-center text-[#00FFA3] text-2xl mx-auto mb-2">
                        SOL
                      </div>
                      <div className="text-white">Solana</div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto mb-6">
                    <div className="text-yellow-400 font-medium mb-1">Coming Soon</div>
                    <p className="text-gray-400 text-sm">
                      Bridge assets between Zcash and Solana with zero-knowledge proofs 
                      for privacy-preserving cross-chain transfers.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-[#00FFA3] font-medium mb-1">Privacy</div>
                      <p className="text-gray-400">Shielded transfers between chains</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-[#6B4CFF] font-medium mb-1">Fast</div>
                      <p className="text-gray-400">Optimistic bridging with ZK fallback</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-orange-400 font-medium mb-1">Secure</div>
                      <p className="text-gray-400">Verified by ZK proofs</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}


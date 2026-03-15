'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMarketplace, type MarketplaceTemplate } from '@/lib/hooks/useMarketplace';
import { useMarketplacePurchase, type PurchaseStage } from '@/lib/hooks/useMarketplacePurchase';
import { MARKETPLACE_CONFIG, type MarketplaceCategory, formatTokenAmount } from '@/lib/token/config';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const STAGE_LABELS: Record<PurchaseStage, string> = {
  idle: '',
  'building-tx': 'Building transaction...',
  'awaiting-signature': 'Approve in wallet...',
  confirming: 'Confirming on-chain...',
  recording: 'Recording purchase...',
  complete: 'Purchase complete!',
  error: 'Purchase failed',
};

export default function MarketplacePage() {
  const { publicKey, connected } = useWallet();
  const {
    templates,
    isLoading,
    error,
    fetchTemplates,
    isTemplateOwned,
    getStats,
    featuredTemplates,
  } = useMarketplace();
  const purchaseFlow = useMarketplacePurchase();

  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownedMap, setOwnedMap] = useState<Record<string, boolean>>({});
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const stats = getStats();

  useEffect(() => {
    fetchTemplates({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchQuery || undefined,
    });
  }, [selectedCategory, searchQuery, fetchTemplates]);

  useEffect(() => {
    if (!publicKey || templates.length === 0) return;
    const addr = publicKey.toBase58();
    Promise.all(
      templates.map(async (t) => {
        const owned = await isTemplateOwned(t.id, addr);
        return [t.id, owned] as const;
      })
    ).then((entries) => {
      setOwnedMap(Object.fromEntries(entries));
    });
  }, [publicKey, templates, isTemplateOwned]);

  const handlePurchase = useCallback(async (template: MarketplaceTemplate) => {
    if (!publicKey) return;
    setPurchasingId(template.id);
    purchaseFlow.reset();

    const result = await purchaseFlow.purchase(
      template.id,
      template.creator_address,
      template.price,
    );

    if (result.success) {
      setOwnedMap((prev) => ({ ...prev, [template.id]: true }));
      await fetchTemplates({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
      });
    }

    setTimeout(() => {
      setPurchasingId(null);
      purchaseFlow.reset();
    }, 3000);
  }, [publicKey, purchaseFlow, fetchTemplates, selectedCategory, searchQuery]);

  const showFeatured = selectedCategory === 'all' && !searchQuery && featuredTemplates.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#6366F1]">
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
            <WalletMultiButton className="!bg-[#6366F1] hover:!bg-[#5b4bd4] !text-white" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Template Marketplace</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover and purchase premium ZK circuit templates from community creators.
            Creators earn {MARKETPLACE_CONFIG.CREATOR_SHARE}% of every sale.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalTemplates}</div>
              <div className="text-gray-400 text-sm">Templates</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#6366F1]">{stats.totalCreators}</div>
              <div className="text-gray-400 text-sm">Creators</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalSales}</div>
              <div className="text-gray-400 text-sm">Sales</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400">
                {formatTokenAmount(stats.totalVolume)}
              </div>
              <div className="text-gray-400 text-sm">Volume (zkRUNE)</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {purchasingId && purchaseFlow.stage !== 'idle' && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${
            purchaseFlow.stage === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : purchaseFlow.stage === 'complete'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#6366F1]'
          }`}>
            {STAGE_LABELS[purchaseFlow.stage]}
            {purchaseFlow.error && ` — ${purchaseFlow.error}`}
          </div>
        )}

        {showFeatured && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Templates</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredTemplates.slice(0, 2).map((template) => (
                <FeaturedTemplateCard
                  key={template.id}
                  template={template}
                  isOwned={ownedMap[template.id] ?? false}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasingId === template.id && purchaseFlow.stage !== 'idle' && purchaseFlow.stage !== 'complete' && purchaseFlow.stage !== 'error'}
                  connected={connected}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#6366F1] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === 'all'
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {MARKETPLACE_CONFIG.CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  selectedCategory === category
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <div className="animate-spin w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading templates...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400">No templates found</p>
              </div>
            ) : (
              templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isOwned={ownedMap[template.id] ?? false}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasingId === template.id && purchaseFlow.stage !== 'idle' && purchaseFlow.stage !== 'complete' && purchaseFlow.stage !== 'error'}
                  connected={connected}
                />
              ))
            )}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-white/10 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Become a Creator</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Share your ZK circuit templates and earn {MARKETPLACE_CONFIG.CREATOR_SHARE}%
            of every sale. Build once, earn forever.
          </p>
          <Link
            href="/builder"
            className="inline-block px-8 py-3 bg-[#6366F1] text-white font-semibold rounded-lg hover:bg-[#5b4bd4] transition"
          >
            Create Template
          </Link>
        </div>
      </main>
    </div>
  );
}

function FeaturedTemplateCard({
  template,
  isOwned,
  onPurchase,
  isPurchasing,
  connected,
}: {
  template: MarketplaceTemplate;
  isOwned: boolean;
  onPurchase: (t: MarketplaceTemplate) => void;
  isPurchasing: boolean;
  connected: boolean;
}) {
  return (
    <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-4 right-4 px-3 py-1 bg-[#6366F1] text-white text-xs font-bold rounded-full">
        FEATURED
      </div>

      <div className="flex items-start gap-3 mb-4">
        <span className="px-2 py-1 text-xs font-medium bg-white/10 text-gray-300 rounded capitalize">
          {template.category}
        </span>
        {template.verified && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
            VERIFIED
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-emerald-400">star</span>
          <span className="text-white">{template.rating.toFixed(1)}</span>
          <span className="text-gray-500">({template.rating_count})</span>
        </div>
        <div className="text-gray-400">{template.downloads} downloads</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-[#6366F1]">
            {formatTokenAmount(template.price)}
          </span>
          <span className="text-gray-400 ml-1">zkRUNE</span>
        </div>

        {isOwned ? (
          <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">
            Owned
          </span>
        ) : connected ? (
          <button
            onClick={() => onPurchase(template)}
            disabled={isPurchasing}
            className="px-6 py-2 bg-[#6366F1] text-white font-medium rounded-lg hover:bg-[#5b4bd4] transition disabled:opacity-50"
          >
            {isPurchasing ? 'Processing...' : 'Purchase'}
          </button>
        ) : (
          <span className="text-gray-500 text-sm">Connect wallet</span>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isOwned,
  onPurchase,
  isPurchasing,
  connected,
}: {
  template: MarketplaceTemplate;
  isOwned: boolean;
  onPurchase: (t: MarketplaceTemplate) => void;
  isPurchasing: boolean;
  connected: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
      <div className="flex items-start gap-2 mb-3">
        <span className="px-2 py-1 text-xs font-medium bg-white/10 text-gray-300 rounded capitalize">
          {template.category}
        </span>
        {template.verified && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
            VERIFIED
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-emerald-400">star</span>
          <span className="text-white">{template.rating.toFixed(1)}</span>
        </div>
        <div className="text-gray-400">{template.downloads} downloads</div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          <span className="text-xl font-bold text-[#6366F1]">
            {formatTokenAmount(template.price)}
          </span>
          <span className="text-gray-400 ml-1 text-sm">zkRUNE</span>
        </div>

        {isOwned ? (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
            Owned
          </span>
        ) : connected ? (
          <button
            onClick={() => onPurchase(template)}
            disabled={isPurchasing}
            className="px-4 py-2 bg-[#6366F1] text-white text-sm font-medium rounded-lg hover:bg-[#5b4bd4] transition disabled:opacity-50"
          >
            {isPurchasing ? 'Processing...' : 'Buy'}
          </button>
        ) : (
          <span className="text-gray-500 text-xs">Connect wallet</span>
        )}
      </div>
    </div>
  );
}

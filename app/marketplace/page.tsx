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
  getMarketplaceTemplates,
  getFeaturedTemplates,
  getTemplatesByCategory,
  searchTemplates,
  purchaseTemplate,
  isTemplateOwned,
  getMarketplaceStats,
  type MarketplaceTemplate,
} from '@/lib/token/marketplace';
import { MARKETPLACE_CONFIG, type MarketplaceCategory, formatTokenAmount } from '@/lib/token/config';

export default function MarketplacePage() {
  const { publicKey, connected } = useWallet();
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<ReturnType<typeof getMarketplaceStats> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
    setStats(getMarketplaceStats());
  }, [selectedCategory, searchQuery]);

  function loadTemplates() {
    let result: MarketplaceTemplate[];
    
    if (searchQuery) {
      result = searchTemplates(searchQuery);
    } else if (selectedCategory === 'all') {
      result = getMarketplaceTemplates();
    } else {
      result = getTemplatesByCategory(selectedCategory);
    }
    
    setTemplates(result);
  }

  async function handlePurchase(templateId: string) {
    if (!publicKey) return;

    setIsLoading(true);
    
    // Simulate purchase delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = purchaseTemplate(templateId, publicKey.toBase58());
    
    if (result.success) {
      loadTemplates();
      alert('Template purchased successfully!');
    } else {
      alert(result.error || 'Purchase failed');
    }
    
    setIsLoading(false);
  }

  const featuredTemplates = getFeaturedTemplates();

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
            Template Marketplace
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover and purchase premium ZK circuit templates from community creators. 
            Creators earn {MARKETPLACE_CONFIG.CREATOR_SHARE}% of every sale.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalTemplates}</div>
              <div className="text-gray-400 text-sm">Templates</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#00FFA3]">{stats.totalCreators}</div>
              <div className="text-gray-400 text-sm">Creators</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalSales}</div>
              <div className="text-gray-400 text-sm">Sales</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatTokenAmount(stats.totalVolume)}
              </div>
              <div className="text-gray-400 text-sm">Volume (zkRUNE)</div>
            </div>
          </div>
        )}

        {/* Featured Templates */}
        {featuredTemplates.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Templates</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredTemplates.slice(0, 2).map((template) => (
                <FeaturedTemplateCard
                  key={template.id}
                  template={template}
                  isOwned={publicKey ? isTemplateOwned(template.id, publicKey.toBase58()) : false}
                  onPurchase={handlePurchase}
                  isLoading={isLoading}
                  connected={connected}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === 'all'
                  ? 'bg-[#00FFA3] text-black'
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
                    ? 'bg-[#00FFA3] text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
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
                isOwned={publicKey ? isTemplateOwned(template.id, publicKey.toBase58()) : false}
                onPurchase={handlePurchase}
                isLoading={isLoading}
                connected={connected}
              />
            ))
          )}
        </div>

        {/* Become a Creator */}
        <div className="mt-12 bg-gradient-to-r from-[#6B4CFF]/20 to-[#00FFA3]/20 border border-white/10 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Become a Creator</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Share your ZK circuit templates and earn {MARKETPLACE_CONFIG.CREATOR_SHARE}% 
            of every sale. Build once, earn forever.
          </p>
          <Link
            href="/builder"
            className="inline-block px-8 py-3 bg-[#6B4CFF] text-white font-semibold rounded-lg hover:bg-[#5a3de6] transition"
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
  isLoading,
  connected,
}: {
  template: MarketplaceTemplate;
  isOwned: boolean;
  onPurchase: (id: string) => void;
  isLoading: boolean;
  connected: boolean;
}) {
  return (
    <div className="bg-gradient-to-br from-[#6B4CFF]/10 to-[#00FFA3]/10 border border-[#6B4CFF]/30 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-4 right-4 px-3 py-1 bg-[#00FFA3] text-black text-xs font-bold rounded-full">
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
          <span className="text-yellow-400">star</span>
          <span className="text-white">{template.rating.toFixed(1)}</span>
          <span className="text-gray-500">({template.ratingCount})</span>
        </div>
        <div className="text-gray-400">{template.downloads} downloads</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-[#00FFA3]">
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
            onClick={() => onPurchase(template.id)}
            disabled={isLoading}
            className="px-6 py-2 bg-[#6B4CFF] text-white font-medium rounded-lg hover:bg-[#5a3de6] transition disabled:opacity-50"
          >
            Purchase
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
  isLoading,
  connected,
}: {
  template: MarketplaceTemplate;
  isOwned: boolean;
  onPurchase: (id: string) => void;
  isLoading: boolean;
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
          <span className="text-yellow-400">star</span>
          <span className="text-white">{template.rating.toFixed(1)}</span>
        </div>
        <div className="text-gray-400">{template.downloads} downloads</div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          <span className="text-xl font-bold text-[#00FFA3]">
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
            onClick={() => onPurchase(template.id)}
            disabled={isLoading}
            className="px-4 py-2 bg-[#6B4CFF] text-white text-sm font-medium rounded-lg hover:bg-[#5a3de6] transition disabled:opacity-50"
          >
            Buy
          </button>
        ) : (
          <span className="text-gray-500 text-xs">Connect wallet</span>
        )}
      </div>
    </div>
  );
}


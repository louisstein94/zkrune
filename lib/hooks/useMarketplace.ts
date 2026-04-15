import { useState, useEffect, useCallback, useMemo } from 'react';

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  creator: string;
  creator_address: string;
  price: number;
  category: string;
  circuit_code: string;
  nodes?: any;
  edges?: any;
  created_at: string;
  updated_at: string;
  downloads: number;
  rating: number;
  rating_count: number;
  featured: boolean;
  verified: boolean;
  tags: string[];
}

export interface Purchase {
  id: string;
  template_id: string;
  buyer: string;
  seller: string;
  price: number;
  platform_fee: number;
  creator_revenue: number;
  transaction_signature?: string;
  created_at: string;
}

export interface MarketplaceStats {
  totalTemplates: number;
  totalCreators: number;
  totalSales: number;
  totalVolume: number;
}

export function useMarketplace() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (options?: {
    category?: string;
    featured?: boolean;
    creator?: string;
    search?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.category) params.set('category', options.category);
      if (options?.featured) params.set('featured', 'true');
      if (options?.creator) params.set('creator', options.creator);
      if (options?.search) params.set('search', options.search);

      const response = await fetch(`/api/marketplace/templates?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data);
      } else {
        setError(data.error || 'Failed to fetch templates');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTemplate = useCallback((id: string): MarketplaceTemplate | undefined => {
    return templates.find(t => t.id === id);
  }, [templates]);

  const listTemplate = useCallback(async (template: {
    name: string;
    description: string;
    creator: string;
    creatorAddress: string;
    price: number;
    category: string;
    circuitCode: string;
    tags: string[];
    nodes?: any;
    edges?: any;
    // P3-05: server requires a wallet signature binding the creator address
    // and template name. Callers must produce these via buildSignedPayload()
    // from @/lib/auth/useWalletAuth.
    signedMessage: string;
    signature: string;
  }) => {
    try {
      const response = await fetch('/api/marketplace/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTemplates();
        return { success: true, template: data.data };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchTemplates]);

  const purchaseTemplate = useCallback(async (
    templateId: string,
    buyerAddress: string,
    // transactionSignature is now REQUIRED — the server rejects purchases
    // without an on-chain payment reference.
    transactionSignature: string,
    // Signed payload binds buyer + templateId + tx so an intercepted call
    // cannot be replayed by a different buyer or for a different template.
    signedMessage: string,
    signature: string,
  ) => {
    if (!transactionSignature) {
      return { success: false, error: 'transactionSignature is required' };
    }
    try {
      const response = await fetch('/api/marketplace/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          buyerAddress,
          transactionSignature,
          signedMessage,
          signature,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTemplates();
        return { success: true, purchase: data.data };
      }
      return { success: false, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [fetchTemplates]);

  const getUserPurchases = useCallback(async (buyer: string): Promise<Purchase[]> => {
    try {
      const response = await fetch(`/api/marketplace/purchases?buyer=${buyer}`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  }, []);

  const isTemplateOwned = useCallback(async (templateId: string, buyer: string): Promise<boolean> => {
    const purchases = await getUserPurchases(buyer);
    return purchases.some(p => p.template_id === templateId);
  }, [getUserPurchases]);

  // Memoize stats so downstream consumers don't get a new object identity
  // on every parent re-render.
  const stats = useMemo<MarketplaceStats>(() => {
    const uniqueCreators = new Set(templates.map(t => t.creator_address));
    return {
      totalTemplates: templates.length,
      totalCreators: uniqueCreators.size,
      totalSales: templates.reduce((sum, t) => sum + t.downloads, 0),
      totalVolume: templates.reduce((sum, t) => sum + (t.downloads * t.price), 0),
    };
  }, [templates]);

  const getStats = useCallback(() => stats, [stats]);

  const featuredTemplates = useMemo(
    () => templates.filter(t => t.featured),
    [templates],
  );

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    getTemplate,
    listTemplate,
    purchaseTemplate,
    getUserPurchases,
    isTemplateOwned,
    getStats,
    featuredTemplates,
  };
}

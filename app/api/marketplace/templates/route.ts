import { NextRequest, NextResponse } from 'next/server';
import { MARKETPLACE_CONFIG } from '@/lib/token/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  creator: string;
  creator_address: string;
  price: number;
  category: string;
  circuit_code?: string;
  downloads: number;
  rating: number;
  rating_count: number;
  featured: boolean;
  verified: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

async function supabaseFetch(endpoint: string, options?: RequestInit) {
  return fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': supabaseKey!,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

// GET all marketplace templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const search = searchParams.get('search');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: getMockTemplates(),
      source: 'mock',
    });
  }

  try {
    let url = 'marketplace_templates?select=*&order=downloads.desc';
    
    if (category) {
      url += `&category=eq.${category}`;
    }
    if (featured === 'true') {
      url += '&featured=eq.true';
    }
    if (search) {
      url += `&or=(name.ilike.*${search}*,description.ilike.*${search}*)`;
    }

    const response = await supabaseFetch(url);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const data: MarketplaceTemplate[] = await response.json();

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({
      success: true,
      data: getMockTemplates(),
      source: 'fallback',
    });
  }
}

// POST - List a new template
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      creator,
      creatorAddress,
      price,
      category,
      circuitCode,
      tags,
      nodes,
      edges,
    } = body;

    // Validate required fields
    if (!name || !description || !creator || !creatorAddress || !price || !category || !circuitCode) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    const finalPrice = Math.max(price, MARKETPLACE_CONFIG.MIN_TEMPLATE_PRICE);

    const response = await supabaseFetch('marketplace_templates', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        name,
        description,
        creator,
        creator_address: creatorAddress,
        price: finalPrice,
        category,
        circuit_code: circuitCode,
        tags: tags || [],
        nodes: nodes || null,
        edges: edges || null,
      }),
    });

    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const [data]: MarketplaceTemplate[] = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error('Error creating template:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

// Mock data fallback
function getMockTemplates(): MarketplaceTemplate[] {
  const now = new Date();
  return [
    {
      id: 'tmpl_private_transfer',
      name: 'Private SPL Token Transfer',
      description: 'Send SPL tokens privately on Solana.',
      creator: 'zkRune Labs',
      creator_address: 'zkRuneLabsAddress123',
      price: 300,
      category: 'finance',
      downloads: 456,
      rating: 4.9,
      rating_count: 67,
      featured: true,
      verified: true,
      tags: ['private', 'transfer', 'solana'],
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'tmpl_anon_launch',
      name: 'Anonymous Launchpad Allocation',
      description: 'Prove eligibility for token launches without revealing your wallet.',
      creator: 'Privacy DeFi',
      creator_address: 'PrivacyDeFiAddr',
      price: 250,
      category: 'finance',
      downloads: 312,
      rating: 4.8,
      rating_count: 42,
      featured: true,
      verified: true,
      tags: ['launchpad', 'allocation', 'privacy'],
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    },
  ];
}

import { NextRequest, NextResponse } from 'next/server';
import { MARKETPLACE_CONFIG } from '@/lib/token/config';
import {
  isSupabaseServerConfigured,
  supabaseServerFetch,
} from '@/lib/supabase/serverClient';

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

function requireSupabase() {
  if (!isSupabaseServerConfigured()) {
    throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
}

const supabaseFetch = supabaseServerFetch;

export async function GET(request: NextRequest) {
  try {
    requireSupabase();
  } catch {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const search = searchParams.get('search');

  try {
    let url = 'marketplace_templates?select=*&order=downloads.desc';

    if (category) url += `&category=eq.${category}`;
    if (featured === 'true') url += '&featured=eq.true';
    if (search) url += `&or=(name.ilike.*${search}*,description.ilike.*${search}*)`;

    const response = await supabaseFetch(url, { next: { revalidate: 30 } } as RequestInit);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const data: MarketplaceTemplate[] = await response.json();

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: unknown) {
    console.error('Error fetching templates:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSupabase();
  } catch {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      name, description, creator, creatorAddress,
      price, category, circuitCode, tags, nodes, edges,
    } = body;

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

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('Error creating template:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

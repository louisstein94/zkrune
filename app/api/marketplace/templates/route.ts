import { NextRequest, NextResponse } from 'next/server';
import { MARKETPLACE_CONFIG } from '@/lib/token/config';
import {
  isSupabaseServerConfigured,
  supabaseServerFetch,
} from '@/lib/supabase/serverClient';
import { verifyAuth } from '@/lib/auth/verifyWalletSignature';

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

    if (category) {
      // Category is an enum value — whitelist to alnum/dash.
      const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, '');
      if (safeCategory) url += `&category=eq.${safeCategory}`;
    }
    if (featured === 'true') url += '&featured=eq.true';
    if (search) {
      // P3-07: strip PostgREST control characters (parens, commas, asterisks,
      // dots) from the search input before interpolating it into the or()
      // filter. Without this, a crafted query can break out of the filter
      // and inject additional operators.
      const safeSearch = search.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
      if (safeSearch) {
        url += `&or=(name.ilike.*${safeSearch}*,description.ilike.*${safeSearch}*)`;
      }
    }

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
      signedMessage, signature,
    } = body;

    if (!name || !description || !creator || !creatorAddress || !price || !category || !circuitCode) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    // P3-05: wallet signature required — prevents impersonation of other
    // creator addresses and unauthenticated listing spam.
    if (!signedMessage || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet signature required (signedMessage, signature)',
        },
        { status: 400 },
      );
    }

    if (!verifyAuth(
      { wallet: creatorAddress, signedMessage, signature },
      'create-template',
      { name },
    )) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired wallet signature',
        },
        { status: 401 },
      );
    }

    // P3-06: validate price is a finite non-negative number before clamp.
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Price must be a non-negative number',
        },
        { status: 400 },
      );
    }

    const finalPrice = Math.max(numericPrice, MARKETPLACE_CONFIG.MIN_TEMPLATE_PRICE);

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

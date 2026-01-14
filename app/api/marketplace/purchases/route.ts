import { NextRequest, NextResponse } from 'next/server';
import { MARKETPLACE_CONFIG } from '@/lib/token/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface Purchase {
  id: string;
  template_id: string;
  buyer: string;
  seller: string;
  price: number;
  platform_fee: number;
  creator_revenue: number;
  transaction_signature: string | null;
  created_at: string;
}

interface MarketplaceTemplate {
  id: string;
  price: number;
  creator_address: string;
  downloads: number;
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

// GET purchases
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const buyer = searchParams.get('buyer');
  const seller = searchParams.get('seller');
  const templateId = searchParams.get('templateId');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: [],
      source: 'mock',
    });
  }

  try {
    let url = 'purchases?select=*&order=created_at.desc';
    
    if (buyer) {
      url += `&buyer=eq.${buyer}`;
    }
    if (seller) {
      url += `&seller=eq.${seller}`;
    }
    if (templateId) {
      url += `&template_id=eq.${templateId}`;
    }

    const response = await supabaseFetch(url);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const data: Purchase[] = await response.json();

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({
      success: true,
      data: [],
      source: 'fallback',
    });
  }
}

// POST - Purchase a template
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { templateId, buyerAddress, transactionSignature } = body;

    // Validate required fields
    if (!templateId || !buyerAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: templateId, buyerAddress',
      }, { status: 400 });
    }

    // Get template
    const templateRes = await supabaseFetch(`marketplace_templates?id=eq.${templateId}&select=*`);
    const templates: MarketplaceTemplate[] = await templateRes.json();
    const template = templates[0];

    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
      }, { status: 404 });
    }

    // Check if already owned
    const existingRes = await supabaseFetch(
      `purchases?template_id=eq.${templateId}&buyer=eq.${buyerAddress}&select=id`
    );
    const existingPurchases: Purchase[] = await existingRes.json();

    if (existingPurchases && existingPurchases.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Template already owned',
      }, { status: 400 });
    }

    // Calculate fees
    const platformFee = (template.price * MARKETPLACE_CONFIG.PLATFORM_FEE) / 100;
    const creatorRevenue = template.price - platformFee;

    // Create purchase record
    const purchaseRes = await supabaseFetch('purchases', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify({
        template_id: templateId,
        buyer: buyerAddress,
        seller: template.creator_address,
        price: template.price,
        platform_fee: platformFee,
        creator_revenue: creatorRevenue,
        transaction_signature: transactionSignature || null,
      }),
    });

    if (!purchaseRes.ok) throw new Error('Failed to create purchase');

    const [purchase]: Purchase[] = await purchaseRes.json();

    // Update download count
    await supabaseFetch(`marketplace_templates?id=eq.${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify({ downloads: template.downloads + 1 }),
    });

    return NextResponse.json({
      success: true,
      data: purchase,
    });
  } catch (error: unknown) {
    console.error('Error creating purchase:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

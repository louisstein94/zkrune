import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MARKETPLACE_CONFIG } from '@/lib/token/config';

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
    let query = supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (buyer) {
      query = query.eq('buyer', buyer);
    }

    if (seller) {
      query = query.eq('seller', seller);
    }

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
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
    const { data: template, error: templateError } = await supabase
      .from('marketplace_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
      }, { status: 404 });
    }

    // Check if already owned
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('template_id', templateId)
      .eq('buyer', buyerAddress)
      .single();

    if (existingPurchase) {
      return NextResponse.json({
        success: false,
        error: 'Template already owned',
      }, { status: 400 });
    }

    // Calculate fees
    const platformFee = (template.price * MARKETPLACE_CONFIG.PLATFORM_FEE) / 100;
    const creatorRevenue = template.price - platformFee;

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        template_id: templateId,
        buyer: buyerAddress,
        seller: template.creator_address,
        price: template.price,
        platform_fee: platformFee,
        creator_revenue: creatorRevenue,
        transaction_signature: transactionSignature || null,
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Update download count
    await supabase
      .from('marketplace_templates')
      .update({ downloads: template.downloads + 1 })
      .eq('id', templateId);

    return NextResponse.json({
      success: true,
      data: purchase,
    });
  } catch (error: any) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

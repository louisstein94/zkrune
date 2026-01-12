import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MARKETPLACE_CONFIG } from '@/lib/token/config';

// GET all marketplace templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const creator = searchParams.get('creator');
  const search = searchParams.get('search');

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: getMockTemplates(),
      source: 'mock',
    });
  }

  try {
    let query = supabase
      .from('marketplace_templates')
      .select('*')
      .order('downloads', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (creator) {
      query = query.eq('creator_address', creator);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      source: 'supabase',
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
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

    const { data, error } = await supabase
      .from('marketplace_templates')
      .insert({
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
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// Mock data fallback
function getMockTemplates() {
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

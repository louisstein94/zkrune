import { NextResponse } from 'next/server';
import { getAddressBalance, getLightdInfo } from '@/lib/lightwalletd/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  // Validate Zcash address format
  if (!address.startsWith('t') && !address.startsWith('z')) {
    return NextResponse.json({ error: 'Invalid Zcash address' }, { status: 400 });
  }

  // Only support t-addresses for now (transparent)
  if (!address.startsWith('t')) {
    return NextResponse.json({
      error: 'Only transparent addresses (t-addresses) supported in current version',
      note: 'Shielded address support (z-addresses) coming soon with Zcash Rust SDK WASM',
    }, { status: 400 });
  }

  try {
    console.log(`[Lightwalletd] Fetching balance for ${address}...`);
    
    // Get balance from Lightwalletd
    const balance = await getAddressBalance(address);
    
    console.log(`[Lightwalletd] Balance fetched: ${balance} ZEC`);

    return NextResponse.json({
      success: true,
      balance: balance,
      source: 'lightwalletd',
      address: address,
      note: 'Real Zcash balance fetched from Lightwalletd (gRPC)',
    });

  } catch (error: any) {
    console.error('Lightwalletd balance fetch error:', error);

    // Return a real failure so downstream code cannot treat a fabricated
    // balance as authoritative.
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Lightwalletd balance lookup failed',
      },
      { status: 502 },
    );
  }
}

// Health check endpoint
export async function POST(request: Request) {
  try {
    const info = await getLightdInfo();
    
    return NextResponse.json({
      success: true,
      lightdInfo: info,
      status: 'connected',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'disconnected',
      error: error.message,
    }, { status: 503 });
  }
}


import { NextResponse } from 'next/server';

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

  try {
    // Try Blockchair API first
    const response = await fetch(
      `https://api.blockchair.com/zcash/dashboards/address/${address}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data[address]) {
        const addressData = data.data[address];
        const balanceInZEC = addressData.address.balance / 100000000;
        
        return NextResponse.json({
          success: true,
          balance: balanceInZEC,
          source: 'blockchair',
        });
      }
    }

    // If Blockchair fails, return demo data for hackathon showcase
    // In production, you would integrate with Zcash RPC or other providers
    return NextResponse.json({
      success: true,
      balance: 5.12345678, // Demo balance
      source: 'demo',
      note: 'Demo mode - In production, this would fetch real balance from Zcash node or explorer',
    });

  } catch (error) {
    console.error('Zcash balance fetch error:', error);
    
    // Fallback to demo mode
    return NextResponse.json({
      success: true,
      balance: 5.12345678,
      source: 'demo',
      note: 'Demo mode - API unavailable',
    });
  }
}


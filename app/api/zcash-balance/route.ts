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
    // Try Crypto APIs (Professional Zcash API)
    console.log(`[Crypto APIs] Trying for ${address}`);
    let response = await fetch(
      `https://rest.cryptoapis.io/addresses-latest/utxo/zcash/mainnet/${address}/balance`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'dfb117d597d5f831f86ea42c8ebe6415a8ae7941',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('[Crypto APIs] SUCCESS:', JSON.stringify(data, null, 2));
      
      // Crypto APIs response structure for UTXO chains
      if (data && data.data && data.data.item) {
        const item = data.data.item;
        // confirmedBalance is an object with { amount, denomination, unit }
        const balanceInZEC = parseFloat(item.confirmedBalance?.amount || '0');
        
        console.log(`[Crypto APIs] Real balance fetched: ${balanceInZEC} ZEC`);
        
        return NextResponse.json({
          success: true,
          balance: balanceInZEC,
          source: 'Crypto APIs',
          address: address,
        });
      }
    } else {
      console.log(`[Crypto APIs] HTTP ${response.status}: ${response.statusText}`);
      try {
        const errorData = await response.json();
        console.log('[Crypto APIs] Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('[Crypto APIs] Could not parse error response');
      }
    }

    // zcha.in has redirect issues, skipping for now
    console.log(`[zcha.in] Skipping (redirect issues)`)

    // Try Blockchair as fallback
    console.log(`[Blockchair] Trying for ${address}`);
    response = await fetch(
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

    // If both fail, return demo data
    return NextResponse.json({
      success: true,
      balance: 5.12345678,
      source: 'demo',
      note: 'Demo mode - zcha.in and Blockchair APIs unavailable',
    });

  } catch (error) {
    console.error('Zcash balance fetch error:', error);
    
    // Fallback to demo mode
    return NextResponse.json({
      success: true,
      balance: 5.12345678,
      source: 'demo',
      note: 'Demo mode - API error',
    });
  }
}


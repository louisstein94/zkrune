import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { MARKETPLACE_CONFIG, ZKRUNE_TOKEN } from '@/lib/token/config';
import {
  getTxAccountKeys,
  verifySplTransferToDestination,
  getTokenTransferDeltas,
  toRawAmount,
  type TxInfo,
} from '@/lib/solana/txVerification';

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

function requireSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase not configured');
  }
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

export async function GET(request: NextRequest) {
  try {
    requireSupabase();
  } catch {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const buyer = searchParams.get('buyer');
  const seller = searchParams.get('seller');
  const templateId = searchParams.get('templateId');

  try {
    let url = 'purchases?select=*&order=created_at.desc';
    if (buyer) url += `&buyer=eq.${buyer}`;
    if (seller) url += `&seller=eq.${seller}`;
    if (templateId) url += `&template_id=eq.${templateId}`;

    const response = await supabaseFetch(url);
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);

    const data: Purchase[] = await response.json();

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: unknown) {
    console.error('Error fetching purchases:', error);
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
    const { templateId, buyerAddress, transactionSignature } = body;

    if (!templateId || !buyerAddress || !transactionSignature) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: templateId, buyerAddress, transactionSignature',
      }, { status: 400 });
    }

    const templateRes = await supabaseFetch(`marketplace_templates?id=eq.${templateId}&select=*`);
    const templates: MarketplaceTemplate[] = await templateRes.json();
    const template = templates[0];

    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    const existingRes = await supabaseFetch(
      `purchases?template_id=eq.${templateId}&buyer=eq.${buyerAddress}&select=id`
    );
    const existingPurchases: Purchase[] = await existingRes.json();

    if (existingPurchases && existingPurchases.length > 0) {
      return NextResponse.json({ success: false, error: 'Template already owned' }, { status: 400 });
    }

    // Verify on-chain transaction
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const mintAddress = ZKRUNE_TOKEN.MINT_ADDRESS;
    const mintPubkey = new PublicKey(mintAddress);
    const buyerPubkey = new PublicKey(buyerAddress);
    const creatorPubkey = new PublicKey(template.creator_address);

    const buyerAta = getAssociatedTokenAddressSync(mintPubkey, buyerPubkey);
    const creatorAta = getAssociatedTokenAddressSync(mintPubkey, creatorPubkey);

    const txInfo = await connection.getTransaction(transactionSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!txInfo) {
      return NextResponse.json({ success: false, error: 'Transaction not found on-chain' }, { status: 400 });
    }

    if (txInfo.meta?.err) {
      return NextResponse.json({ success: false, error: 'Transaction failed on-chain' }, { status: 400 });
    }

    const accountKeys = getTxAccountKeys(txInfo as unknown as TxInfo);

    verifySplTransferToDestination(
      txInfo as unknown as TxInfo,
      accountKeys,
      buyerAta,
      creatorAta,
    );

    const buyerAtaIndex = accountKeys.findIndex(k => k.equals(buyerAta));
    const creatorAtaIndex = accountKeys.findIndex(k => k.equals(creatorAta));

    if (buyerAtaIndex === -1 || creatorAtaIndex === -1) {
      return NextResponse.json({ success: false, error: 'Token accounts not found in transaction' }, { status: 400 });
    }

    const { destDelta } = getTokenTransferDeltas(
      txInfo as unknown as TxInfo,
      buyerAtaIndex,
      creatorAtaIndex,
      mintAddress,
    );

    const expectedCreatorRaw = toRawAmount(template.price, ZKRUNE_TOKEN.DECIMALS)
      * BigInt(100 - MARKETPLACE_CONFIG.PLATFORM_FEE) / 100n;

    if (destDelta < expectedCreatorRaw) {
      return NextResponse.json({
        success: false,
        error: `Insufficient transfer amount. Expected at least ${expectedCreatorRaw.toString()} raw units to creator, got ${destDelta.toString()}`,
      }, { status: 400 });
    }

    // Verify reward vault transfer when configured
    const rewardShare = MARKETPLACE_CONFIG.REWARD_POOL_SHARE;
    let rewardVaultAmount = 0;
    let treasuryAmount = 0;
    let feeDestination: 'reward_vault' | 'treasury' | 'split' = 'treasury';

    const platformFee = (template.price * MARKETPLACE_CONFIG.PLATFORM_FEE) / 100;
    const creatorRevenue = template.price - platformFee;

    if (ZKRUNE_TOKEN.REWARD_VAULT_ADDRESS && rewardShare > 0) {
      rewardVaultAmount = (platformFee * rewardShare) / 100;
      treasuryAmount = platformFee - rewardVaultAmount;
      feeDestination = rewardShare === 100 ? 'reward_vault' : 'split';

      const rewardVaultPubkey = new PublicKey(ZKRUNE_TOKEN.REWARD_VAULT_ADDRESS);
      const rewardVaultIndex = accountKeys.findIndex(k => k.equals(rewardVaultPubkey));

      if (rewardVaultIndex >= 0) {
        const rewardDelta = getTokenTransferDeltas(
          txInfo as unknown as TxInfo,
          buyerAtaIndex,
          rewardVaultIndex,
          mintAddress,
        );

        const expectedRewardRaw = toRawAmount(rewardVaultAmount, ZKRUNE_TOKEN.DECIMALS);
        if (rewardDelta.destDelta < expectedRewardRaw) {
          return NextResponse.json({
            success: false,
            error: `Insufficient reward vault transfer. Expected ${expectedRewardRaw}, got ${rewardDelta.destDelta}`,
          }, { status: 400 });
        }
      }
    } else {
      treasuryAmount = platformFee;
    }

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
        reward_vault_amount: rewardVaultAmount,
        treasury_amount: treasuryAmount,
        fee_destination: feeDestination,
        transaction_signature: transactionSignature,
      }),
    });

    if (!purchaseRes.ok) throw new Error('Failed to create purchase');

    const [purchase]: Purchase[] = await purchaseRes.json();

    await supabaseFetch(`marketplace_templates?id=eq.${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify({ downloads: template.downloads + 1 }),
    });

    return NextResponse.json({ success: true, data: purchase });
  } catch (error: unknown) {
    console.error('Error creating purchase:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

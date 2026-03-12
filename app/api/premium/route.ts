import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PREMIUM_TIERS, ZKRUNE_TOKEN, type PremiumTier } from '@/lib/token/config';
import { verifyAuth } from '@/lib/auth/verifyWalletSignature';
import {
  getTxAccountKeys,
  getBurnDelta,
  verifySplBurnFromAta,
  toRawAmount,
} from '@/lib/solana/txVerification';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface PremiumStatus {
  id: string;
  wallet: string;
  tier: PremiumTier;
  total_burned: number;
  unlocked_at: string | null;
  expires_at: string | null;
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

// GET premium status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({
      success: false,
      error: 'Wallet address required',
    }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: {
        wallet,
        tier: 'FREE',
        total_burned: 0,
        features: PREMIUM_TIERS.FREE.features,
      },
      source: 'mock',
    });
  }

  try {
    const response = await supabaseFetch(`premium_status?wallet=eq.${wallet}&select=*`);
    const data: PremiumStatus[] = await response.json();
    const status = data[0];

    if (!status) {
      return NextResponse.json({
        success: true,
        data: {
          wallet,
          tier: 'FREE',
          total_burned: 0,
          features: PREMIUM_TIERS.FREE.features,
        },
        source: 'supabase',
      });
    }

    // Check if premium has expired
    if (status.expires_at && new Date(status.expires_at) < new Date()) {
      return NextResponse.json({
        success: true,
        data: {
          ...status,
          tier: 'FREE',
          features: PREMIUM_TIERS.FREE.features,
          expired: true,
        },
        source: 'supabase',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        features: PREMIUM_TIERS[status.tier]?.features || PREMIUM_TIERS.FREE.features,
      },
      source: 'supabase',
    });
  } catch (error: unknown) {
    console.error('Error fetching premium status:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

// POST - Burn tokens for premium upgrade
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { wallet, amount, targetTier, transactionSignature, signedMessage, signature } = body;

    // Validate required fields
    if (!wallet || !amount || !targetTier || !transactionSignature || !signedMessage || !signature) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: wallet, amount, targetTier, transactionSignature, signedMessage, signature',
      }, { status: 400 });
    }

    // Verify caller owns the wallet — signature binds amount, tier, and txSig
    // so the same signature cannot be replayed for a different upgrade
    if (!verifyAuth(
      { wallet, signedMessage, signature },
      'premium',
      { amount: String(amount), targetTier, transactionSignature },
    )) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired wallet signature',
      }, { status: 401 });
    }

    // ── On-chain burn verification ────────────────────────────────────────────
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    const txInfo = await connection.getTransaction(transactionSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (!txInfo || txInfo.meta?.err !== null) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found or failed on-chain',
      }, { status: 400 });
    }

    const walletPubkey = new PublicKey(wallet);
    const mintPubkey = new PublicKey(ZKRUNE_TOKEN.MINT_ADDRESS);
    const accountKeys = getTxAccountKeys(txInfo as any);

    // Fee payer must be the wallet requesting the upgrade
    if (!accountKeys[0]?.equals(walletPubkey)) {
      return NextResponse.json({
        success: false,
        error: 'Transaction fee payer does not match wallet',
      }, { status: 400 });
    }

    // Derive wallet's canonical ATA — no fallback
    const walletAta = getAssociatedTokenAddressSync(mintPubkey, walletPubkey);
    const ataIndex = accountKeys.findIndex(k => k.equals(walletAta));
    if (ataIndex < 0) {
      return NextResponse.json({
        success: false,
        error: 'Wallet zkRUNE ATA not found in transaction accounts',
      }, { status: 400 });
    }

    // Verify a Burn/BurnChecked instruction targeting exactly walletAta + zkRUNE mint + walletPubkey authority
    try {
      verifySplBurnFromAta(txInfo as any, accountKeys, walletAta, mintPubkey, walletPubkey);
    } catch (err: unknown) {
      return NextResponse.json({
        success: false,
        error: `Burn instruction check failed: ${err instanceof Error ? err.message : String(err)}`,
      }, { status: 400 });
    }

    // Verify raw burned amount using integer arithmetic — no float, no tolerance
    let actualBurnedRaw: bigint;
    try {
      actualBurnedRaw = getBurnDelta(txInfo as any, ataIndex, ZKRUNE_TOKEN.MINT_ADDRESS);
    } catch (err: unknown) {
      return NextResponse.json({
        success: false,
        error: `Burn delta check failed: ${err instanceof Error ? err.message : String(err)}`,
      }, { status: 400 });
    }

    const requiredRaw = toRawAmount(amount, ZKRUNE_TOKEN.DECIMALS);
    if (actualBurnedRaw < requiredRaw) {
      return NextResponse.json({
        success: false,
        error: `On-chain burn (${actualBurnedRaw} base units) is less than required (${requiredRaw} base units)`,
      }, { status: 400 });
    }

    // Prevent replay: reject if this txSig was already used for a premium upgrade
    const existingBurnRes = await supabaseFetch(
      `burn_history?transaction_signature=eq.${transactionSignature}&select=id`
    );
    const existingBurn = await existingBurnRes.json();
    if (Array.isArray(existingBurn) && existingBurn.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'This transaction has already been used for a premium upgrade',
      }, { status: 400 });
    }

    // Validate tier
    if (!PREMIUM_TIERS[targetTier as PremiumTier]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid target tier',
      }, { status: 400 });
    }

    // Get current status
    const statusRes = await supabaseFetch(`premium_status?wallet=eq.${wallet}&select=*`);
    const statuses: PremiumStatus[] = await statusRes.json();
    const currentStatus = statuses[0];

    const currentBurned = currentStatus?.total_burned || 0;
    const newTotalBurned = currentBurned + amount;

    // Determine achieved tier based on total burned
    let achievedTier: PremiumTier = 'FREE';
    if (newTotalBurned >= PREMIUM_TIERS.ENTERPRISE.burnRequired) {
      achievedTier = 'ENTERPRISE';
    } else if (newTotalBurned >= PREMIUM_TIERS.PRO.burnRequired) {
      achievedTier = 'PRO';
    } else if (newTotalBurned >= PREMIUM_TIERS.BUILDER.burnRequired) {
      achievedTier = 'BUILDER';
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    // Upsert premium status
    if (currentStatus) {
      // Update existing
      await supabaseFetch(`premium_status?wallet=eq.${wallet}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tier: achievedTier,
          total_burned: newTotalBurned,
          unlocked_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        }),
      });
    } else {
      // Insert new
      await supabaseFetch('premium_status', {
        method: 'POST',
        body: JSON.stringify({
          wallet,
          tier: achievedTier,
          total_burned: newTotalBurned,
          unlocked_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        }),
      });
    }

    // Add to burn history
    await supabaseFetch('burn_history', {
      method: 'POST',
      body: JSON.stringify({
        wallet,
        amount,
        tier: achievedTier,
        transaction_signature: transactionSignature,
      }),
    });

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        tier: achievedTier,
        total_burned: newTotalBurned,
        amount_burned: amount,
        features: PREMIUM_TIERS[achievedTier].features,
      },
    });
  } catch (error: unknown) {
    console.error('Error processing burn:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}

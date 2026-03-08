import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, mintTo, getAccount } from '@solana/spl-token';

const DEVNET_TOKEN_MINT = process.env.NEXT_PUBLIC_ZKRUNE_MINT || 'A619D39h4CxHT7rSSurWAb2Un36c6W8BLyJWBYGxzstP';
const FAUCET_AMOUNT = 1000; // 1,000 zkRUNE per request
const DECIMALS = 6;
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

// In-memory rate limiting (use Redis in production)
const lastRequestTime = new Map<string, number>();

// Faucet wallet private key (from environment)
// In production, use a secure key management system
function getFaucetKeypair(): Keypair | null {
  const privateKey = process.env.FAUCET_PRIVATE_KEY;
  if (!privateKey) return null;
  
  try {
    const secretKey = JSON.parse(privateKey);
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate wallet address
    let recipient: PublicKey;
    try {
      recipient = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Rate limiting
    const now = Date.now();
    const lastRequest = lastRequestTime.get(walletAddress);
    if (lastRequest && now - lastRequest < COOLDOWN_MS) {
      const remainingMs = COOLDOWN_MS - (now - lastRequest);
      const remainingMins = Math.ceil(remainingMs / 60000);
      return NextResponse.json(
        { error: `Please wait ${remainingMins} minutes before requesting again` },
        { status: 429 }
      );
    }

    // Get faucet keypair
    const faucetKeypair = getFaucetKeypair();
    if (!faucetKeypair) {
      return NextResponse.json(
        { error: 'Faucet not configured. Please contact admin.' },
        { status: 503 }
      );
    }

    // Connect to devnet
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const tokenMint = new PublicKey(DEVNET_TOKEN_MINT);

    // Get or create recipient's token account
    const recipientAta = await getOrCreateAssociatedTokenAccount(
      connection,
      faucetKeypair,
      tokenMint,
      recipient
    );

    // Mint tokens
    const rawAmount = FAUCET_AMOUNT * Math.pow(10, DECIMALS);
    const signature = await mintTo(
      connection,
      faucetKeypair,
      tokenMint,
      recipientAta.address,
      faucetKeypair.publicKey,
      rawAmount
    );

    // Update rate limit
    lastRequestTime.set(walletAddress, now);

    // Get new balance
    const accountInfo = await getAccount(connection, recipientAta.address);
    const newBalance = Number(accountInfo.amount) / Math.pow(10, DECIMALS);

    return NextResponse.json({
      success: true,
      amount: FAUCET_AMOUNT,
      newBalance,
      signature,
      explorerUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
    });

  } catch (error: any) {
    console.error('Faucet error:', error);
    return NextResponse.json(
      { error: error.message || 'Faucet request failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'zkRUNE Devnet Faucet',
    network: 'devnet',
    tokenMint: DEVNET_TOKEN_MINT,
    amountPerRequest: FAUCET_AMOUNT,
    cooldownMinutes: COOLDOWN_MS / 60000,
    usage: 'POST with { "walletAddress": "your_solana_address" }',
  });
}

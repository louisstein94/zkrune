import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount, 
  transfer,
  getAccount
} from '@solana/spl-token';

// Force Node.js runtime (not Edge) for native crypto support
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEVNET_TOKEN_MINT = process.env.NEXT_PUBLIC_ZKRUNE_MINT || 'A619D39h4CxHT7rSSurWAb2Un36c6W8BLyJWBYGxzstP';
const DEVNET_RPC = 'https://api.devnet.solana.com';
const FAUCET_AMOUNT = 1000;
const DECIMALS = 6;
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

const lastRequestTime = new Map<string, number>();

function getFaucetKeypair(): Keypair | null {
  const privateKey = process.env.FAUCET_PRIVATE_KEY;
  if (!privateKey) {
    console.log('FAUCET_PRIVATE_KEY not set');
    return null;
  }
  
  try {
    const secretKey = JSON.parse(privateKey);
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } catch (e) {
    console.error('Failed to parse FAUCET_PRIVATE_KEY:', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const walletAddress = body.walletAddress || body.wallet;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required', success: false },
        { status: 400 }
      );
    }

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address', success: false },
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
        { error: `Please wait ${remainingMins} minutes before requesting again`, success: false },
        { status: 429 }
      );
    }

    const faucetKeypair = getFaucetKeypair();
    if (!faucetKeypair) {
      return NextResponse.json(
        { error: 'Faucet not configured', success: false },
        { status: 503 }
      );
    }

    const connection = new Connection(DEVNET_RPC, 'confirmed');
    const tokenMint = new PublicKey(DEVNET_TOKEN_MINT);

    // Get faucet's token account
    const faucetAta = await getOrCreateAssociatedTokenAccount(
      connection,
      faucetKeypair,
      tokenMint,
      faucetKeypair.publicKey
    );

    // Check faucet balance
    const faucetBalance = Number(faucetAta.amount) / Math.pow(10, DECIMALS);
    const rawAmount = FAUCET_AMOUNT * Math.pow(10, DECIMALS);
    
    if (faucetBalance < FAUCET_AMOUNT) {
      return NextResponse.json(
        { error: 'Faucet is empty. Please try again later.', success: false },
        { status: 503 }
      );
    }

    // Get or create recipient's token account
    const recipientAta = await getOrCreateAssociatedTokenAccount(
      connection,
      faucetKeypair,
      tokenMint,
      recipient
    );

    // Transfer tokens
    const signature = await transfer(
      connection,
      faucetKeypair,
      faucetAta.address,
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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Faucet error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  const faucetKeypair = getFaucetKeypair();
  let faucetBalance = 0;
  let faucetAddress = '';
  
  if (faucetKeypair) {
    faucetAddress = faucetKeypair.publicKey.toString();
    try {
      const connection = new Connection(DEVNET_RPC, 'confirmed');
      const tokenMint = new PublicKey(DEVNET_TOKEN_MINT);
      const faucetAta = await getOrCreateAssociatedTokenAccount(
        connection,
        faucetKeypair,
        tokenMint,
        faucetKeypair.publicKey
      );
      faucetBalance = Number(faucetAta.amount) / Math.pow(10, DECIMALS);
    } catch {
      faucetBalance = 0;
    }
  }
  
  return NextResponse.json({
    name: 'zkRUNE Devnet Faucet',
    network: 'devnet',
    tokenMint: DEVNET_TOKEN_MINT,
    amountPerRequest: FAUCET_AMOUNT,
    cooldownMinutes: COOLDOWN_MS / 60000,
    configured: !!faucetKeypair,
    faucetAddress,
    faucetBalance,
  });
}

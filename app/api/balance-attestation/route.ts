import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ZKRUNE_MINT = process.env.NEXT_PUBLIC_ZKRUNE_MINT || '51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump';
const ATTESTATION_SECRET = process.env.ATTESTATION_SECRET || 'zkrune-attestation-default-key';
const ATTESTATION_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
}

function signAttestation(walletAddress: string, balance: string, mintAddress: string, timestamp: number): string {
  const payload = `${walletAddress}:${balance}:${mintAddress}:${timestamp}`;
  return crypto.createHmac('sha256', ATTESTATION_SECRET).update(payload).digest('hex');
}

function verifyAttestation(
  walletAddress: string, balance: string, mintAddress: string, timestamp: number, signature: string,
): boolean {
  if (Date.now() - timestamp > ATTESTATION_TTL_MS) return false;
  const expected = signAttestation(walletAddress, balance, mintAddress, timestamp);
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, mintAddress: rawMint } = await request.json();

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    let walletPubkey: PublicKey;
    try {
      walletPubkey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    const mintAddress = rawMint || ZKRUNE_MINT;
    const isSOL = mintAddress === 'SOL';
    const connection = new Connection(getRpcUrl(), 'confirmed');

    let balance: string;
    let decimals: number;
    let symbol: string;

    if (isSOL) {
      const lamports = await connection.getBalance(walletPubkey);
      decimals = 9;
      balance = lamports.toString();
      symbol = 'SOL';
    } else {
      let mintPubkey: PublicKey;
      try {
        mintPubkey = new PublicKey(mintAddress);
      } catch {
        return NextResponse.json({ error: 'Invalid mint address' }, { status: 400 });
      }

      let ata: PublicKey;
      try {
        ata = getAssociatedTokenAddressSync(mintPubkey, walletPubkey, true);
      } catch {
        balance = '0';
        decimals = 6;
        symbol = mintAddress === ZKRUNE_MINT ? 'zkRUNE' : 'SPL';

        const timestamp = Date.now();
        const signature = signAttestation(walletAddress, balance, mintAddress, timestamp);
        return NextResponse.json({ success: true, balance, mintAddress, decimals, symbol, attestedAt: timestamp, signature });
      }

      try {
        const tokenBalance = await connection.getTokenAccountBalance(ata);
        balance = tokenBalance.value.amount;
        decimals = tokenBalance.value.decimals;
      } catch {
        balance = '0';
        decimals = mintAddress === ZKRUNE_MINT ? 6 : 6;
      }

      symbol = mintAddress === ZKRUNE_MINT ? 'zkRUNE' : 'SPL';
    }

    const timestamp = Date.now();
    const signature = signAttestation(walletAddress, balance, mintAddress, timestamp);

    return NextResponse.json({
      success: true,
      balance,
      mintAddress: isSOL ? 'SOL' : mintAddress,
      decimals,
      symbol,
      attestedAt: timestamp,
      signature,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[balance-attestation] Error:', error);
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

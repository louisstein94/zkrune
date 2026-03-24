import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { storeProof, type StoredProof } from '@/lib/blinks/proofStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TRUSTED_CIRCUITS = new Set([
  'age-verification',
  'balance-proof',
  'range-proof',
  'membership-proof',
  'hash-preimage',
  'private-voting',
  'quadratic-voting',
  'signature-verification',
  'anonymous-reputation',
  'credential-proof',
  'nft-ownership',
  'whale-holder',
  'token-swap',
  'patience-proof',
]);

async function loadTrustedVKey(circuitName: string): Promise<object | null> {
  if (!TRUSTED_CIRCUITS.has(circuitName)) return null;
  const vkeyPath = path.join(process.cwd(), 'public', 'circuits', `${circuitName}_vkey.json`);
  try {
    const raw = await fs.readFile(vkeyPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'zkrune.xyz';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const {
      circuitName,
      proof,
      publicSignals,
      label,
      description,
      walletAddress,
    } = await req.json();

    if (!circuitName || !proof || !publicSignals) {
      return NextResponse.json(
        { error: 'Missing circuitName, proof, or publicSignals' },
        { status: 400 },
      );
    }

    if (!TRUSTED_CIRCUITS.has(circuitName)) {
      return NextResponse.json(
        { error: `Unsupported circuit: ${circuitName}` },
        { status: 400 },
      );
    }

    if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
      return NextResponse.json(
        { error: 'Invalid proof structure: missing pi_a, pi_b, or pi_c' },
        { status: 400 },
      );
    }

    const vKey = await loadTrustedVKey(circuitName);
    if (!vKey) {
      return NextResponse.json(
        { error: `Verification key not found for circuit: ${circuitName}` },
        { status: 500 },
      );
    }

    let verified = false;
    try {
      // @ts-ignore
      const snarkjs = await import('snarkjs');
      verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    } catch (err) {
      console.error('[actions/publish] snarkjs verify error:', err);
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'Proof verification failed — cannot publish an invalid proof as a Blink' },
        { status: 422 },
      );
    }

    const stored: StoredProof = await storeProof(circuitName, proof, publicSignals, {
      label,
      description,
      wallet: walletAddress,
      verifiedOffChain: true,
    });

    const baseUrl = getBaseUrl(req);
    const blinkUrl = `solana-action:${baseUrl}/api/actions/verify?id=${stored.id}`;
    const directUrl = `${baseUrl}/api/actions/verify?id=${stored.id}`;

    return NextResponse.json({
      success: true,
      proofId: stored.id,
      blinkUrl,
      directUrl,
      expiresAt: new Date(stored.expiresAt).toISOString(),
      message: 'Proof published as a Blink! Share the blinkUrl on Twitter/X.',
    });
  } catch (err: any) {
    console.error('[actions/publish]', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 },
    );
  }
}

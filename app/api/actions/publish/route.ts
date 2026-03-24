import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import * as snarkjs from 'snarkjs';
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

async function loadTrustedVKey(circuitName: string, baseUrl: string): Promise<object | null> {
  if (!TRUSTED_CIRCUITS.has(circuitName)) return null;

  // Try filesystem first (faster)
  const vkeyPath = path.join(process.cwd(), 'public', 'circuits', `${circuitName}_vkey.json`);
  try {
    const raw = await fs.readFile(vkeyPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // Filesystem unavailable (e.g. Vercel), fall back to HTTP
  }

  // Fetch from own public CDN as fallback
  try {
    const url = `${baseUrl}/circuits/${circuitName}_vkey.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error(`[actions/publish] Failed to load vKey for ${circuitName}:`, err?.message || err);
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

    const baseUrl = getBaseUrl(req);
    const vKey = await loadTrustedVKey(circuitName, baseUrl);
    if (!vKey) {
      return NextResponse.json(
        { error: `Verification key not found for circuit: ${circuitName}` },
        { status: 500 },
      );
    }

    let verified = false;
    try {
      // @ts-ignore
      verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('[actions/publish] snarkjs verify error:', msg);
      return NextResponse.json(
        { error: `Server-side verification engine failed: ${msg}` },
        { status: 500 },
      );
    }

    if (!verified) {
      return NextResponse.json(
        {
          error: 'Proof verification failed — cannot publish an invalid proof as a Blink',
          debug: {
            circuitName,
            proofKeys: Object.keys(proof),
            pi_a_len: proof.pi_a?.length,
            pi_b_len: proof.pi_b?.length,
            pi_c_len: proof.pi_c?.length,
            publicSignals_len: publicSignals?.length,
            publicSignals,
            vKeyProtocol: (vKey as any)?.protocol,
            proofProtocol: proof.protocol,
          },
        },
        { status: 422 },
      );
    }

    const stored: StoredProof = await storeProof(circuitName, proof, publicSignals, {
      label,
      description,
      wallet: walletAddress,
      verifiedOffChain: true,
    });

    const actionUrl = `${baseUrl}/api/actions/verify?id=${stored.id}`;
    const blinkUrl = `https://dial.to/?action=solana-action:${actionUrl}`;
    const verifyPageUrl = `${baseUrl}/verify/${stored.id}`;

    return NextResponse.json({
      success: true,
      proofId: stored.id,
      blinkUrl,
      actionUrl,
      verifyPageUrl,
      expiresAt: new Date(stored.expiresAt).toISOString(),
      message: 'Proof published as a Blink!',
    });
  } catch (err: any) {
    console.error('[actions/publish]', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 },
    );
  }
}

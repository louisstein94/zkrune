import { NextRequest } from 'next/server';
import {
  PublicKey,
  Transaction,
  Connection,
} from '@solana/web3.js';
import { actionJsonResponse, actionCorsPreflightResponse, actionErrorResponse } from '@/lib/blinks/actionHeaders';
import { getProof } from '@/lib/blinks/proofStore';
import {
  TEMPLATE_IDS,
  MAINNET_PUBLIC_RPC,
  getRpcUrl,
  buildVerifyInstruction,
} from '@/lib/blinks/groth16Tx';
import * as snarkjs from 'snarkjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const CIRCUIT_LABELS: Record<string, { title: string; emoji: string }> = {
  'balance-proof':          { title: 'Anonymous Balance Proof',      emoji: '💰' },
  'whale-holder':           { title: 'Whale Verification',           emoji: '🐋' },
  'age-verification':       { title: 'Age Verification',             emoji: '🎂' },
  'membership-proof':       { title: 'Membership Proof',             emoji: '🏛️' },
  'private-voting':         { title: 'Private Vote',                 emoji: '🗳️' },
  'quadratic-voting':       { title: 'Quadratic Vote',               emoji: '📊' },
  'credential-proof':       { title: 'Credential Proof',             emoji: '🪪' },
  'anonymous-reputation':   { title: 'Anonymous Reputation Proof',   emoji: '⭐' },
  'nft-ownership':          { title: 'NFT Ownership Proof',          emoji: '🖼️' },
  'range-proof':            { title: 'Range Proof',                  emoji: '📏' },
  'hash-preimage':          { title: 'Hash Preimage Proof',          emoji: '🔐' },
  'signature-verification': { title: 'Signature Verification',       emoji: '✍️' },
  'token-swap':             { title: 'Token Swap Proof',             emoji: '🔄' },
  'patience-proof':         { title: 'Patience Proof',               emoji: '⏳' },
};

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'zkrune.xyz';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

// ─── On-the-fly proof generation (cached per cold start) ────────────

let cachedProof: {
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] };
  publicSignals: string[];
} | null = null;

async function generateDemoProof(baseUrl: string) {
  if (cachedProof) return cachedProof;

  const [wasmResp, zkeyResp] = await Promise.all([
    fetch(`${baseUrl}/circuits/age-verification.wasm`),
    fetch(`${baseUrl}/circuits/age-verification.zkey`),
  ]);

  if (!wasmResp.ok || !zkeyResp.ok) {
    throw new Error('Failed to fetch circuit files for proof generation');
  }

  const wasmBuf = new Uint8Array(await wasmResp.arrayBuffer());
  const zkeyBuf = new Uint8Array(await zkeyResp.arrayBuffer());

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { birthYear: 1990, currentYear: new Date().getFullYear(), minimumAge: 18 },
    { type: 'mem', data: wasmBuf } as any,
    { type: 'mem', data: zkeyBuf } as any,
  );

  cachedProof = { proof, publicSignals };
  return cachedProof;
}

const DEMO_DESCRIPTION = 'A zk-SNARK proof was generated client-side proving the user meets the minimum age requirement (18+). By clicking below, you submit this proof to Solana\'s Groth16 verifier program for trustless on-chain verification. No personal data is revealed — only the cryptographic validity is checked.';

// ─── GET: Return Action metadata for Blink unfurl ───────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const proofId = searchParams.get('id');

  const baseUrl = getBaseUrl(req);
  const iconUrl = `${baseUrl}/zkrune-log.png`;

  // No id → live-generated age verification Blink
  if (!proofId) {
    const accept = req.headers.get('accept') || '';
    const isBrowser = accept.includes('text/html') && !accept.includes('application/json');
    if (isBrowser) {
      return Response.redirect(`${baseUrl}/playground`, 302);
    }

    return actionJsonResponse({
      type: 'action',
      icon: iconUrl,
      title: '🎂 zkRune — Age Verification Proof',
      description: DEMO_DESCRIPTION,
      label: 'Verify Proof On-Chain',
      links: {
        actions: [
          {
            type: 'transaction',
            label: '⛓️ Verify Proof On-Chain',
            href: `${baseUrl}/api/actions/verify`,
          },
        ],
      },
    });
  }

  const accept = req.headers.get('accept') || '';
  const isBrowser = accept.includes('text/html') && !accept.includes('application/json');
  if (isBrowser) {
    return Response.redirect(`${baseUrl}/verify/${proofId}`, 302);
  }

  const stored = await getProof(proofId);
  if (!stored) {
    return actionErrorResponse('Proof not found or expired', 404);
  }

  const meta = CIRCUIT_LABELS[stored.circuitName] || {
    title: stored.circuitName,
    emoji: '🔮',
  };

  const verifyDescription = `${stored.description}\n\nSubmit this pre-generated zk-SNARK proof to Solana's Groth16 verifier for trustless on-chain verification. You are not proving anything yourself — you are cryptographically verifying someone else's proof on-chain.`;

  return actionJsonResponse({
    type: 'action',
    icon: iconUrl,
    title: `${meta.emoji} zkRune — ${meta.title}`,
    description: verifyDescription,
    label: 'Verify Proof On-Chain',
    links: {
      actions: [
        {
          type: 'transaction',
          label: '⛓️ Verify Proof On-Chain',
          href: `${baseUrl}/api/actions/verify?id=${proofId}`,
        },
      ],
    },
  });
}

// ─── POST: Build and return a serialized transaction ─────────────────

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const proofId = searchParams.get('id');

    let circuitName: string;
    let proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] };
    let publicSignals: string[];

    if (proofId) {
      const stored = await getProof(proofId);
      if (!stored) {
        return actionErrorResponse('Proof not found or expired', 404);
      }
      circuitName = stored.circuitName;
      proof = stored.proof;
      publicSignals = stored.publicSignals;
    } else {
      const baseUrl = getBaseUrl(req);
      const generated = await generateDemoProof(baseUrl);
      circuitName = 'age-verification';
      proof = generated.proof;
      publicSignals = generated.publicSignals;
    }

    const body = await req.json();
    const account = body.account;
    if (!account) {
      return actionErrorResponse('Missing account (wallet public key)');
    }

    let signerPubkey: PublicKey;
    try {
      signerPubkey = new PublicKey(account);
    } catch {
      return actionErrorResponse('Invalid account public key');
    }

    const templateId = TEMPLATE_IDS[circuitName];
    if (templateId === undefined) {
      return actionErrorResponse(`Unsupported circuit for on-chain verification: ${circuitName}`);
    }

    let blockhash: string;
    let lastValidBlockHeight: number;
    try {
      const connection = new Connection(getRpcUrl(), 'confirmed');
      ({ blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed'));
    } catch {
      const fallback = new Connection(MAINNET_PUBLIC_RPC, 'confirmed');
      ({ blockhash, lastValidBlockHeight } = await fallback.getLatestBlockhash('confirmed'));
    }

    const ix = buildVerifyInstruction(
      templateId,
      proof,
      publicSignals,
    );

    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = signerPubkey;

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const meta = CIRCUIT_LABELS[circuitName] || { title: circuitName };

    return actionJsonResponse({
      type: 'transaction',
      transaction: serialized.toString('base64'),
      message: `Verifying zkRune ${meta.title} on Solana...`,
    });
  } catch (err: any) {
    console.error('[actions/verify POST]', err);
    return actionErrorResponse(err.message || 'Internal error', 500);
  }
}

// ─── OPTIONS: CORS preflight ────────────────────────────────────────

export async function OPTIONS() {
  return actionCorsPreflightResponse();
}

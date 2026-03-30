import { NextRequest } from 'next/server';
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js';
import { actionJsonResponse, actionCorsPreflightResponse, actionErrorResponse } from '@/lib/blinks/actionHeaders';
import { getProof } from '@/lib/blinks/proofStore';
import * as snarkjs from 'snarkjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const GROTH16_PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_GROTH16_VERIFIER_PROGRAM || '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad',
);

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

const TEMPLATE_IDS: Record<string, number> = {
  'age-verification': 0,
  'balance-proof': 1,
  'membership-proof': 2,
  'credential-proof': 3,
  'private-voting': 4,
  'nft-ownership': 5,
  'range-proof': 6,
  'hash-preimage': 7,
  'quadratic-voting': 8,
  'anonymous-reputation': 9,
  'token-swap': 10,
  'patience-proof': 11,
  'signature-verification': 12,
};

const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088696311157297823662689037894645226208583',
);

function fieldToBytes(decimalStr: string): Uint8Array {
  let n = BigInt(decimalStr);
  n = ((n % BN254_PRIME) + BN254_PRIME) % BN254_PRIME;
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(n & BigInt(0xff));
    n >>= BigInt(8);
  }
  return bytes;
}

function negateG1Y(point: string[]): string[] {
  const y = BigInt(point[1]);
  const negY = y === 0n ? 0n : BN254_PRIME - (y % BN254_PRIME);
  return [point[0], negY.toString()];
}

function g1ToBytes(point: string[]): Uint8Array {
  const out = new Uint8Array(64);
  out.set(fieldToBytes(point[0]), 0);
  out.set(fieldToBytes(point[1]), 32);
  return out;
}

function g2ToBytes(point: string[][]): Uint8Array {
  const out = new Uint8Array(128);
  out.set(fieldToBytes(point[0][1]), 0);
  out.set(fieldToBytes(point[0][0]), 32);
  out.set(fieldToBytes(point[1][1]), 64);
  out.set(fieldToBytes(point[1][0]), 96);
  return out;
}

function buildVerifyInstruction(
  templateId: number,
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] },
  publicInputs: string[],
  signer: PublicKey,
): TransactionInstruction {
  const size = 1 + 64 + 128 + 64 + publicInputs.length * 32;
  const data = new Uint8Array(size);
  let offset = 0;

  data[offset] = templateId;
  offset += 1;

  const negA = negateG1Y(proof.pi_a);
  data.set(g1ToBytes(negA), offset);
  offset += 64;

  data.set(g2ToBytes(proof.pi_b), offset);
  offset += 128;

  data.set(g1ToBytes(proof.pi_c), offset);
  offset += 64;

  for (const signal of publicInputs) {
    data.set(fieldToBytes(signal), offset);
    offset += 32;
  }

  return new TransactionInstruction({
    keys: [{ pubkey: signer, isSigner: true, isWritable: true }],
    programId: GROTH16_PROGRAM,
    data: Buffer.from(data),
  });
}

const MAINNET_PUBLIC_RPC = 'https://api.mainnet-beta.solana.com';

function getRpcUrl(): string {
  return process.env.HELIUS_RPC_URL
    || process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    || MAINNET_PUBLIC_RPC;
}

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

const DEMO_DESCRIPTION = 'Zero-knowledge proof that the user meets the minimum age requirement (18+), generated with zkRune. No personal data is revealed.';

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
      return Response.redirect(`${baseUrl}/zkblink`, 302);
    }

    return actionJsonResponse({
      type: 'action',
      icon: iconUrl,
      title: '🎂 zkRune — Age Verification',
      description: DEMO_DESCRIPTION,
      label: 'Verify On-Chain',
      links: {
        actions: [
          {
            type: 'transaction',
            label: '⛓️ Verify On-Chain',
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

  return actionJsonResponse({
    type: 'action',
    icon: iconUrl,
    title: `${meta.emoji} zkRune — ${meta.title}`,
    description: stored.description,
    label: 'Verify On-Chain',
    links: {
      actions: [
        {
          type: 'transaction',
          label: '⛓️ Verify On-Chain',
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
      signerPubkey,
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

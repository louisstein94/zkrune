import { NextRequest } from 'next/server';
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js';
import { actionJsonResponse, actionCorsPreflightResponse, actionErrorResponse } from '@/lib/blinks/actionHeaders';
import { getProof } from '@/lib/blinks/proofStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const GROTH16_PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_GROTH16_VERIFIER_PROGRAM || '9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad',
);

const CIRCUIT_LABELS: Record<string, { title: string; emoji: string }> = {
  'balance-proof':          { title: 'Anonim Bakiye Kanıtı',        emoji: '💰' },
  'whale-holder':           { title: 'Balina Doğrulaması',          emoji: '🐋' },
  'age-verification':       { title: 'Yaş Doğrulaması',             emoji: '🎂' },
  'membership-proof':       { title: 'Üyelik Kanıtı',               emoji: '🏛️' },
  'private-voting':         { title: 'Gizli Oy',                    emoji: '🗳️' },
  'quadratic-voting':       { title: 'Kuadratik Oy',                emoji: '📊' },
  'credential-proof':       { title: 'Kimlik Bilgisi Kanıtı',       emoji: '🪪' },
  'anonymous-reputation':   { title: 'Anonim İtibar Kanıtı',        emoji: '⭐' },
  'nft-ownership':          { title: 'NFT Sahiplik Kanıtı',         emoji: '🖼️' },
  'range-proof':            { title: 'Aralık Kanıtı',               emoji: '📏' },
  'hash-preimage':          { title: 'Hash Ön-Görüntü Kanıtı',      emoji: '🔐' },
  'signature-verification': { title: 'İmza Doğrulaması',            emoji: '✍️' },
  'token-swap':             { title: 'Token Swap Kanıtı',           emoji: '🔄' },
  'patience-proof':         { title: 'Sabır Kanıtı',                emoji: '⏳' },
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

function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
}

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'zkrune.xyz';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

// ─── GET: Return Action metadata for Blink unfurl ───────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const proofId = searchParams.get('id');

  if (!proofId) {
    return actionErrorResponse('Missing proof id');
  }

  const stored = await getProof(proofId);
  if (!stored) {
    return actionErrorResponse('Proof not found or expired', 404);
  }

  const meta = CIRCUIT_LABELS[stored.circuitName] || {
    title: stored.circuitName,
    emoji: '🔮',
  };

  const baseUrl = getBaseUrl(req);
  const iconUrl = `${baseUrl}/zkrune-log.png`;

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

    if (!proofId) {
      return actionErrorResponse('Missing proof id');
    }

    const stored = await getProof(proofId);
    if (!stored) {
      return actionErrorResponse('Proof not found or expired', 404);
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

    const templateId = TEMPLATE_IDS[stored.circuitName];
    if (templateId === undefined) {
      return actionErrorResponse(`Unsupported circuit for on-chain verification: ${stored.circuitName}`);
    }

    const connection = new Connection(getRpcUrl(), 'confirmed');
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

    const ix = buildVerifyInstruction(
      templateId,
      stored.proof,
      stored.publicSignals,
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

    const meta = CIRCUIT_LABELS[stored.circuitName] || { title: stored.circuitName };

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

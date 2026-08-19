import { NextRequest } from 'next/server';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import {
  actionJsonResponse,
  actionCorsPreflightResponse,
  actionErrorResponse,
} from '@/lib/blinks/actionHeaders';
import {
  TEMPLATE_IDS,
  MAINNET_PUBLIC_RPC,
  getRpcUrl,
  buildVerifyInstruction,
} from '@/lib/blinks/groth16Tx';
import * as snarkjs from 'snarkjs';
import { poseidon2 } from 'poseidon-lite';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

// Tokenized-RWA eligibility Blink.
//
// Tokenized-RWA venues (Robinhood Chain, xStocks, Ondo, etc.) need to
// know a holder is *eligible* to trade — accredited / KYC-cleared / in an
// allowed jurisdiction — before a transfer clears. Today that check
// either doesn't exist on-chain or is done by handing PII to a central
// KYC provider.
//
// This Blink demonstrates the alternative: the holder proves they hold a
// valid, unexpired issuer-attested eligibility credential without
// revealing the credential itself, and the proof is verified on-chain by
// the Groth16 verifier program. zkRune verifies the issuer's attestation;
// it does not establish accreditation itself.
const CIRCUIT = 'credential-proof';

// Stand-in for a credential an issuer (broker, KYC provider) handed to a
// holder. In production the holder keeps the secret and the issuer publishes
// only the commitment; here both sides live in this file so the Blink can
// demonstrate the flow end to end.
const CREDENTIAL_SECRET = '874512369874125369874125';

// Far-future expiry so the demo credential is always unexpired. The expiry is
// hashed into the commitment, so it cannot be extended without invalidating it.
const CREDENTIAL_VALID_UNTIL = '4102444800'; // 2100-01-01

// The commitment the issuer publishes: Poseidon(credentialSecret, validUntil).
// Only a party holding the preimage can satisfy the circuit against it.
function attestedCommitment(): string {
  return poseidon2([BigInt(CREDENTIAL_SECRET), BigInt(CREDENTIAL_VALID_UNTIL)]).toString();
}

const ELIGIBILITY_DESCRIPTION =
  'Prove you hold a valid, unexpired issuer-attested eligibility credential ' +
  '(e.g. accredited-investor or KYC-cleared status) without revealing the ' +
  'credential itself. The zk-SNARK proof is submitted to Solana\'s Groth16 ' +
  'verifier program for trustless on-chain verification. No personal data is ' +
  'revealed — only that a valid, unexpired credential exists.';

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

async function generateEligibilityProof(baseUrl: string) {
  if (cachedProof) return cachedProof;

  const [wasmResp, zkeyResp] = await Promise.all([
    fetch(`${baseUrl}/circuits/${CIRCUIT}.wasm`),
    fetch(`${baseUrl}/circuits/${CIRCUIT}.zkey`),
  ]);

  if (!wasmResp.ok || !zkeyResp.ok) {
    throw new Error('Failed to fetch circuit files for proof generation');
  }

  const wasmBuf = new Uint8Array(await wasmResp.arrayBuffer());
  const zkeyBuf = new Uint8Array(await zkeyResp.arrayBuffer());

  const currentTime = Math.floor(Date.now() / 1000);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      credentialSecret: CREDENTIAL_SECRET,
      validUntil: CREDENTIAL_VALID_UNTIL,
      currentTime: String(currentTime),
      expectedHash: attestedCommitment(),
    },
    { type: 'mem', data: wasmBuf } as any,
    { type: 'mem', data: zkeyBuf } as any,
  );

  cachedProof = { proof, publicSignals };
  return cachedProof;
}

// ─── GET: Return Action metadata for Blink unfurl ───────────────────

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const iconUrl = `${baseUrl}/zkrune-log.png`;

  const accept = req.headers.get('accept') || '';
  const isBrowser = accept.includes('text/html') && !accept.includes('application/json');
  if (isBrowser) {
    return Response.redirect(`${baseUrl}/verify-proof`, 302);
  }

  return actionJsonResponse({
    type: 'action',
    icon: iconUrl,
    title: 'zkRune — Tokenized-RWA Eligibility',
    description: ELIGIBILITY_DESCRIPTION,
    label: 'Verify Eligibility On-Chain',
    links: {
      actions: [
        {
          type: 'transaction',
          label: 'Verify Eligibility On-Chain',
          href: `${baseUrl}/api/actions/eligibility`,
        },
      ],
    },
  });
}

// ─── POST: Build and return a serialized transaction ─────────────────

export async function POST(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl(req);
    const { proof, publicSignals } = await generateEligibilityProof(baseUrl);

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

    const templateId = TEMPLATE_IDS[CIRCUIT];
    if (templateId === undefined) {
      return actionErrorResponse(`Unsupported circuit for on-chain verification: ${CIRCUIT}`);
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

    const ix = buildVerifyInstruction(templateId, proof, publicSignals);

    const tx = new Transaction();
    tx.add(ix);
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = signerPubkey;

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return actionJsonResponse({
      type: 'transaction',
      transaction: serialized.toString('base64'),
      message: 'Verifying zkRune Tokenized-RWA Eligibility on Solana...',
    });
  } catch (err: any) {
    console.error('[actions/eligibility POST]', err);
    return actionErrorResponse(err.message || 'Internal error', 500);
  }
}

// ─── OPTIONS: CORS preflight ────────────────────────────────────────

export async function OPTIONS() {
  return actionCorsPreflightResponse();
}

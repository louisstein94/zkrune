import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import * as snarkjs from 'snarkjs';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  ACCREDITATION_TIERS,
  buildCircuitInput,
  buildJurisdictionAllowlist,
  createIssuerKeypair,
  issueCredential,
  subjectCommitment,
} from '@/lib/rwa/credential';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Private-offering eligibility, demonstrated end to end.
//
// Every party in the flow is simulated here so the whole thing can run from a
// single request: an issuer signs a credential, a venue publishes its policy,
// and a holder proves eligibility. In a real deployment the issuer key lives
// in an HSM, the holder's secret never leaves their device, and only the proof
// crosses the network.
//
// On-chain verification runs against Solana devnet. The circuit is registered
// with the mainnet verifier as template 13 only once that program is upgraded;
// until then this endpoint reports devnet, and says so. The chain step is
// skipped entirely when no devnet payer is configured, so the demo still
// answers with a locally verified proof rather than failing.

const CIRCUIT = 'rwa-eligibility';
const TEMPLATE_ID = 13;
const DEVNET_RPC = 'https://api.devnet.solana.com';

const GERMANY = 276;
const FRANCE = 250;

const BN254_PRIME = BigInt(
  '21888242871839275222246405745257275088696311157297823662689037894645226208583',
);

function fieldToBytes(decimal: string): Uint8Array {
  let n = BigInt(decimal) % BN254_PRIME;
  if (n < 0n) n += BN254_PRIME;
  const out = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(n & 255n);
    n >>= 8n;
  }
  return out;
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

/** The verifier expects the negated A point. */
function negateG1Y(point: string[]): string[] {
  return [point[0], ((BN254_PRIME - (BigInt(point[1]) % BN254_PRIME)) % BN254_PRIME).toString(), point[2]];
}

function baseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'zkrune.com';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

function devnetPayer(): Keypair | null {
  const raw = process.env.DEVNET_DEMO_PAYER_KEY?.trim();
  if (!raw) return null;
  try {
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
  } catch {
    return null;
  }
}

async function submitToDevnet(
  proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] },
  publicSignals: string[],
): Promise<{ signature: string } | { error: string }> {
  const payer = devnetPayer();
  if (!payer) return { error: 'no devnet payer configured' };

  const programId = process.env.NEXT_PUBLIC_RWA_VERIFIER_PROGRAM_DEVNET;
  if (!programId) return { error: 'no devnet verifier program configured' };

  const data = new Uint8Array(1 + 64 + 128 + 64 + publicSignals.length * 32);
  let offset = 0;
  data[offset] = TEMPLATE_ID;
  offset += 1;
  data.set(g1ToBytes(negateG1Y(proof.pi_a)), offset);
  offset += 64;
  data.set(g2ToBytes(proof.pi_b), offset);
  offset += 128;
  data.set(g1ToBytes(proof.pi_c), offset);
  offset += 64;
  for (const signal of publicSignals) {
    data.set(fieldToBytes(signal), offset);
    offset += 32;
  }

  const connection = new Connection(DEVNET_RPC, 'confirmed');
  const tx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }))
    .add(
      new TransactionInstruction({
        keys: [],
        programId: new PublicKey(programId),
        data: Buffer.from(data),
      }),
    );

  try {
    const signature = await connection.sendTransaction(tx, [payer]);
    await connection.confirmTransaction(signature, 'confirmed');
    return { signature };
  } catch (e) {
    return { error: e instanceof Error ? e.message.slice(0, 200) : 'submission failed' };
  }
}

export async function POST(req: NextRequest) {
  const started = Date.now();

  try {
    const url = baseUrl(req);
    const [wasmResp, zkeyResp, vkeyResp] = await Promise.all([
      fetch(`${url}/circuits/${CIRCUIT}.wasm`),
      fetch(`${url}/circuits/${CIRCUIT}.zkey`),
      fetch(`${url}/circuits/${CIRCUIT}_vkey.json`),
    ]);
    if (!wasmResp.ok || !zkeyResp.ok || !vkeyResp.ok) {
      return NextResponse.json({ error: 'circuit artifacts unavailable' }, { status: 503 });
    }

    const now = Math.floor(Date.now() / 1000);

    // ── Issuer: signs a claim about a commitment it cannot open ──────
    const issuer = await createIssuerKeypair(randomBytes(32));

    // ── Holder: generates their own secret ──────────────────────────
    const subjectSecret = BigInt('0x' + randomBytes(31).toString('hex'));

    // Short validity is the revocation story until revocation ships.
    const credential = await issueCredential(issuer, {
      subjectCommitment: await subjectCommitment(subjectSecret),
      accreditationTier: ACCREDITATION_TIERS.QUALIFIED_PURCHASER,
      jurisdictionCode: GERMANY,
      issuedAt: now - 60,
      expiresAt: now + 30 * 86_400,
    });

    // ── Venue: publishes the countries it serves ─────────────────────
    const allowlist = await buildJurisdictionAllowlist([GERMANY, FRANCE]);
    const policyId = '1001';
    const sessionNonce = String(BigInt('0x' + randomBytes(8).toString('hex')));

    const input = buildCircuitInput({
      subjectSecret,
      credential,
      issuerPublicKey: issuer.publicKey,
      jurisdictionPath: allowlist.pathFor(credential.jurisdictionCode),
      jurisdictionRoot: allowlist.root,
      requiredTier: ACCREDITATION_TIERS.ACCREDITED,
      currentTime: now,
      policyId,
      sessionNonce,
    });

    const provingStarted = Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      new Uint8Array(await wasmResp.arrayBuffer()),
      new Uint8Array(await zkeyResp.arrayBuffer()),
    );
    const provingMs = Date.now() - provingStarted;

    const vkey = await vkeyResp.json();
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    const chain = verified
      ? await submitToDevnet(proof, publicSignals)
      : { error: 'proof did not verify locally' };

    return NextResponse.json({
      verified,
      provingMs,
      totalMs: Date.now() - started,
      nullifier: publicSignals[0],
      publicSignalCount: publicSignals.length,
      // What a venue configures, and what it never sees.
      policy: {
        requiredTier: 'ACCREDITED',
        jurisdictionsServed: [GERMANY, FRANCE],
        issuerPublicKey: issuer.publicKey.Ax,
      },
      undisclosed: ['identity', 'jurisdiction', 'accreditation tier', 'credential'],
      onChain:
        'signature' in chain
          ? {
              cluster: 'devnet',
              signature: chain.signature,
              explorer: `https://explorer.solana.com/tx/${chain.signature}?cluster=devnet`,
              note: 'Verified against the Groth16 verifier on Solana devnet. Mainnet follows the verifier upgrade.',
            }
          : { cluster: 'devnet', unavailable: chain.error },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message.slice(0, 300) : 'demo failed' },
      { status: 500 },
    );
  }
}

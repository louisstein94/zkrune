import { NextRequest, NextResponse } from 'next/server';
import { getProof } from '@/lib/blinks/proofStore';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const stored = await getProof(id);
  if (!stored) {
    return NextResponse.json({ error: 'Proof not found or expired' }, { status: 404 });
  }

  return NextResponse.json({
    id: stored.id,
    circuitName: stored.circuitName,
    label: stored.label,
    description: stored.description,
    publicSignals: stored.publicSignals,
    proof: {
      pi_a: stored.proof.pi_a,
      pi_b: stored.proof.pi_b,
      pi_c: stored.proof.pi_c,
      protocol: stored.proof.protocol,
      curve: stored.proof.curve,
    },
    createdAt: new Date(stored.createdAt).toISOString(),
    expiresAt: new Date(stored.expiresAt).toISOString(),
    verifiedOffChain: stored.verifiedOffChain,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { Snapshot } from '@/lib/merkle';

// Cache snapshot in module memory (survives across requests in the same process)
let _snapshot: Snapshot | null = null;

function loadSnapshot(): Snapshot | null {
  if (_snapshot) return _snapshot;

  const filePath = path.join(process.cwd(), 'data', 'snapshot.json');
  if (!fs.existsSync(filePath)) return null;

  try {
    _snapshot = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Snapshot;
    return _snapshot;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
  }

  const snapshot = loadSnapshot();

  if (!snapshot) {
    return NextResponse.json(
      {
        error: 'Snapshot not found. Run: npx ts-node scripts/snapshot-holders.ts',
        hint: 'The operator must generate the snapshot before proofs can be created.',
      },
      { status: 503 },
    );
  }

  const entry = snapshot.entries[address];

  if (!entry) {
    return NextResponse.json(
      {
        error: 'Address not found in snapshot',
        hint: 'You may have acquired tokens after the snapshot was taken.',
        snapshotTimestamp: snapshot.meta.timestamp,
        snapshotBlock: snapshot.meta.blockHeight,
      },
      { status: 404 },
    );
  }

  // Return everything the frontend needs to build the ZK proof inputs.
  // All bigint values are serialized as decimal strings.
  return NextResponse.json({
    address,
    balance: entry.balance,           // decimal string (bigint) — parse with BigInt()
    index: entry.index,
    pathElements: entry.pathElements, // decimal string[]
    pathIndices: entry.pathIndices,
    root: snapshot.meta.root,         // decimal string
    snapshotTimestamp: snapshot.meta.timestamp,
    snapshotBlock: snapshot.meta.blockHeight,
    totalHolders: snapshot.meta.totalHolders,
  });
}

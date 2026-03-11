import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'snapshot-meta.json');

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Snapshot metadata not found. Run the snapshot script first.' },
      { status: 503 },
    );
  }

  const meta = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return NextResponse.json(meta);
}

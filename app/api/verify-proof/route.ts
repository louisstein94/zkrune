import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 30;

// Circuit names the server trusts — must match filenames in public/circuits/
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

// No circuits currently under maintenance.
const CIRCUITS_UNDER_MAINTENANCE = new Set<string>();

async function loadTrustedVKey(circuitName: string): Promise<object | null> {
  if (!TRUSTED_CIRCUITS.has(circuitName)) return null;
  // vKey files live in public/circuits/ — served statically but also readable server-side
  const vkeyPath = path.join(process.cwd(), 'public', 'circuits', `${circuitName}_vkey.json`);
  try {
    const raw = await fs.readFile(vkeyPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Client sends proof + publicSignals + circuitName — NOT the vKey
    const { proof, publicSignals, circuitName } = await request.json();

    if (!proof || !publicSignals || !circuitName) {
      return NextResponse.json(
        { error: "Missing proof, publicSignals, or circuitName" },
        { status: 400 }
      );
    }

    // Reject circuits whose artifacts are being regenerated
    if (CIRCUITS_UNDER_MAINTENANCE.has(circuitName)) {
      return NextResponse.json(
        {
          error: `Circuit "${circuitName}" is temporarily under maintenance while its trusted setup is being updated. Please try again later.`,
          maintenance: true,
        },
        { status: 503 }
      );
    }

    // Load verification key from server filesystem — never trust client-supplied vKey
    const vKey = await loadTrustedVKey(circuitName);
    if (!vKey) {
      return NextResponse.json(
        { error: `Unknown or unsupported circuit: ${circuitName}` },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    try {
      // @ts-ignore
      const snarkjs = await import("snarkjs");
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      const timing = Date.now() - startTime;

      return NextResponse.json(
        {
          success: true,
          isValid,
          circuitName,
          message: isValid
            ? "Proof cryptographically verified!"
            : "Proof verification failed",
          timing,
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        isValid: false,
        error: error.message,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Verification failed: " + error.message },
      { status: 500 }
    );
  }
}


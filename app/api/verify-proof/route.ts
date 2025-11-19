import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - Import snarkjs at module level for better caching
import * as snarkjs from "snarkjs";

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30; // Allow up to 30 seconds

export async function POST(request: NextRequest) {
  try {
    const { proof, publicSignals, vKey } = await request.json();

    if (!proof || !publicSignals || !vKey) {
      return NextResponse.json(
        { error: "Missing proof, publicSignals, or vKey" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    try {
      // Use snarkjs library directly (no file writes!)

      // Verify proof using snarkjs
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      const timing = Date.now() - startTime;

      return NextResponse.json(
        {
          success: true,
          isValid,
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


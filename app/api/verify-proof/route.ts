import { NextRequest, NextResponse } from "next/server";

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
      // @ts-ignore
      const snarkjs = await import("snarkjs");

      // Verify proof using snarkjs
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      const timing = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        isValid,
        message: isValid
          ? "Proof cryptographically verified!"
          : "Proof verification failed",
        timing,
      });
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


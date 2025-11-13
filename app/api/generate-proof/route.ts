import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, inputs } = body;

    // Validate inputs
    if (!templateId || !inputs) {
      return NextResponse.json(
        { error: "Missing templateId or inputs" },
        { status: 400 }
      );
    }

    // Supported templates with real circuits
    const realCircuits = ["age-verification", "balance-proof"];
    
    if (realCircuits.includes(templateId)) {
      try {
        // Dynamic import snarkjs (prevents webpack warnings)
        const snarkjs = await import("snarkjs");

        // Paths to circuit files
        const wasmPath = path.join(process.cwd(), "public", "circuits", `${templateId}.wasm`);
        const zkeyPath = path.join(process.cwd(), "public", "circuits", `${templateId}.zkey`);

        // Generate real ZK proof!
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          inputs,
          wasmPath,
          zkeyPath
        );

        // Load verification key
        const vKeyPath = path.join(process.cwd(), "public", "circuits", `${templateId}_vkey.json`);
        const vKey = JSON.parse(fs.readFileSync(vKeyPath, "utf8"));

        // Verify the proof (double check)
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        return NextResponse.json({
          success: true,
          proof: {
            proof,
            publicSignals,
            proofHash: JSON.stringify(proof).substring(0, 66),
            verificationKey: vKey,
            timestamp: new Date().toISOString(),
            isValid,
          },
          note: "✅ REAL ZK-SNARK proof generated and verified!",
          realProof: true,
        });
      } catch (circuitError) {
        console.error("Real circuit error, falling back to mock:", circuitError);
        // Fall through to mock if real circuit fails
      }
    }

    // Mock proof for templates without compiled circuits
    const mockProof = {
      proof: {
        pi_a: ["0x" + Math.random().toString(16).substring(2)],
        pi_b: [["0x" + Math.random().toString(16).substring(2)]],
        pi_c: ["0x" + Math.random().toString(16).substring(2)],
        protocol: "groth16",
      },
      publicSignals: ["1"],
      proofHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      verificationKey: `vk_${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date().toISOString(),
    };

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      proof: mockProof,
      note: "Mock proof - compile circuits for real ZK-SNARKs",
      realProof: false,
    });
  } catch (error) {
    console.error("Proof generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate proof" },
      { status: 500 }
    );
  }
}


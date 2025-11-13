import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    console.log("🧪 Testing real ZK proof generation...");
    
    const circuitDir = path.join(process.cwd(), "circuits", "age-verification");
    const publicDir = path.join(process.cwd(), "public", "circuits");
    
    console.log("Circuit dir:", circuitDir);
    console.log("Public dir:", publicDir);
    
    // Use example files (already exist)
    const witnessCmd = `node ${circuitDir}/circuit_js/generate_witness.js ${publicDir}/age-verification.wasm ${circuitDir}/example_input.json ${circuitDir}/test_witness.wtns`;
    console.log("Running:", witnessCmd);
    
    await execAsync(witnessCmd);
    console.log("✓ Witness done");
    
    const proveCmd = `snarkjs groth16 prove ${publicDir}/age-verification.zkey ${circuitDir}/test_witness.wtns ${circuitDir}/test_proof.json ${circuitDir}/test_public.json`;
    console.log("Running:", proveCmd);
    
    await execAsync(proveCmd);
    console.log("✓ Proof done");
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      message: "Real ZK proof generated successfully!",
      timing: totalTime,
      note: `Generated in ${(totalTime / 1000).toFixed(2)}s`,
    });
  } catch (error: any) {
    console.error("Test error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stderr: error.stderr,
    });
  }
}


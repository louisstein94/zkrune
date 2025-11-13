import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

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

    // Write temp files
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const proofPath = path.join(tempDir, `proof_${Date.now()}.json`);
    const publicPath = path.join(tempDir, `public_${Date.now()}.json`);
    const vKeyPath = path.join(tempDir, `vkey_${Date.now()}.json`);

    fs.writeFileSync(proofPath, JSON.stringify(proof));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals));
    fs.writeFileSync(vKeyPath, JSON.stringify(vKey));

    try {
      // Verify with snarkjs CLI
      const verifyCmd = `snarkjs groth16 verify ${vKeyPath} ${publicPath} ${proofPath}`;
      const { stdout, stderr } = await execAsync(verifyCmd);

      const isValid = stdout.includes("OK");
      const timing = Date.now() - startTime;

      // Cleanup
      fs.unlinkSync(proofPath);
      fs.unlinkSync(publicPath);
      fs.unlinkSync(vKeyPath);

      return NextResponse.json({
        success: true,
        isValid,
        message: isValid
          ? "Proof cryptographically verified!"
          : "Proof verification failed",
        timing,
        output: stdout,
      });
    } catch (error: any) {
      // Cleanup on error
      [proofPath, publicPath, vKeyPath].forEach((p) => {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });

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


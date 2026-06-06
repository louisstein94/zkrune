import { NextResponse } from "next/server";
import path from "path";

import { AgentPassport } from "@/packages/zkrune-agent/src/passport";
import { privateKeySigner } from "@/packages/zkrune-agent/src/crypto";
import type { Groth16Proof, ProofBackend } from "@/packages/zkrune-agent/src/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 30;

const WASM = path.join(process.cwd(), "public", "circuits", "signature-verification.wasm");
const ZKEY = path.join(process.cwd(), "public", "circuits", "signature-verification.zkey");

function randomKey(): Uint8Array {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Mints a fresh passport and attests a sample action server-side, returning the
 * two headers. Powers the verifier page's "Load live example" — the example is
 * always fresh (current timestamp) and a genuinely valid Groth16 proof.
 */
export async function GET() {
  try {
    // @ts-ignore — snarkjs ships no types
    const snarkjs = await import("snarkjs");

    const backend: ProofBackend = {
      async prove(inputs) {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
          { R8x: inputs.R8x, R8y: inputs.R8y, S: inputs.S, Ax: inputs.Ax, Ay: inputs.Ay, M: inputs.M },
          WASM,
          ZKEY,
        );
        return { proof: proof as Groth16Proof, publicSignals };
      },
      async verify() {
        return true;
      },
    };

    const passport = await AgentPassport.mint({
      humanSigner: privateKeySigner(randomKey()),
      agentSigner: privateKeySigner(randomKey()),
      policy: { maxSpend: "500 USDC", onlyDomains: ["*.example.com"], humanInLoop: false },
      backend,
    });

    const headers = await passport.attest({
      action: {
        method: "POST",
        target: "https://api.example.com/pay",
        amount: "120 USDC",
        externalId: "intent_demo",
      },
    });

    return NextResponse.json(
      { passport: headers["X-zkRune-Passport"], action: headers["X-zkRune-Action"] },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Example generation failed: " + error.message }, { status: 500 });
  }
}

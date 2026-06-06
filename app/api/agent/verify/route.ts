import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

import { verifyAttestation } from "@/packages/zkrune-agent/src/verify";
import { decodeEnvelope } from "@/packages/zkrune-agent/src/encoding";
import type {
  ActionAttestation,
  Groth16Proof,
  PassportEnvelope,
  ProofBackend,
} from "@/packages/zkrune-agent/src/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 30;

// Light mode (v1) reuses the already-ceremonied signature-verification circuit.
const CIRCUIT = "signature-verification";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-zkRune-Passport, X-zkRune-Action",
};

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

async function loadVKey(): Promise<object | null> {
  // Filesystem-first, matching app/api/verify-proof/route.ts. vKey is server-
  // trusted and never taken from the client.
  const vkeyPath = path.join(process.cwd(), "public", "circuits", `${CIRCUIT}_vkey.json`);
  try {
    return JSON.parse(await fs.readFile(vkeyPath, "utf-8"));
  } catch {
    return null;
  }
}

/** Server-side verify-only backend: Groth16 verification against the trusted vKey. */
function makeBackend(vKey: object): ProofBackend {
  return {
    async prove() {
      throw new Error("proving is not available server-side");
    },
    async verify(proof: Groth16Proof, publicSignals: string[]) {
      // @ts-ignore — snarkjs ships no types
      const snarkjs = await import("snarkjs");
      return snarkjs.groth16.verify(vKey, publicSignals, proof);
    },
  };
}

function short(pubkey: [string, string]): string {
  return `${pubkey[0].slice(0, 8)}…`;
}

/** Translate the check results into human-readable "green check" lines. */
function buildClaims(
  envelope: PassportEnvelope,
  attestation: ActionAttestation,
  checks: Record<string, boolean>,
  now: number,
): string[] {
  const claims: string[] = [];
  if (checks.delegationValid) {
    claims.push(`Authorized by human key ${short(envelope.humanPubkey)}`);
  }
  if (checks.proofValid && checks.messageBindingValid) {
    claims.push(`Action cryptographically bound: ${attestation.action.method} ${attestation.action.target}`);
  }
  if (checks.signerMatchesPolicy && envelope.policy.humanInLoop) {
    claims.push(`Human-in-the-loop approval present (signed ${now - attestation.issuedAt}s ago)`);
  }
  if (checks.fresh && !envelope.policy.humanInLoop) {
    claims.push(`Fresh agent action (signed ${now - attestation.issuedAt}s ago)`);
  }
  return claims;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Accept headers (the on-the-wire form) OR a JSON body carrying the base64
    // envelopes (convenient for curl / the verifier UI).
    let passportB64 = request.headers.get("X-zkRune-Passport") ?? undefined;
    let actionB64 = request.headers.get("X-zkRune-Action") ?? undefined;
    let ttlSeconds: number | undefined;

    if (!passportB64 || !actionB64) {
      try {
        const body = await request.json();
        passportB64 = passportB64 ?? body.passport;
        actionB64 = actionB64 ?? body.action;
        ttlSeconds = body.ttlSeconds;
      } catch {
        // no body — fall through to the missing-input error
      }
    }

    if (!passportB64 || !actionB64) {
      return NextResponse.json(
        { error: "Provide X-zkRune-Passport and X-zkRune-Action headers, or a JSON body { passport, action }." },
        { status: 400, headers: { ...CORS_HEADERS, ...NO_STORE } },
      );
    }

    const vKey = await loadVKey();
    if (!vKey) {
      return NextResponse.json(
        { error: `Verification key for ${CIRCUIT} not available on the server.` },
        { status: 503, headers: { ...CORS_HEADERS, ...NO_STORE } },
      );
    }

    const headers = { "X-zkRune-Passport": passportB64, "X-zkRune-Action": actionB64 };
    const result = await verifyAttestation(headers, makeBackend(vKey), { ttlSeconds });

    // Decode (again) for display only — non-sensitive echo + claim lines.
    let claims: string[] = [];
    let passportSummary: object | undefined;
    try {
      const envelope = decodeEnvelope<PassportEnvelope>(passportB64);
      const attestation = decodeEnvelope<ActionAttestation>(actionB64);
      const now = Math.floor(Date.now() / 1000);
      claims = buildClaims(envelope, attestation, result.checks, now);
      passportSummary = {
        agentPubkey: short(envelope.agentPubkey),
        humanPubkey: short(envelope.humanPubkey),
        policy: envelope.policy,
        expiry: envelope.expiry,
      };
    } catch {
      // ignore — result.reasons already explains a malformed envelope
    }

    return NextResponse.json(
      {
        verified: result.ok,
        checks: result.checks,
        reasons: result.reasons,
        claims,
        passport: passportSummary,
        circuit: CIRCUIT,
        timing: Date.now() - startTime,
      },
      { headers: { ...CORS_HEADERS, ...NO_STORE } },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Verification failed: " + error.message },
      { status: 500, headers: { ...CORS_HEADERS, ...NO_STORE } },
    );
  }
}

export async function GET() {
  // Minimal descriptor so the endpoint is discoverable via curl.
  return NextResponse.json(
    {
      service: "zkAgent Passport — stateless verifier (light mode v1)",
      circuit: CIRCUIT,
      usage: {
        method: "POST",
        inputs: "X-zkRune-Passport + X-zkRune-Action headers, or JSON body { passport, action, ttlSeconds? }",
        proves: ["delegated authority", "human-in-the-loop", "freshness"],
      },
      stateless: true,
    },
    { headers: { ...CORS_HEADERS, ...NO_STORE } },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

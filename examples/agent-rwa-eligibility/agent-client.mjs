/**
 * An autonomous agent accessing a gated tokenized-RWA venue.
 *
 * This is the client side of the x402-style loop: the agent hits the resource,
 * reads the eligibility challenge it gets back, satisfies it by generating a
 * zero-knowledge credential-proof, and retries. No personal data leaves the
 * agent — only a Groth16 proof that a valid, unexpired credential exists.
 *
 *   npm install
 *   node gate-server.mjs        # in one shell
 *   node agent-client.mjs       # in another
 */

import * as snarkjs from "snarkjs";

const VENUE_URL = process.env.VENUE_URL || "http://localhost:4021/rwa/trade";

// Where the circuit artifacts are served from. Defaults to the live site; the
// wasm + zkey ship under /circuits and are safe to fetch client-side.
const ZKRUNE_BASE_URL = process.env.ZKRUNE_BASE_URL || "https://zkrune.com";

// The agent's issuer-attested eligibility credential. In production this is
// held by the agent's principal (issued by a broker / KYC provider); here we
// use the demo credential the gate is configured to trust.
const CREDENTIAL_HASH =
  process.env.CREDENTIAL_HASH ||
  "19536091450159168716976043526403471833495232309085654850701509158709717589851";

async function generateEligibilityProof() {
  const [wasm, zkey] = await Promise.all([
    fetch(`${ZKRUNE_BASE_URL}/circuits/credential-proof.wasm`).then((r) => r.arrayBuffer()),
    fetch(`${ZKRUNE_BASE_URL}/circuits/credential-proof.zkey`).then((r) => r.arrayBuffer()),
  ]);

  const currentTime = Math.floor(Date.now() / 1000);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      credentialHash: CREDENTIAL_HASH,
      credentialSecret: "1",
      validUntil: "4102444800", // 2100-01-01
      currentTime: String(currentTime),
      expectedHash: CREDENTIAL_HASH,
    },
    new Uint8Array(wasm),
    new Uint8Array(zkey)
  );

  return { proof, publicSignals };
}

// The gate expects base64(JSON.stringify({ proof, publicSignals })).
function encodeEnvelope(proof, publicSignals) {
  return Buffer.from(JSON.stringify({ proof, publicSignals })).toString("base64");
}

async function main() {
  // 1. Try the resource with no proof — expect a 403 eligibility challenge.
  const first = await fetch(VENUE_URL, { method: "POST", body: "{}" });
  console.log(`[1] no proof        -> ${first.status}`);
  if (first.status !== 403) {
    console.log("    unexpected — is the gate server running?");
    console.log("   ", await first.text());
    process.exit(1);
  }
  const challenge = await first.json();
  console.log(`    challenge: prove "${challenge.circuit}" at ${challenge.generateProofAt}`);

  // 2. Satisfy the challenge: generate the required proof, revealing nothing.
  console.log("[2] generating credential-proof (zk-SNARK) ...");
  const { proof, publicSignals } = await generateEligibilityProof();

  // 3. Retry with the proof headers — the gate verifies it on Base, no gas.
  const second = await fetch(VENUE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-zkRune-Circuit": challenge.circuit,
      "X-zkRune-Proof": encodeEnvelope(proof, publicSignals),
    },
    body: "{}",
  });
  console.log(`[3] with proof      -> ${second.status}`);
  console.log("   ", await second.text());
  process.exit(second.status === 200 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

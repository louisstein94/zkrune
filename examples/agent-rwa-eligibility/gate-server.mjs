/**
 * A gated tokenized-RWA venue.
 *
 * x402 answers "who paid?". zkRune answers "who is allowed?". Before this
 * endpoint authorizes a tokenized-stock trade it requires the caller to prove,
 * in zero knowledge, that they hold a valid, unexpired issuer-attested
 * eligibility credential (accredited / KYC-cleared) — without ever seeing the
 * credential or any personal data.
 *
 * The gate mirrors the x402 challenge/retry loop:
 *   1. request with no proof   -> 403 with a zkRune eligibility challenge
 *   2. caller generates a credential-proof (see agent-client.mjs)
 *   3. retry with X-zkRune-Proof + X-zkRune-Circuit -> 200
 *
 * The proof is verified on-chain against the zkRune verifier on Base via a
 * view call — server-enforced, ~50ms, no gas.
 *
 *   npm install
 *   node gate-server.mjs
 */

import http from "node:http";
import { evaluateZkRuneGate } from "@zkrune/x402-verify";

const PORT = process.env.PORT || 4021;

// The issuer-attested credential hash this venue trusts. In production this is
// the hash your accreditation / KYC issuer published on-chain; pinning it means
// a valid proof for some *other* issuer's credential is not accepted here.
const TRUSTED_CREDENTIAL_HASH =
  process.env.TRUSTED_CREDENTIAL_HASH ||
  "19536091450159168716976043526403471833495232309085654850701509158709717589851";

/**
 * Policy on the credential-proof public signals.
 * snarkjs emits publicSignals as [isValid, currentTime, expectedHash].
 *
 * The circuit already guarantees the credential matched and had not expired —
 * a proof cannot be generated otherwise. What the endpoint still pins is that
 * the credential is the one *this* venue's issuer published, and that the proof
 * was minted recently rather than replayed from long ago.
 */
function eligibilityPolicy(publicSignals) {
  const [isValid, currentTime, expectedHash] = publicSignals;
  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = now - Number(currentTime);
  return (
    isValid === "1" &&
    expectedHash === TRUSTED_CREDENTIAL_HASH &&
    ageSeconds >= 0 &&
    ageSeconds < 60 * 60 // minted within the last hour
  );
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/rwa/trade") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not_found" }));
    return;
  }

  // The gate reads only headers — it never touches the request body, so it
  // composes with an existing x402 payment check on the same route.
  const rejection = await evaluateZkRuneGate(
    (name) => req.headers[name.toLowerCase()],
    {
      requiredCircuit: "credential-proof",
      validatePublicSignals: eligibilityPolicy,
      generateProofUrl: "https://zkrune.com/verify-proof",
      rpcUrl: process.env.BASE_RPC_URL, // use a private Base RPC in production
    }
  );

  if (rejection) {
    res.writeHead(rejection.status, rejection.headers);
    res.end(JSON.stringify(rejection.body));
    return;
  }

  // Eligibility proven on-chain. Serve the protected tokenized-RWA action.
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      ok: true,
      message: "Eligibility verified on-chain — tokenized-RWA trade authorized.",
    })
  );
});

server.listen(PORT, () => {
  console.log(`gated RWA venue listening on http://localhost:${PORT}/rwa/trade`);
  console.log("run the agent in another shell:  node agent-client.mjs");
});

/**
 * Smoke test — runs the package against the live zkRune verifier on Base.
 *
 *   npm run build && node examples/smoke-test.mjs
 *
 * It needs nothing but network access to a Base RPC. The proof below is a
 * real, pre-generated Groth16 age-verification proof (birthYear 2000,
 * currentYear 2026, minimumAge 18) — a Groth16 proof is pure math, so it
 * verifies against the on-chain contract indefinitely.
 */

import {
  decodeProofHeader,
  verifyZkRuneProof,
  evaluateZkRuneGate,
} from "../dist/index.js";

// A real X-zkRune-Proof header value: base64(JSON({ proof, publicSignals })).
const PROOF_HEADER =
  "eyJwcm9vZiI6eyJwaV9hIjpbIjQ3MjM3MTk4MjExMzQ2NTg3ODg5NDY2NTgzNDk0MDU0MzkxODg3NDA5MTk5NzkxNjAzNDg4Njc4MjAxMzMwMjM2MjkzMjAwMDI2NjkiLCI3NTc5ODc0MTMxNjUwODgxMjU3OTYzNzY2NDQyMzI2Mjk2NzUwMDA3NDIyNTUxNzExODE2NzMwNTAwNzM0MTIxNzQ2MzUwODI0NTQ0IiwiMSJdLCJwaV9iIjpbWyI3MTI0MjIzNTQzNzY3Njg1NTY4MDg2MDkxOTM0MDA2MTM3Nzg0MzQ2OTM2NDQwMzQ4OTY2NjEzNDA2Njg2NjY2MzY0ODQ3MDA4OTk5IiwiMTQwMjE2NTQyODU1NDE3MTc1ODQ5MDU1NDk4ODcyMjI3NTE1MjEwOTI1NzAyNjYxODE1ODI4NTc0MTQwNTE1NDM0NjUxNTQ2ODQ5MDkiXSxbIjIwOTcxNTc4NDc4MDAxNDIzMTQzMzQ5MjU0MTE3NDAyODA4MDU4MDEzNjkxNzA5MTc5NTc3OTM4NTU1MTc2OTI0MTMwMjc1Mjc3NzUwIiwiMTEzNTIyMzg2MDE0MjIwODAwMjY1MjIyOTcyMTk5NzI1NTg2NzkzMDU0MjcyMDczMzIwOTcxMjA0MDI5NDY4ODY2NjAxMDcwMDU5MTIiXSxbIjEiLCIwIl1dLCJwaV9jIjpbIjE0NTg1NzM5NTczOTgyMTgyNDY2MDExOTgyNDMyMjgyMzU4ODcwNTUzMzI1NTM5MTMwMzA2MjcxOTI1MDM5NTMwNTY4NDU1MzM3MDA0IiwiMTEzODk0NTE4NzA3NDQyMzYzMjc0NTYyNzcwMjY0NDc1NDgzNzQyNzMwNTM3MDIzNTY2NjE0MTQzNjg4MzU3NDM4MDAyMzAwMDUyMjAiLCIxIl0sInByb3RvY29sIjoiZ3JvdGgxNiIsImN1cnZlIjoiYm4xMjgifSwicHVibGljU2lnbmFscyI6WyIxIiwiMjAyNiIsIjE4Il19";

let failures = 0;
function check(name, pass, detail) {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!pass) failures++;
}

// 1. A real proof verifies on-chain.
const envelope = decodeProofHeader(PROOF_HEADER);
check("decodeProofHeader returns an envelope", envelope !== null);

const valid = await verifyZkRuneProof("age-verification", envelope);
check("real proof verifies on Base", valid.valid === true, JSON.stringify(valid));

// 2. A tampered proof is rejected (not crashed).
const tampered = JSON.parse(JSON.stringify(envelope));
tampered.publicSignals = ["1", "2026", "21"]; // claim minimumAge 21 against a proof for 18
const bad = await verifyZkRuneProof("age-verification", tampered);
check("tampered public signals rejected", bad.valid === false, bad.reason);

// 3. The gate passes a good request.
const goodHeaders = {
  "X-zkRune-Proof": PROOF_HEADER,
  "X-zkRune-Circuit": "age-verification",
};
const goodGate = await evaluateZkRuneGate(
  (n) => goodHeaders[n],
  { requiredCircuit: "age-verification" }
);
check("gate allows a valid request", goodGate === null);

// 4. The gate rejects a request with no proof — with a 403 challenge.
const emptyGate = await evaluateZkRuneGate(
  () => undefined,
  { requiredCircuit: "age-verification" }
);
check(
  "gate rejects a missing proof with a 403 challenge",
  emptyGate?.status === 403 && emptyGate.body.error === "zkrune_eligibility_required",
  emptyGate ? JSON.stringify(emptyGate.body) : "no response"
);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);

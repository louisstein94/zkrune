/**
 * Smoke test — runs the package against the live zkRune verifier on Base.
 *
 *   npm run build && node examples/smoke-test.mjs
 *
 * It needs nothing but network access to a Base RPC and a runtime with the
 * Fetch API (Node 18+). The proof below is a real, pre-generated Groth16
 * age-verification proof (birthYear 2000, currentYear 2026, minimumAge 18) —
 * a Groth16 proof is pure math, so it verifies on-chain indefinitely.
 *
 * Coverage: the core verifier, the gate, the public-signal policy hook, and
 * all three framework adapters (fetch, Express, Hono).
 *
 * On-chain checks retry on transient RPC failures — the public Base RPC rate-
 * limits bursts of view calls. A real defect fails all attempts; a rate-limit
 * blip clears on retry. Point the package at your own RPC and retries stop
 * triggering. A genuine bug still fails the run.
 */

import {
  decodeProofHeader,
  verifyZkRuneProof,
  evaluateZkRuneGate,
  zkRuneFetchGuard,
  zkRuneExpressMiddleware,
  zkRuneHonoMiddleware,
} from "../dist/index.js";

// A real X-zkRune-Proof header value: base64(JSON({ proof, publicSignals })).
const PROOF_HEADER =
  "eyJwcm9vZiI6eyJwaV9hIjpbIjQ3MjM3MTk4MjExMzQ2NTg3ODg5NDY2NTgzNDk0MDU0MzkxODg3NDA5MTk5NzkxNjAzNDg4Njc4MjAxMzMwMjM2MjkzMjAwMDI2NjkiLCI3NTc5ODc0MTMxNjUwODgxMjU3OTYzNzY2NDQyMzI2Mjk2NzUwMDA3NDIyNTUxNzExODE2NzMwNTAwNzM0MTIxNzQ2MzUwODI0NTQ0IiwiMSJdLCJwaV9iIjpbWyI3MTI0MjIzNTQzNzY3Njg1NTY4MDg2MDkxOTM0MDA2MTM3Nzg0MzQ2OTM2NDQwMzQ4OTY2NjEzNDA2Njg2NjY2MzY0ODQ3MDA4OTk5IiwiMTQwMjE2NTQyODU1NDE3MTc1ODQ5MDU1NDk4ODcyMjI3NTE1MjEwOTI1NzAyNjYxODE1ODI4NTc0MTQwNTE1NDM0NjUxNTQ2ODQ5MDkiXSxbIjIwOTcxNTc4NDc4MDAxNDIzMTQzMzQ5MjU0MTE3NDAyODA4MDU4MDEzNjkxNzA5MTc5NTc3OTM4NTU1MTc2OTI0MTMwMjc1Mjc3NzUwIiwiMTEzNTIyMzg2MDE0MjIwODAwMjY1MjIyOTcyMTk5NzI1NTg2NzkzMDU0MjcyMDczMzIwOTcxMjA0MDI5NDY4ODY2NjAxMDcwMDU5MTIiXSxbIjEiLCIwIl1dLCJwaV9jIjpbIjE0NTg1NzM5NTczOTgyMTgyNDY2MDExOTgyNDMyMjgyMzU4ODcwNTUzMzI1NTM5MTMwMzA2MjcxOTI1MDM5NTMwNTY4NDU1MzM3MDA0IiwiMTEzODk0NTE4NzA3NDQyMzYzMjc0NTYyNzcwMjY0NDc1NDgzNzQyNzMwNTM3MDIzNTY2NjE0MTQzNjg4MzU3NDM4MDAyMzAwMDUyMjAiLCIxIl0sInByb3RvY29sIjoiZ3JvdGgxNiIsImN1cnZlIjoiYm4xMjgifSwicHVibGljU2lnbmFscyI6WyIxIiwiMjAyNiIsIjE4Il19";

const GOOD_HEADERS = {
  "X-zkRune-Proof": PROOF_HEADER,
  "X-zkRune-Circuit": "age-verification",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;

/**
 * Run a check. `fn` returns { pass, detail }. On-chain checks pass
 * `onchain: true` — those retry a few times so a public-RPC rate-limit blip
 * does not read as a defect. A genuine failure fails every attempt.
 */
async function check(name, fn, { onchain = false } = {}) {
  const attempts = onchain ? 4 : 1;
  let result;
  for (let i = 0; i < attempts; i++) {
    result = await fn();
    if (result.pass) break;
    if (i < attempts - 1) await sleep(2500);
  }
  console.log(
    `${result.pass ? "PASS" : "FAIL"}  ${name}` +
      (result.detail ? `  — ${result.detail}` : "")
  );
  if (!result.pass) failures++;
}

// --- core verifier --------------------------------------------------------

const envelope = decodeProofHeader(PROOF_HEADER);
await check("decodeProofHeader returns an envelope", () => ({
  pass: envelope !== null,
}));

await check(
  "real proof verifies on Base",
  async () => {
    const r = await verifyZkRuneProof("age-verification", envelope);
    return { pass: r.valid === true, detail: r.reason ?? "valid" };
  },
  { onchain: true }
);

await check(
  "tampered public signals rejected",
  async () => {
    const tampered = JSON.parse(JSON.stringify(envelope));
    tampered.publicSignals = ["1", "2026", "21"]; // claim 21 against a proof for 18
    const r = await verifyZkRuneProof("age-verification", tampered);
    return { pass: r.reason === "proof_rejected", detail: r.reason };
  },
  { onchain: true }
);

// --- gate -----------------------------------------------------------------

await check(
  "gate allows a valid request",
  async () => {
    const r = await evaluateZkRuneGate((n) => GOOD_HEADERS[n], {
      requiredCircuit: "age-verification",
    });
    return { pass: r === null, detail: r ? `status ${r.status}` : "" };
  },
  { onchain: true }
);

await check("gate rejects a missing proof with a 403 challenge", async () => {
  const r = await evaluateZkRuneGate(() => undefined, {
    requiredCircuit: "age-verification",
  });
  return {
    pass: r?.status === 403 && r.body.error === "zkrune_eligibility_required",
    detail: r ? r.body.reason : "no response",
  };
});

// --- public-signal policy hook --------------------------------------------

await check(
  "gate accepts a proof that satisfies the policy",
  async () => {
    const r = await evaluateZkRuneGate((n) => GOOD_HEADERS[n], {
      requiredCircuit: "age-verification",
      validatePublicSignals: (s) => {
        const [isValid, year, minAge] = s.map(Number);
        return isValid === 1 && year >= 2025 && minAge >= 18;
      },
    });
    return { pass: r === null, detail: r ? `status ${r.status}` : "" };
  },
  { onchain: true }
);

await check(
  "gate rejects a proof that fails the policy",
  async () => {
    const r = await evaluateZkRuneGate((n) => GOOD_HEADERS[n], {
      requiredCircuit: "age-verification",
      validatePublicSignals: () => false,
    });
    return {
      pass: r?.status === 403 && r.body.reason === "public_signals_rejected",
      detail: r ? r.body.reason : "no response",
    };
  },
  { onchain: true }
);

// --- fetch adapter --------------------------------------------------------

const fetchGuard = zkRuneFetchGuard({ requiredCircuit: "age-verification" });

await check(
  "fetch adapter: valid request passes",
  async () => {
    const r = await fetchGuard(
      new Request("https://x/image", { headers: GOOD_HEADERS })
    );
    return { pass: r === null, detail: r ? `status ${r.status}` : "" };
  },
  { onchain: true }
);

await check("fetch adapter: missing proof returns a 403 Response", async () => {
  const r = await fetchGuard(new Request("https://x/image"));
  return { pass: r instanceof Response && r.status === 403 };
});

// --- Express adapter (mock req/res/next) ----------------------------------

const expressMw = zkRuneExpressMiddleware({ requiredCircuit: "age-verification" });

await check(
  "express adapter: valid request calls next()",
  async () => {
    let nextCalled = false;
    await expressMw(
      { get: (n) => GOOD_HEADERS[n] },
      { status() { return this; }, set() { return this; }, json() { return this; } },
      () => { nextCalled = true; }
    );
    return { pass: nextCalled };
  },
  { onchain: true }
);

await check("express adapter: missing proof writes a 403", async () => {
  let capture = null;
  await expressMw(
    { get: () => undefined },
    {
      _status: 0,
      status(c) { this._status = c; return this; },
      set() { return this; },
      json(body) { capture = { status: this._status, body }; return this; },
    },
    () => { throw new Error("next() should not run on a blocked request"); }
  );
  return {
    pass:
      capture?.status === 403 &&
      capture.body.error === "zkrune_eligibility_required",
  };
});

// --- Hono adapter (mock context) ------------------------------------------

const honoMw = zkRuneHonoMiddleware({ requiredCircuit: "age-verification" });

await check(
  "hono adapter: valid request calls next()",
  async () => {
    let nextCalled = false;
    await honoMw(
      { req: { header: (n) => GOOD_HEADERS[n] }, json: () => new Response() },
      async () => { nextCalled = true; }
    );
    return { pass: nextCalled };
  },
  { onchain: true }
);

await check("hono adapter: missing proof returns a 403 Response", async () => {
  const r = await honoMw(
    {
      req: { header: () => undefined },
      json: (body, status) => new Response(JSON.stringify(body), { status }),
    },
    async () => { throw new Error("next() should not run on a blocked request"); }
  );
  return { pass: r instanceof Response && r.status === 403 };
});

// --- result ---------------------------------------------------------------

console.log(
  failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`
);
process.exit(failures === 0 ? 0 : 1);

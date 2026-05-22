/**
 * Reference wiring — Xona `POST /image/flux-2-flex` ($0.06).
 *
 * This shows the zkRune age gate added next to an existing x402 payment
 * check, with no change to the endpoint's body handling. Adapt the framework
 * calls to whatever Xona's x402 server actually uses — the gate itself
 * (`zkRuneHonoMiddleware` / `zkRuneFetchGuard` / `zkRuneExpressMiddleware`)
 * is identical across all of them.
 *
 * Flow for a gated request:
 *   1. client calls the endpoint with no proof   -> 403 zkrune challenge
 *   2. client generates an age proof at zkrune.com
 *   3. client retries with X-zkRune-Proof + X-zkRune-Circuit
 *      -> still 402 if unpaid (normal x402), or 200 once both pass
 *
 * The zkRune gate and the x402 payment check are independent: both must
 * pass, order does not matter. Run the cheaper one first to fail fast.
 */

import { Hono } from "hono";
import { zkRuneHonoMiddleware } from "@zkrune/x402-verify";

const app = new Hono();

/**
 * Policy for the public signals of the age-verification circuit.
 * snarkjs emits publicSignals as [isValid, currentYear, minimumAge].
 *
 * The circuit already guarantees age >= minimumAge — a proof cannot be
 * generated otherwise. What the endpoint still has to pin is that the client
 * did not prove against a stale year or a meaningless threshold.
 */
function agePolicy(publicSignals: string[]): boolean {
  const [isValid, currentYear, minimumAge] = publicSignals.map(Number);
  const thisYear = new Date().getUTCFullYear();
  return (
    isValid === 1 &&
    // allow the current year, and last year to absorb new-year clock skew
    (currentYear === thisYear || currentYear === thisYear - 1) &&
    minimumAge >= 18
  );
}

app.post(
  "/image/flux-2-flex",

  // 1. zkRune eligibility gate — rejects with a 403 challenge if the caller
  //    has not proven they are 18+. Never touches the request body.
  zkRuneHonoMiddleware({
    requiredCircuit: "age-verification",
    validatePublicSignals: agePolicy,
    generateProofUrl: "https://zkrune.com/integrations/xona",
    // rpcUrl: process.env.BASE_RPC_URL,  // use a private RPC in production
  }),

  // 2. existing x402 payment middleware — unchanged.
  //    x402PaymentMiddleware({ price: "$0.06", ... }),

  // 3. the actual handler — unchanged.
  async (c) => {
    const body = await c.req.json();
    // ...generate the flux-2-flex image from body.prompt as before...
    return c.json({ ok: true, prompt: body?.prompt });
  }
);

export default app;

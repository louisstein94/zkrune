/**
 * Express adapter.
 *
 * Uses structural (duck) types so this package has no dependency on the
 * `express` package — the middleware still slots into a real Express app.
 */

import { evaluateZkRuneGate, type GateOptions } from "../gate.js";

interface ExpressRequestLike {
  get(name: string): string | undefined;
}

interface ExpressResponseLike {
  status(code: number): ExpressResponseLike;
  set(headers: Record<string, string>): ExpressResponseLike;
  json(body: unknown): unknown;
}

type ExpressNextLike = (err?: unknown) => void;

/**
 * Express middleware that rejects requests without a valid zkRune proof.
 * Mount it before — or alongside — your x402 payment check.
 *
 *   app.post("/image/flux-2-flex",
 *     zkRuneExpressMiddleware({ requiredCircuit: "age-verification" }),
 *     x402PaymentMiddleware(),
 *     fluxHandler);
 */
export function zkRuneExpressMiddleware(options: GateOptions) {
  return async (
    req: ExpressRequestLike,
    res: ExpressResponseLike,
    next: ExpressNextLike
  ): Promise<void> => {
    const rejection = await evaluateZkRuneGate(
      (name) => req.get(name),
      options
    );
    if (!rejection) {
      next();
      return;
    }
    res.status(rejection.status).set(rejection.headers).json(rejection.body);
  };
}

/**
 * Hono adapter.
 *
 * Uses structural (duck) types so this package has no dependency on the
 * `hono` package — the middleware still slots into a real Hono app. Hono is
 * the most common framework across the x402 ecosystem.
 */

import { evaluateZkRuneGate, type GateOptions } from "../gate.js";

interface HonoContextLike {
  req: { header(name: string): string | undefined };
  json(body: unknown, status?: number, headers?: Record<string, string>): Response;
}

type HonoNextLike = () => Promise<void>;

/**
 * Hono middleware that rejects requests without a valid zkRune proof.
 *
 *   app.post("/image/flux-2-flex",
 *     zkRuneHonoMiddleware({ requiredCircuit: "age-verification" }),
 *     x402(),
 *     fluxHandler);
 */
export function zkRuneHonoMiddleware(options: GateOptions) {
  return async (c: HonoContextLike, next: HonoNextLike): Promise<Response | void> => {
    const rejection = await evaluateZkRuneGate(
      (name) => c.req.header(name),
      options
    );
    if (!rejection) {
      await next();
      return;
    }
    return c.json(
      rejection.body,
      // Hono types its status as a union of known codes; the runtime accepts
      // any integer, so a cast keeps the duck-typed signature honest.
      rejection.status as number,
      rejection.headers
    );
  };
}

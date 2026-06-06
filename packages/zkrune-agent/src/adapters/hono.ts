// Hono adapter. Structural (duck) types — no dependency on `hono`. Hono is the
// most common framework across the x402 ecosystem.

import { evaluateAgentPassportGate, type AgentGateOptions } from '../gate';

interface HonoContextLike {
  req: { header(name: string): string | undefined };
  json(body: unknown, status?: number, headers?: Record<string, string>): Response;
}
type HonoNextLike = () => Promise<void>;

/**
 * Hono middleware that rejects requests without a valid agent passport.
 *
 *   app.post("/agent/pay",
 *     agentPassportHonoMiddleware({ backend, requireHumanInLoop: true }),
 *     x402(),
 *     payHandler);
 */
export function agentPassportHonoMiddleware(options: AgentGateOptions) {
  return async (c: HonoContextLike, next: HonoNextLike): Promise<Response | void> => {
    const rejection = await evaluateAgentPassportGate((name) => c.req.header(name), options);
    if (!rejection) {
      await next();
      return;
    }
    // Hono types status as a union of known codes; the runtime accepts any
    // integer, so the cast keeps the duck-typed signature honest.
    return c.json(rejection.body, rejection.status as number, rejection.headers);
  };
}

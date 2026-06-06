// Express adapter. Structural (duck) types — no dependency on `express`.

import { evaluateAgentPassportGate, type AgentGateOptions } from '../gate';

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
 * Express middleware that rejects requests without a valid agent passport.
 * Mount it before — or alongside — your x402 payment check.
 *
 *   app.post("/agent/pay",
 *     agentPassportExpressMiddleware({ backend, enforceDomain: true }),
 *     x402PaymentMiddleware(),
 *     payHandler);
 */
export function agentPassportExpressMiddleware(options: AgentGateOptions) {
  return async (
    req: ExpressRequestLike,
    res: ExpressResponseLike,
    next: ExpressNextLike,
  ): Promise<void> => {
    const rejection = await evaluateAgentPassportGate((name) => req.get(name), options);
    if (!rejection) {
      next();
      return;
    }
    res.status(rejection.status).set(rejection.headers).json(rejection.body);
  };
}

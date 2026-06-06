// Web-standard Request/Response adapter. Works with Next.js route handlers,
// Cloudflare Workers, Deno, Bun, and any Fetch-API runtime.

import { evaluateAgentPassportGate, type AgentGateOptions } from '../gate';

/**
 * Returns a guard for a Web `Request`. The guard resolves to a `Response`
 * (request rejected — return it) or `null` (request may proceed).
 *
 *   const guard = agentPassportFetchGuard({ backend, enforceDomain: true });
 *
 *   export async function POST(req: Request) {
 *     const blocked = await guard(req);
 *     if (blocked) return blocked;
 *     // ...x402 payment check, then serve
 *   }
 */
export function agentPassportFetchGuard(options: AgentGateOptions) {
  return async (request: Request): Promise<Response | null> => {
    const rejection = await evaluateAgentPassportGate(
      (name) => request.headers.get(name),
      options,
    );
    if (!rejection) return null;
    return new Response(JSON.stringify(rejection.body), {
      status: rejection.status,
      headers: rejection.headers,
    });
  };
}

/**
 * Web-standard `Request`/`Response` adapter.
 *
 * Works with Next.js route handlers, Cloudflare Workers, Deno, Bun, and any
 * runtime that speaks the Fetch API.
 */

import { evaluateZkRuneGate, type GateOptions } from "../gate.js";

/**
 * Returns a guard for a Web `Request`. The guard resolves to a `Response`
 * (the request is rejected — return it directly) or `null` (the request may
 * proceed).
 *
 *   const guard = zkRuneFetchGuard({ requiredCircuit: "age-verification" });
 *
 *   export async function POST(req: Request) {
 *     const blocked = await guard(req);
 *     if (blocked) return blocked;
 *     // ...x402 payment check, then serve
 *   }
 */
export function zkRuneFetchGuard(options: GateOptions) {
  return async (request: Request): Promise<Response | null> => {
    const rejection = await evaluateZkRuneGate(
      (name) => request.headers.get(name),
      options
    );
    if (!rejection) return null;
    return new Response(JSON.stringify(rejection.body), {
      status: rejection.status,
      headers: rejection.headers,
    });
  };
}

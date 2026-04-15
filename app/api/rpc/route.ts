import { NextRequest, NextResponse } from 'next/server';

const RPC_URL =
  process.env.HELIUS_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  'https://api.mainnet-beta.solana.com';

// A4a: whitelist of JSON-RPC methods the proxy is allowed to forward.
// Any request that includes a method outside this set is rejected with
// a JSON-RPC error. This prevents the public proxy from being abused as
// a generic open relay for admin / send-transaction / simulate endpoints
// that would drain Helius quota or exposed private validator RPCs.
//
// The list mirrors read-only queries the UI needs plus `sendTransaction`
// for user-signed transactions. Keep alphabetized.
const ALLOWED_RPC_METHODS = new Set<string>([
  'getAccountInfo',
  'getBalance',
  'getBlockHeight',
  'getEpochInfo',
  'getFeeForMessage',
  'getGenesisHash',
  'getHealth',
  'getLatestBlockhash',
  'getMinimumBalanceForRentExemption',
  'getMultipleAccounts',
  'getProgramAccounts',
  'getRecentBlockhash',
  'getRecentPrioritizationFees',
  'getSignatureStatuses',
  'getSlot',
  'getSlotLeader',
  'getTokenAccountBalance',
  'getTokenAccountsByOwner',
  'getTokenLargestAccounts',
  'getTokenSupply',
  'getTransaction',
  'getVersion',
  'isBlockhashValid',
  'sendTransaction',
  'simulateTransaction',
]);

// A4b: dedicated rate limiter for the RPC proxy. Rationale: global
// middleware limits (100/min) are fine for UI routes but too loose for
// a path that can burn Helius credits. Cap at 30/min per client IP.
// Keep this process-local; the shared sweep + cap pattern mirrors
// middleware.ts so memory cannot grow unbounded under flood.
const RPC_RATE_WINDOW_MS = 60 * 1000;
const RPC_RATE_LIMIT = 30;
const RPC_RATE_MAX_KEYS = 5_000;
const rpcRate = new Map<string, { count: number; resetAt: number }>();
let rpcSweepAt = Date.now();

function sweepRpcRate(now: number) {
  if (now - rpcSweepAt < RPC_RATE_WINDOW_MS) return;
  rpcSweepAt = now;
  for (const [k, v] of rpcRate) if (now > v.resetAt) rpcRate.delete(k);
  while (rpcRate.size > RPC_RATE_MAX_KEYS) {
    const oldest = rpcRate.keys().next().value;
    if (oldest === undefined) break;
    rpcRate.delete(oldest);
  }
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-vercel-forwarded-for') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous'
  );
}

function checkRpcRate(ip: string): boolean {
  const now = Date.now();
  sweepRpcRate(now);
  const existing = rpcRate.get(ip);
  if (!existing || now > existing.resetAt) {
    rpcRate.set(ip, { count: 1, resetAt: now + RPC_RATE_WINDOW_MS });
    return true;
  }
  if (existing.count >= RPC_RATE_LIMIT) return false;
  existing.count += 1;
  return true;
}

type JsonRpcPayload = {
  jsonrpc?: string;
  id?: number | string | null;
  method?: unknown;
  params?: unknown;
};

function jsonRpcError(id: JsonRpcPayload['id'] | null, code: number, message: string, status: number) {
  return NextResponse.json(
    { jsonrpc: '2.0', id: id ?? null, error: { code, message } },
    { status, headers: { 'Content-Type': 'application/json' } },
  );
}

export async function POST(req: NextRequest) {
  // Rate limit BEFORE parsing so a DoS'er cannot force JSON parsing cost.
  const ip = getClientIp(req);
  if (!checkRpcRate(ip)) {
    return jsonRpcError(null, -32005, 'RPC proxy rate limit exceeded', 429);
  }

  let bodyText: string;
  try {
    bodyText = await req.text();
  } catch {
    return jsonRpcError(null, -32700, 'Failed to read request body', 400);
  }

  // Cap body size (50 KB) — Solana RPC payloads are tiny.
  if (bodyText.length > 50 * 1024) {
    return jsonRpcError(null, -32600, 'RPC request too large', 413);
  }

  let payload: JsonRpcPayload | JsonRpcPayload[];
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return jsonRpcError(null, -32700, 'Parse error', 400);
  }

  // Normalize to an array for the whitelist check; reject batch requests
  // with more than 20 entries to keep abuse bounded.
  const batch = Array.isArray(payload) ? payload : [payload];
  if (batch.length === 0) {
    return jsonRpcError(null, -32600, 'Invalid request: empty payload', 400);
  }
  if (batch.length > 20) {
    return jsonRpcError(null, -32600, 'Batch too large (max 20)', 413);
  }

  for (const call of batch) {
    if (!call || typeof call !== 'object' || typeof call.method !== 'string') {
      return jsonRpcError(call?.id ?? null, -32600, 'Invalid JSON-RPC request', 400);
    }
    if (!ALLOWED_RPC_METHODS.has(call.method)) {
      return jsonRpcError(call.id ?? null, -32601, `Method not allowed: ${call.method}`, 403);
    }
  }

  try {
    const upstream = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText,
    });

    const data = await upstream.text();
    return new NextResponse(data, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return jsonRpcError(null, -32000, err?.message || 'RPC proxy error', 502);
  }
}

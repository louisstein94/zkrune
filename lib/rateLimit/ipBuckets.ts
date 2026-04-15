// Per-route IP rate limit buckets (Phase 4 Day 25).
//
// Lightweight in-memory limiter shared by API routes that need a tighter
// cap than the global middleware (100/min). Each named bucket has its own
// Map, so AI routes and RPC proxies do not share counts.
//
// Usage:
//   import { checkIpBucket } from '@/lib/rateLimit/ipBuckets';
//
//   const { allowed } = checkIpBucket('ai-chat', request, {
//     windowMs: 60_000,
//     limit: 10,
//   });
//   if (!allowed) return NextResponse.json({ error: 'rate limit' }, { status: 429 });
//
// Design notes:
// - Keyed by x-real-ip / platform trusted headers first, spoofable
//   x-forwarded-for is the last resort (matches middleware.ts).
// - Each bucket is bounded (DEFAULT_MAX_KEYS entries) to prevent
//   unbounded memory from spoofed IP floods.
// - Periodic sweep drops expired entries in bulk.
// - Per-process only. Multi-instance serverless needs Redis.
//   See TODO in middleware.ts.

import type { NextRequest } from 'next/server';

interface BucketOptions {
  windowMs: number;
  limit: number;
  maxKeys?: number;
}

interface BucketEntry {
  count: number;
  resetAt: number;
}

const DEFAULT_MAX_KEYS = 5_000;

const buckets = new Map<string, Map<string, BucketEntry>>();
const sweepTimestamps = new Map<string, number>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-vercel-forwarded-for') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anonymous'
  );
}

function getBucket(name: string): Map<string, BucketEntry> {
  let bucket = buckets.get(name);
  if (!bucket) {
    bucket = new Map();
    buckets.set(name, bucket);
  }
  return bucket;
}

function sweepBucket(name: string, opts: BucketOptions, now: number) {
  const lastSweep = sweepTimestamps.get(name) ?? 0;
  if (now - lastSweep < opts.windowMs) return;
  sweepTimestamps.set(name, now);

  const bucket = getBucket(name);
  for (const [k, v] of bucket) {
    if (now > v.resetAt) bucket.delete(k);
  }
  const maxKeys = opts.maxKeys ?? DEFAULT_MAX_KEYS;
  while (bucket.size > maxKeys) {
    const oldest = bucket.keys().next().value;
    if (oldest === undefined) break;
    bucket.delete(oldest);
  }
}

export interface BucketResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Record one request against the named bucket for the client IP of the
 * current request. Returns `allowed: false` when the IP is over the limit
 * for this window.
 */
export function checkIpBucket(
  name: string,
  request: NextRequest,
  opts: BucketOptions,
): BucketResult {
  const ip = getClientIp(request);
  const now = Date.now();
  sweepBucket(name, opts, now);

  const bucket = getBucket(name);
  const existing = bucket.get(ip);

  if (!existing || now > existing.resetAt) {
    const entry = { count: 1, resetAt: now + opts.windowMs };
    bucket.set(ip, entry);
    return { allowed: true, remaining: opts.limit - 1, resetAt: entry.resetAt };
  }

  if (existing.count >= opts.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: opts.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Test hook: clears a named bucket. Do not call from production code. */
export function __resetBucket(name?: string): void {
  if (name) {
    buckets.get(name)?.clear();
    sweepTimestamps.delete(name);
  } else {
    buckets.clear();
    sweepTimestamps.clear();
  }
}

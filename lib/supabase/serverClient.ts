// Server-side Supabase helper
//
// This module MUST only be imported from server-side code (API routes, server
// components, middleware). It uses SUPABASE_SERVICE_ROLE_KEY which bypasses
// Row Level Security and MUST NEVER reach the browser bundle.
//
// Client-side code should use `lib/supabase/client.ts` instead.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Whether the server-side Supabase client is configured.
 * Returns false if either env var is missing so callers can short-circuit
 * with a clean 503 instead of leaking stack traces.
 */
export function isSupabaseServerConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}

/**
 * Performs a fetch against Supabase REST (PostgREST) using the service role key.
 *
 * - Fails fast if env vars are missing (callers should gate with
 *   `isSupabaseServerConfigured()` first).
 * - Never falls back to the public anon key — that would silently hide
 *   misconfiguration and expose unauthenticated writes.
 */
export async function supabaseServerFetch(
  endpoint: string,
  options?: RequestInit,
): Promise<Response> {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase server client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

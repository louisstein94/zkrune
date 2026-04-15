// Supabase Client Configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns true when both Supabase env vars are present and non-empty.
 * Callers MUST gate every `supabase.*` call with this check.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Lazily constructs the browser Supabase client. Throws a descriptive error
 * when env vars are missing instead of silently pointing at a fake
 * `placeholder.supabase.co` host (which produced confusing network errors
 * and masked real misconfiguration).
 *
 * Note: This still uses the anon key by design — it is intended for browser
 * reads. Server-side code must use `lib/supabase/serverClient.ts` which uses
 * the service role key.
 */
let cachedClient: SupabaseClient<Database> | null = null;
function getClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase client not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or gate the call site with isSupabaseConfigured().',
    );
  }
  if (!cachedClient) {
    cachedClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

/**
 * Back-compat proxy that forwards property access to the lazily-built client.
 * Existing `import { supabase } from '@/lib/supabase/client'` keeps working;
 * calls that hit a missing config throw at the call site instead of at module
 * load, preserving Next.js build-time safety.
 */
export const supabase: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop) {
      const client = getClient() as unknown as Record<string | symbol, unknown>;
      const value = client[prop];
      return typeof value === 'function' ? (value as Function).bind(client) : value;
    },
  },
);

// Type helpers for tables
export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type MarketplaceTemplate = Database['public']['Tables']['marketplace_templates']['Row'];
export type Purchase = Database['public']['Tables']['purchases']['Row'];
export type StakingPosition = Database['public']['Tables']['staking_positions']['Row'];
export type PremiumStatus = Database['public']['Tables']['premium_status']['Row'];
export type BurnHistory = Database['public']['Tables']['burn_history']['Row'];
export type CeremonyContribution = Database['public']['Tables']['ceremony_contributions']['Row'];

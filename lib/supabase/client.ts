// Supabase Client Configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client-side Supabase client (for browser)
// Use 'any' type to avoid build-time type inference issues
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Type helpers for tables
export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type MarketplaceTemplate = Database['public']['Tables']['marketplace_templates']['Row'];
export type Purchase = Database['public']['Tables']['purchases']['Row'];
export type StakingPosition = Database['public']['Tables']['staking_positions']['Row'];
export type PremiumStatus = Database['public']['Tables']['premium_status']['Row'];
export type BurnHistory = Database['public']['Tables']['burn_history']['Row'];
export type CeremonyContribution = Database['public']['Tables']['ceremony_contributions']['Row'];

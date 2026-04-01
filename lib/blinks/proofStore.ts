import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';
import type { TrustLevel } from '@/lib/trustLevel';

type ProofInsert = Database['public']['Tables']['published_proofs']['Insert'];

export interface StoredProof {
  id: string;
  circuitName: string;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  label: string;
  description: string;
  createdAt: number;
  expiresAt: number;
  verifiedOffChain: boolean;
  creatorWallet?: string;
  trustLevel: TrustLevel;
}

const PROOF_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PERSISTENT_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 year (effectively permanent)

// ─── In-memory fallback (dev without Supabase) ─────────────────────
const memStore = new Map<string, StoredProof>();

function evictExpired() {
  const now = Date.now();
  for (const [id, entry] of memStore) {
    if (now > entry.expiresAt) memStore.delete(id);
  }
}

// ─── Supabase helpers ───────────────────────────────────────────────

function toDbRow(entry: StoredProof): ProofInsert {
  const row: ProofInsert = {
    id: entry.id,
    circuit_name: entry.circuitName,
    proof: entry.proof as any,
    public_signals: entry.publicSignals as any,
    label: entry.label,
    description: entry.description,
    created_at: new Date(entry.createdAt).toISOString(),
    expires_at: new Date(entry.expiresAt).toISOString(),
    verified_off_chain: entry.verifiedOffChain,
    creator_wallet: entry.creatorWallet || null,
  };
  return row;
}

function fromDbRow(row: any): StoredProof {
  return {
    id: row.id,
    circuitName: row.circuit_name,
    proof: row.proof,
    publicSignals: row.public_signals,
    label: row.label,
    description: row.description,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
    verifiedOffChain: row.verified_off_chain,
    creatorWallet: row.creator_wallet || undefined,
    trustLevel: row.trust_level || 'self-asserted',
  };
}

// ─── Public API ─────────────────────────────────────────────────────

export async function storeProof(
  circuitName: string,
  proof: StoredProof['proof'],
  publicSignals: string[],
  opts: { label?: string; description?: string; wallet?: string; verifiedOffChain?: boolean; persistent?: boolean; trustLevel?: TrustLevel } = {},
): Promise<StoredProof> {
  const id = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  const ttl = opts.persistent ? PERSISTENT_TTL_MS : PROOF_TTL_MS;

  const entry: StoredProof = {
    id,
    circuitName,
    proof,
    publicSignals,
    label: opts.label || `zkRune ${circuitName} Proof`,
    description: opts.description || `Zero-knowledge proof generated with zkRune (${circuitName})`,
    createdAt: now,
    expiresAt: now + ttl,
    verifiedOffChain: opts.verifiedOffChain ?? false,
    creatorWallet: opts.wallet,
    trustLevel: opts.trustLevel || 'self-asserted',
  };

  if (isSupabaseConfigured()) {
    const { error } = await (supabase as any)
      .from('published_proofs')
      .insert(toDbRow(entry));

    if (error) {
      console.error('[proofStore] Supabase insert error, falling back to memory:', error.message);
      memStore.set(id, entry);
    }
  } else {
    evictExpired();
    if (memStore.size >= 10_000) {
      const oldest = [...memStore.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
      if (oldest) memStore.delete(oldest[0]);
    }
    memStore.set(id, entry);
  }

  return entry;
}

export async function getProof(id: string): Promise<StoredProof | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await (supabase as any)
      .from('published_proofs')
      .select('*')
      .eq('id', id)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      // Fallback: check memory too
      const mem = memStore.get(id);
      if (mem && Date.now() <= mem.expiresAt) return mem;
      return null;
    }

    return fromDbRow(data);
  }

  evictExpired();
  return memStore.get(id) ?? null;
}

export async function deleteProof(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const { error } = await (supabase as any)
      .from('published_proofs')
      .delete()
      .eq('id', id);

    if (!error) return true;
  }

  return memStore.delete(id);
}

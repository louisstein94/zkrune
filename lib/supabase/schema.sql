-- zkRune Database Schema
-- Run this in Supabase SQL Editor to create tables
--
-- MIGRATION NOTE (if tables already exist):
--   ALTER TABLE staking_positions ADD COLUMN IF NOT EXISTS transaction_signature TEXT UNIQUE NOT NULL DEFAULT '';
--   CREATE INDEX IF NOT EXISTS idx_staking_txsig ON staking_positions(transaction_signature);

-- gen_random_uuid() is built-in since PostgreSQL 13 — no extension needed

-- =====================================================
-- GOVERNANCE TABLES
-- =====================================================

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('template', 'feature', 'parameter')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creator TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'executed')),
  votes_for NUMERIC DEFAULT 0,
  votes_against NUMERIC DEFAULT 0,
  voter_count INTEGER DEFAULT 0,
  quorum_reached BOOLEAN DEFAULT FALSE,
  template_data JSONB,
  feature_data JSONB
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter TEXT NOT NULL,
  support BOOLEAN NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, voter)
);

-- =====================================================
-- MARKETPLACE TABLES
-- =====================================================

-- Marketplace Templates
CREATE TABLE IF NOT EXISTS marketplace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  creator TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  circuit_code TEXT NOT NULL,
  nodes JSONB,
  edges JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  downloads INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}'
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  buyer TEXT NOT NULL,
  seller TEXT NOT NULL,
  price NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  creator_revenue NUMERIC NOT NULL,
  reward_vault_amount NUMERIC DEFAULT 0,
  treasury_amount NUMERIC DEFAULT 0,
  fee_destination TEXT DEFAULT 'treasury',
  -- transaction_signature is UNIQUE so a single on-chain payment cannot be
  -- reused to purchase multiple templates from different buyer addresses.
  transaction_signature TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treasury Distributions (tracks fee routing to reward vault)
CREATE TABLE IF NOT EXISTS treasury_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'marketplace_fees',
  amount NUMERIC NOT NULL,
  destination TEXT NOT NULL,
  transaction_signature TEXT,
  distributed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STAKING TABLES
-- =====================================================

-- Staking Positions
CREATE TABLE IF NOT EXISTS staking_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staker TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  lock_period_days INTEGER NOT NULL,
  multiplier NUMERIC NOT NULL,
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocks_at TIMESTAMPTZ NOT NULL,
  last_claim_at TIMESTAMPTZ DEFAULT NOW(),
  total_claimed NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  transaction_signature TEXT UNIQUE NOT NULL
);

-- =====================================================
-- PREMIUM / BURN TABLES
-- =====================================================

-- Premium Status
CREATE TABLE IF NOT EXISTS premium_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'BUILDER', 'PRO', 'PROTOCOL')),
  total_burned NUMERIC DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Burn History
CREATE TABLE IF NOT EXISTS burn_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tier TEXT NOT NULL,
  transaction_signature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CEREMONY TABLES
-- =====================================================

-- Ceremony Contributions
CREATE TABLE IF NOT EXISTS ceremony_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_index INTEGER NOT NULL UNIQUE,
  contributor_name TEXT NOT NULL,
  contribution_hash TEXT NOT NULL,
  circuits TEXT[] DEFAULT ARRAY['age-verification', 'anonymous-reputation', 'balance-proof', 'credential-proof', 'hash-preimage', 'membership-proof', 'nft-ownership', 'patience-proof', 'private-voting', 'quadratic-voting', 'range-proof', 'signature-verification', 'token-swap'],
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PUBLISHED ZK PROOFS (Solana Blinks)
-- =====================================================

CREATE TABLE IF NOT EXISTS published_proofs (
  id TEXT PRIMARY KEY,
  circuit_name TEXT NOT NULL,
  proof JSONB NOT NULL,
  public_signals JSONB NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_off_chain BOOLEAN DEFAULT FALSE,
  creator_wallet TEXT,
  -- Optional trust level tag for the proof (e.g. 'verified', 'experimental').
  -- Matches the trust_level field in lib/supabase/types.ts Row/Insert/Update.
  trust_level TEXT
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_creator ON proposals(creator);
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter);
CREATE INDEX IF NOT EXISTS idx_templates_category ON marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_creator ON marketplace_templates(creator_address);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON marketplace_templates(featured);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer);
CREATE INDEX IF NOT EXISTS idx_purchases_seller ON purchases(seller);
CREATE INDEX IF NOT EXISTS idx_staking_staker ON staking_positions(staker);
CREATE INDEX IF NOT EXISTS idx_staking_active ON staking_positions(is_active);
CREATE INDEX IF NOT EXISTS idx_staking_txsig ON staking_positions(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_purchases_txsig ON purchases(transaction_signature);
CREATE INDEX IF NOT EXISTS idx_premium_wallet ON premium_status(wallet);
CREATE INDEX IF NOT EXISTS idx_burn_wallet ON burn_history(wallet);
CREATE INDEX IF NOT EXISTS idx_ceremony_index ON ceremony_contributions(contribution_index);
CREATE INDEX IF NOT EXISTS idx_proofs_expires ON published_proofs(expires_at);
CREATE INDEX IF NOT EXISTS idx_proofs_circuit ON published_proofs(circuit_name);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE staking_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE burn_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceremony_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_proofs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent re-run) — covers both legacy and new names
DROP POLICY IF EXISTS "Public read proposals" ON proposals;
DROP POLICY IF EXISTS "Public read templates" ON marketplace_templates;
DROP POLICY IF EXISTS "Allow insert proposals" ON proposals;
DROP POLICY IF EXISTS "Allow insert votes" ON votes;
DROP POLICY IF EXISTS "Allow insert templates" ON marketplace_templates;
DROP POLICY IF EXISTS "Allow insert purchases" ON purchases;
DROP POLICY IF EXISTS "Allow insert staking" ON staking_positions;
DROP POLICY IF EXISTS "Allow insert premium" ON premium_status;
DROP POLICY IF EXISTS "Allow insert burn" ON burn_history;
DROP POLICY IF EXISTS "Allow insert ceremony" ON ceremony_contributions;
DROP POLICY IF EXISTS "Allow update proposals" ON proposals;
DROP POLICY IF EXISTS "Allow update templates" ON marketplace_templates;
DROP POLICY IF EXISTS "Allow update staking" ON staking_positions;
DROP POLICY IF EXISTS "Allow update premium" ON premium_status;
DROP POLICY IF EXISTS "Public read votes" ON votes;
DROP POLICY IF EXISTS "Public read purchases" ON purchases;
DROP POLICY IF EXISTS "Public read staking" ON staking_positions;
DROP POLICY IF EXISTS "Public read premium" ON premium_status;
DROP POLICY IF EXISTS "Public read burn" ON burn_history;
DROP POLICY IF EXISTS "Public read ceremony" ON ceremony_contributions;
DROP POLICY IF EXISTS "Public read distributions" ON treasury_distributions;
DROP POLICY IF EXISTS "Allow insert distributions" ON treasury_distributions;
-- New service-role policy names
DROP POLICY IF EXISTS "Service insert proposals" ON proposals;
DROP POLICY IF EXISTS "Service update proposals" ON proposals;
DROP POLICY IF EXISTS "Service insert votes" ON votes;
DROP POLICY IF EXISTS "Service insert templates" ON marketplace_templates;
DROP POLICY IF EXISTS "Service update templates" ON marketplace_templates;
DROP POLICY IF EXISTS "Service insert purchases" ON purchases;
DROP POLICY IF EXISTS "Service insert staking" ON staking_positions;
DROP POLICY IF EXISTS "Service update staking" ON staking_positions;
DROP POLICY IF EXISTS "Service insert premium" ON premium_status;
DROP POLICY IF EXISTS "Service update premium" ON premium_status;
DROP POLICY IF EXISTS "Service insert burn" ON burn_history;
DROP POLICY IF EXISTS "Service insert ceremony" ON ceremony_contributions;
DROP POLICY IF EXISTS "Service insert distributions" ON treasury_distributions;

-- =====================================================
-- RLS POLICIES
-- =====================================================
-- Model: anon role (NEXT_PUBLIC_SUPABASE_ANON_KEY, used by client code) can ONLY
-- read public data. All writes go through server-side API routes that authenticate
-- with SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. The write policies below
-- are restricted to the service_role as a defense-in-depth measure: even if a
-- future client is accidentally given elevated privileges, it still cannot
-- mutate rows directly.
--
-- Tables containing user-specific records (votes, staking, premium, burn,
-- purchases, published proofs) are read-only for anon. The app UI composes
-- user views through API routes when authentication is needed.

-- Public (anon) read access
CREATE POLICY "Public read proposals" ON proposals FOR SELECT USING (true);
CREATE POLICY "Public read templates" ON marketplace_templates FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Public read staking" ON staking_positions FOR SELECT USING (true);
CREATE POLICY "Public read premium" ON premium_status FOR SELECT USING (true);
CREATE POLICY "Public read burn" ON burn_history FOR SELECT USING (true);
CREATE POLICY "Public read ceremony" ON ceremony_contributions FOR SELECT USING (true);
CREATE POLICY "Public read distributions" ON treasury_distributions FOR SELECT USING (true);

-- Service-role-only writes (defense-in-depth; service_role already bypasses RLS)
CREATE POLICY "Service insert proposals" ON proposals FOR INSERT
  TO service_role WITH CHECK (true);
CREATE POLICY "Service update proposals" ON proposals FOR UPDATE
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service insert votes" ON votes FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "Service insert templates" ON marketplace_templates FOR INSERT
  TO service_role WITH CHECK (true);
CREATE POLICY "Service update templates" ON marketplace_templates FOR UPDATE
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service insert purchases" ON purchases FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "Service insert staking" ON staking_positions FOR INSERT
  TO service_role WITH CHECK (true);
CREATE POLICY "Service update staking" ON staking_positions FOR UPDATE
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service insert premium" ON premium_status FOR INSERT
  TO service_role WITH CHECK (true);
CREATE POLICY "Service update premium" ON premium_status FOR UPDATE
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service insert burn" ON burn_history FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "Service insert ceremony" ON ceremony_contributions FOR INSERT
  TO service_role WITH CHECK (true);

CREATE POLICY "Service insert distributions" ON treasury_distributions FOR INSERT
  TO service_role WITH CHECK (true);

-- Published proofs: public read, service-role write + delete
DROP POLICY IF EXISTS "Public read proofs" ON published_proofs;
DROP POLICY IF EXISTS "Allow insert proofs" ON published_proofs;
DROP POLICY IF EXISTS "Allow delete proofs" ON published_proofs;
CREATE POLICY "Public read proofs" ON published_proofs FOR SELECT USING (true);
CREATE POLICY "Service insert proofs" ON published_proofs FOR INSERT
  TO service_role WITH CHECK (true);
CREATE POLICY "Service delete proofs" ON published_proofs FOR DELETE
  TO service_role USING (true);

-- =====================================================
-- SEED DATA — moved to lib/supabase/seed.sql
-- Run separately: psql $DATABASE_URL -f lib/supabase/seed.sql
-- =====================================================

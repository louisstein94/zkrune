-- Migration: Restrict RLS write policies to service_role (A1)
-- Created: 2026-04-14
-- Phase 3 Day 12 — lock down anon writes that were previously WITH CHECK (true).
--
-- Context: prior policies allowed any client holding the anon key to INSERT/UPDATE/DELETE
-- on every table (votes, proposals, premium_status, staking_positions, purchases,
-- ceremony_contributions, burn_history, treasury_distributions, published_proofs).
-- Since NEXT_PUBLIC_SUPABASE_ANON_KEY is shipped in the browser bundle, this was
-- equivalent to a public write endpoint and allowed governance manipulation,
-- premium status forgery, and arbitrary vote injection.
--
-- After this migration, all writes MUST go through server-side API routes
-- authenticated with SUPABASE_SERVICE_ROLE_KEY. See lib/supabase/serverClient.ts.
--
-- SAFE TO RE-RUN: every CREATE is preceded by a DROP IF EXISTS.

BEGIN;

-- Drop legacy permissive write policies
DROP POLICY IF EXISTS "Allow insert proposals" ON proposals;
DROP POLICY IF EXISTS "Allow update proposals" ON proposals;
DROP POLICY IF EXISTS "Allow insert votes" ON votes;
DROP POLICY IF EXISTS "Allow insert templates" ON marketplace_templates;
DROP POLICY IF EXISTS "Allow update templates" ON marketplace_templates;
DROP POLICY IF EXISTS "Allow insert purchases" ON purchases;
DROP POLICY IF EXISTS "Allow insert staking" ON staking_positions;
DROP POLICY IF EXISTS "Allow update staking" ON staking_positions;
DROP POLICY IF EXISTS "Allow insert premium" ON premium_status;
DROP POLICY IF EXISTS "Allow update premium" ON premium_status;
DROP POLICY IF EXISTS "Allow insert burn" ON burn_history;
DROP POLICY IF EXISTS "Allow insert ceremony" ON ceremony_contributions;
DROP POLICY IF EXISTS "Allow insert distributions" ON treasury_distributions;
DROP POLICY IF EXISTS "Allow insert proofs" ON published_proofs;
DROP POLICY IF EXISTS "Allow delete proofs" ON published_proofs;

-- Drop any pre-existing service-role policies (idempotent)
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
DROP POLICY IF EXISTS "Service insert proofs" ON published_proofs;
DROP POLICY IF EXISTS "Service delete proofs" ON published_proofs;

-- Create restricted write policies (service_role only)
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

CREATE POLICY "Service insert proofs" ON published_proofs FOR INSERT
  TO service_role WITH CHECK (true);
CREATE POLICY "Service delete proofs" ON published_proofs FOR DELETE
  TO service_role USING (true);

COMMIT;

-- Post-migration verification (run manually and confirm each returns rows for
-- service_role only, never for anon):
--
-- SELECT tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;

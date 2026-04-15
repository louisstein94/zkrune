-- Migration: Add trust_level column to published_proofs (A16)
-- Created: 2026-04-14
-- Phase 3 Day 17 — lib/supabase/types.ts already declared trust_level on
-- published_proofs Row/Insert/Update, but the column did not exist in
-- schema.sql, so any INSERT with trust_level would fail at runtime with
-- "column does not exist" on a fresh deployment.
--
-- This migration adds the column conditionally so existing databases
-- upgrade cleanly without data loss.
--
-- SAFE TO RE-RUN: IF NOT EXISTS guard.

ALTER TABLE published_proofs
  ADD COLUMN IF NOT EXISTS trust_level TEXT;

-- Optional: backfill NULL values to a default if desired.
-- UPDATE published_proofs SET trust_level = 'experimental' WHERE trust_level IS NULL;

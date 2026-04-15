-- Migration: Add UNIQUE + index on purchases.transaction_signature (P3 Day 18)
-- Created: 2026-04-14
--
-- Context: /api/marketplace/purchases previously only rejected a second
-- purchase of the same (template_id, buyer) pair. A single on-chain
-- payment could therefore be submitted multiple times to claim different
-- templates or the same template from different buyer addresses. This
-- migration enforces single-use transaction signatures at the database
-- layer as defense-in-depth for the API-layer check.
--
-- SAFE TO RE-RUN: guarded by IF NOT EXISTS / NOT EXISTS.

BEGIN;

-- Index first (so duplicate detection below is fast).
CREATE INDEX IF NOT EXISTS idx_purchases_txsig
  ON purchases (transaction_signature);

-- Detect pre-existing duplicates; the UNIQUE constraint cannot be added
-- while duplicates remain. Caller must manually resolve any rows returned
-- here before re-running the migration.
DO $$
DECLARE
  dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dup_count FROM (
    SELECT transaction_signature
    FROM purchases
    WHERE transaction_signature IS NOT NULL
    GROUP BY transaction_signature
    HAVING COUNT(*) > 1
  ) d;
  IF dup_count > 0 THEN
    RAISE NOTICE 'Found % duplicate transaction_signature groups in purchases; UNIQUE constraint NOT added. Resolve duplicates and re-run.', dup_count;
    RETURN;
  END IF;
END $$;

-- Add UNIQUE constraint if not present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'purchases_transaction_signature_key'
  ) THEN
    ALTER TABLE purchases
      ADD CONSTRAINT purchases_transaction_signature_key
      UNIQUE (transaction_signature);
  END IF;
END $$;

COMMIT;

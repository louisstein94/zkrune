-- Migration: Atomic cast_vote RPC (P3-03)
-- Created: 2026-04-14
-- Phase 3 Day 15 — replace read-then-write vote tallying with a single
-- PL/pgSQL function that inserts the vote row and updates the proposal
-- aggregates in one transaction. Closes a lost-update race where two
-- concurrent votes on the same proposal would both read the same
-- pre-image and overwrite each other's increment.
--
-- Called from app/api/governance/votes/route.ts via PostgREST:
--     POST /rest/v1/rpc/cast_vote
--     { p_proposal_id, p_voter, p_support, p_weight, p_quorum_threshold }
--
-- The function also evaluates whether the running (for+against) total has
-- reached the supplied quorum threshold and persists quorum_reached in the
-- same transaction.
--
-- SAFE TO RE-RUN: CREATE OR REPLACE.

CREATE OR REPLACE FUNCTION public.cast_vote(
  p_proposal_id UUID,
  p_voter TEXT,
  p_support BOOLEAN,
  p_weight DOUBLE PRECISION,
  p_quorum_threshold DOUBLE PRECISION
) RETURNS TABLE (
  vote_id UUID,
  votes_for DOUBLE PRECISION,
  votes_against DOUBLE PRECISION,
  voter_count INTEGER,
  quorum_reached BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vote_id UUID;
  v_proposal RECORD;
BEGIN
  -- Insert vote row. The unique constraint on (proposal_id, voter) enforces
  -- one vote per voter — a second concurrent call will raise unique_violation
  -- and roll back the entire transaction.
  INSERT INTO votes (proposal_id, voter, support, weight)
  VALUES (p_proposal_id, p_voter, p_support, p_weight)
  RETURNING id INTO v_vote_id;

  -- Atomic aggregate update.
  UPDATE proposals
  SET
    votes_for = votes_for + CASE WHEN p_support THEN p_weight ELSE 0 END,
    votes_against = votes_against + CASE WHEN p_support THEN 0 ELSE p_weight END,
    voter_count = voter_count + 1,
    quorum_reached = (
      votes_for + votes_against + p_weight
    ) >= p_quorum_threshold
  WHERE id = p_proposal_id
  RETURNING
    proposals.votes_for,
    proposals.votes_against,
    proposals.voter_count,
    proposals.quorum_reached
  INTO v_proposal;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal % not found', p_proposal_id;
  END IF;

  RETURN QUERY SELECT
    v_vote_id,
    v_proposal.votes_for,
    v_proposal.votes_against,
    v_proposal.voter_count,
    v_proposal.quorum_reached;
END;
$$;

-- Ensure the unique constraint exists (idempotent). Without it, the function
-- cannot rely on ON CONFLICT to prevent double voting.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'votes_proposal_voter_unique'
  ) THEN
    ALTER TABLE votes
      ADD CONSTRAINT votes_proposal_voter_unique
      UNIQUE (proposal_id, voter);
  END IF;
END $$;

-- Allow service_role to call the RPC.
GRANT EXECUTE ON FUNCTION public.cast_vote(UUID, TEXT, BOOLEAN, DOUBLE PRECISION, DOUBLE PRECISION) TO service_role;

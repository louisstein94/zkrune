-- =====================================================
-- SEED DATA — Development / demo only
-- =====================================================
-- Run manually via: psql $DATABASE_URL -f lib/supabase/seed.sql
-- Or via the Supabase SQL editor.
-- DO NOT run this in production unless you want prepopulated proposals,
-- marketplace templates, and a genesis ceremony contribution.
-- All INSERTs use ON CONFLICT DO NOTHING so re-running is idempotent.

-- Insert default proposals
INSERT INTO proposals (type, title, description, creator, ends_at, status, votes_for, votes_against, voter_count, quorum_reached, feature_data)
VALUES
  ('feature', 'Solana SPL Token Private Transfers', 'Implement private SPL token transfers using ZK proofs. Users can send tokens without revealing amounts or wallet addresses publicly. Perfect for salary payments, donations, and confidential business transactions on Solana.', 'zkRune Core', NOW() + INTERVAL '7 days', 'active', 2450, 120, 89, true, '{"featureName": "Private SPL Transfers", "specification": "Use Groth16 proofs to verify token ownership and transfer validity without revealing amounts."}'),
  ('template', 'Anonymous DAO Voting Template', 'A template for Solana DAOs to conduct anonymous votes. Prove voting eligibility based on token holdings without revealing your wallet or exact balance. Prevents voter coercion and bribery.', 'Privacy Advocate', NOW() + INTERVAL '5 days', 'active', 1890, 340, 156, true, '{"name": "Anonymous DAO Voting", "category": "voting"}'),
  ('feature', 'Confidential Token Launchpad', 'Build a private token launchpad where participants can prove they meet requirements (holding period, token amount, etc.) without revealing their identity. Ideal for fair launches without front-running.', 'DeFi Builder', NOW() + INTERVAL '3 days', 'active', 1560, 280, 78, true, '{"featureName": "Confidential Launchpad", "specification": "ZK proofs for allocation eligibility without wallet address exposure."}'),
  ('template', 'Private Credit Score Proof', 'Prove your on-chain credit worthiness for undercollateralized lending without revealing transaction history. Essential for privacy-preserving DeFi on Solana.', 'Solana DeFi', NOW() - INTERVAL '1 day', 'passed', 3200, 450, 234, true, '{"name": "Private Credit Score", "category": "finance"}'),
  ('feature', 'Gasless Proof Verification via Relayers', 'Enable users to verify proofs without paying gas. Relayers submit transactions on behalf of users, with costs covered by the protocol. Improves UX for privacy features.', 'UX Team', NOW() - INTERVAL '5 days', 'executed', 4100, 200, 312, true, '{"featureName": "Gasless Verification", "specification": "Implement meta-transactions for proof submission."}')
ON CONFLICT DO NOTHING;

-- Insert default marketplace templates
INSERT INTO marketplace_templates (name, description, creator, creator_address, price, category, circuit_code, downloads, rating, rating_count, featured, verified, tags)
VALUES
  ('Private SPL Token Transfer', 'Send SPL tokens privately on Solana. Proves you have sufficient balance without revealing your wallet address or exact amount. Perfect for payroll, donations, and confidential transactions.', 'zkRune Labs', 'zkRuneLabsAddress123', 300, 'finance', 'pragma circom 2.0.0;
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template PrivateTransfer() {
    signal input balance;
    signal input amount;
    signal input recipientHash;
    signal input senderSecret;
    signal output isValid;
    signal output nullifier;

    component cmp = GreaterEqThan(64);
    cmp.in[0] <== balance;
    cmp.in[1] <== amount;
    isValid <== cmp.out;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== senderSecret;
    hasher.inputs[1] <== amount;
    nullifier <== hasher.out;
}

component main = PrivateTransfer();', 456, 4.9, 67, true, true, ARRAY['private', 'transfer', 'solana', 'spl', 'payment']),
  ('DAO Sybil Resistance', 'Prevent sybil attacks in Solana DAOs. Prove unique personhood without KYC using commitment schemes. One-person-one-vote without revealing identity.', 'DAO Architect', 'DAOArchAddress101', 200, 'voting', 'pragma circom 2.0.0;
include "circomlib/poseidon.circom";

template SybilResistance() {
    signal input identitySecret;
    signal input daoId;
    signal input nullifierSeed;
    signal output identityCommitment;
    signal output nullifier;

    component idHash = Poseidon(1);
    idHash.inputs[0] <== identitySecret;
    identityCommitment <== idHash.out;

    component nullHash = Poseidon(3);
    nullHash.inputs[0] <== identitySecret;
    nullHash.inputs[1] <== daoId;
    nullHash.inputs[2] <== nullifierSeed;
    nullifier <== nullHash.out;
}

component main = SybilResistance();', 267, 4.9, 38, true, true, ARRAY['dao', 'governance', 'sybil', 'identity', 'solana'])
ON CONFLICT DO NOTHING;

-- Insert initial ceremony contribution
INSERT INTO ceremony_contributions (contribution_index, contributor_name, contribution_hash, verified)
VALUES
  (1, 'zkRune Core', 'a1b2c3d4e5f6789012345678901234567890abcd1234567890abcdef12345678', true)
ON CONFLICT DO NOTHING;

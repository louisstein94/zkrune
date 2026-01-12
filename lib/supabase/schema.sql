-- zkRune Database Schema
-- Run this in Supabase SQL Editor to create tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- GOVERNANCE TABLES
-- =====================================================

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  buyer TEXT NOT NULL,
  seller TEXT NOT NULL,
  price NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  creator_revenue NUMERIC NOT NULL,
  transaction_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STAKING TABLES
-- =====================================================

-- Staking Positions
CREATE TABLE IF NOT EXISTS staking_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staker TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  lock_period_days INTEGER NOT NULL,
  multiplier NUMERIC NOT NULL,
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocks_at TIMESTAMPTZ NOT NULL,
  last_claim_at TIMESTAMPTZ DEFAULT NOW(),
  total_claimed NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- PREMIUM / BURN TABLES
-- =====================================================

-- Premium Status
CREATE TABLE IF NOT EXISTS premium_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'BUILDER', 'PRO', 'ENTERPRISE')),
  total_burned NUMERIC DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Burn History
CREATE TABLE IF NOT EXISTS burn_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tier TEXT NOT NULL,
  transaction_signature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_premium_wallet ON premium_status(wallet);
CREATE INDEX IF NOT EXISTS idx_burn_wallet ON burn_history(wallet);

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

-- Public read access for proposals and templates
CREATE POLICY "Public read proposals" ON proposals FOR SELECT USING (true);
CREATE POLICY "Public read templates" ON marketplace_templates FOR SELECT USING (true);

-- Allow inserting for any authenticated request (wallet-based auth)
CREATE POLICY "Allow insert proposals" ON proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert templates" ON marketplace_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert purchases" ON purchases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert staking" ON staking_positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert premium" ON premium_status FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert burn" ON burn_history FOR INSERT WITH CHECK (true);

-- Allow updates
CREATE POLICY "Allow update proposals" ON proposals FOR UPDATE USING (true);
CREATE POLICY "Allow update templates" ON marketplace_templates FOR UPDATE USING (true);
CREATE POLICY "Allow update staking" ON staking_positions FOR UPDATE USING (true);
CREATE POLICY "Allow update premium" ON premium_status FOR UPDATE USING (true);

-- Public read for votes, purchases, staking, premium, burn
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read purchases" ON purchases FOR SELECT USING (true);
CREATE POLICY "Public read staking" ON staking_positions FOR SELECT USING (true);
CREATE POLICY "Public read premium" ON premium_status FOR SELECT USING (true);
CREATE POLICY "Public read burn" ON burn_history FOR SELECT USING (true);

-- =====================================================
-- SEED DATA
-- =====================================================

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
  ('Private SPL Token Transfer', 'Send SPL tokens privately on Solana. Proves you have sufficient balance without revealing your wallet address or exact amount. Perfect for payroll, donations, and confidential transactions.', 'zkRune Labs', 'zkRuneLabsAddress123', 300, 'finance', 'pragma circom 2.0.0;\ninclude "circomlib/poseidon.circom";\ninclude "circomlib/comparators.circom";\n\ntemplate PrivateTransfer() {\n    signal input balance;\n    signal input amount;\n    signal input recipientHash;\n    signal input senderSecret;\n    signal output isValid;\n    signal output nullifier;\n    \n    component cmp = GreaterEqThan(64);\n    cmp.in[0] <== balance;\n    cmp.in[1] <== amount;\n    isValid <== cmp.out;\n    \n    component hasher = Poseidon(2);\n    hasher.inputs[0] <== senderSecret;\n    hasher.inputs[1] <== amount;\n    nullifier <== hasher.out;\n}\n\ncomponent main = PrivateTransfer();', 456, 4.9, 67, true, true, ARRAY['private', 'transfer', 'solana', 'spl', 'payment']),
  ('Anonymous Launchpad Allocation', 'Prove eligibility for token launches without revealing your wallet. Show you meet holding requirements, time locks, or other criteria privately. Prevents front-running and whale identification.', 'Privacy DeFi', 'PrivacyDeFiAddr', 250, 'finance', 'pragma circom 2.0.0;\ninclude "circomlib/poseidon.circom";\ninclude "circomlib/comparators.circom";\n\ntemplate LaunchpadAllocation() {\n    signal input walletSecret;\n    signal input tokenBalance;\n    signal input holdingDays;\n    signal input minBalance;\n    signal input minDays;\n    signal output isEligible;\n    signal output commitment;\n    \n    component balCheck = GreaterEqThan(64);\n    balCheck.in[0] <== tokenBalance;\n    balCheck.in[1] <== minBalance;\n    \n    component dayCheck = GreaterEqThan(32);\n    dayCheck.in[0] <== holdingDays;\n    dayCheck.in[1] <== minDays;\n    \n    isEligible <== balCheck.out * dayCheck.out;\n    \n    component hasher = Poseidon(1);\n    hasher.inputs[0] <== walletSecret;\n    commitment <== hasher.out;\n}\n\ncomponent main = LaunchpadAllocation();', 312, 4.8, 42, true, true, ARRAY['launchpad', 'allocation', 'privacy', 'fairlaunch']),
  ('DAO Sybil Resistance', 'Prevent sybil attacks in Solana DAOs. Prove unique personhood without KYC using commitment schemes. One-person-one-vote without revealing identity.', 'DAO Architect', 'DAOArchAddress101', 200, 'voting', 'pragma circom 2.0.0;\ninclude "circomlib/poseidon.circom";\n\ntemplate SybilResistance() {\n    signal input identitySecret;\n    signal input daoId;\n    signal input nullifierSeed;\n    signal output identityCommitment;\n    signal output nullifier;\n    \n    component idHash = Poseidon(1);\n    idHash.inputs[0] <== identitySecret;\n    identityCommitment <== idHash.out;\n    \n    component nullHash = Poseidon(3);\n    nullHash.inputs[0] <== identitySecret;\n    nullHash.inputs[1] <== daoId;\n    nullHash.inputs[2] <== nullifierSeed;\n    nullifier <== nullHash.out;\n}\n\ncomponent main = SybilResistance();', 267, 4.9, 38, true, true, ARRAY['dao', 'governance', 'sybil', 'identity', 'solana']),
  ('Confidential DEX Swap', 'Execute token swaps without revealing trade size or direction. Prove you have tokens to swap without exposing your trading strategy. Anti-MEV protection built-in.', 'MEV Shield', 'MEVShieldAddr', 350, 'finance', 'pragma circom 2.0.0;\ninclude "circomlib/poseidon.circom";\ninclude "circomlib/comparators.circom";\n\ntemplate ConfidentialSwap() {\n    signal input tokenABalance;\n    signal input tokenBBalance;\n    signal input swapAmountA;\n    signal input minReceiveB;\n    signal input traderSecret;\n    signal output canSwap;\n    signal output commitment;\n    \n    component cmp = GreaterEqThan(64);\n    cmp.in[0] <== tokenABalance;\n    cmp.in[1] <== swapAmountA;\n    canSwap <== cmp.out;\n    \n    component hasher = Poseidon(3);\n    hasher.inputs[0] <== traderSecret;\n    hasher.inputs[1] <== swapAmountA;\n    hasher.inputs[2] <== minReceiveB;\n    commitment <== hasher.out;\n}\n\ncomponent main = ConfidentialSwap();', 198, 4.7, 29, false, true, ARRAY['dex', 'swap', 'mev', 'privacy', 'trading']),
  ('Private NFT Ownership', 'Prove you own an NFT from a collection without revealing which specific NFT. Access exclusive content, airdrops, and communities while maintaining privacy.', 'NFT Privacy', 'NFTPrivacyAddr', 150, 'identity', 'pragma circom 2.0.0;\ninclude "circomlib/poseidon.circom";\ninclude "circomlib/comparators.circom";\n\ntemplate PrivateNFT() {\n    signal input tokenId;\n    signal input ownerSecret;\n    signal input collectionMin;\n    signal input collectionMax;\n    signal output isInCollection;\n    signal output ownerCommitment;\n    \n    component minCheck = GreaterEqThan(32);\n    minCheck.in[0] <== tokenId;\n    minCheck.in[1] <== collectionMin;\n    \n    component maxCheck = LessEqThan(32);\n    maxCheck.in[0] <== tokenId;\n    maxCheck.in[1] <== collectionMax;\n    \n    isInCollection <== minCheck.out * maxCheck.out;\n    \n    component hasher = Poseidon(2);\n    hasher.inputs[0] <== ownerSecret;\n    hasher.inputs[1] <== tokenId;\n    ownerCommitment <== hasher.out;\n}\n\ncomponent main = PrivateNFT();', 234, 4.6, 31, false, true, ARRAY['nft', 'ownership', 'collection', 'airdrop', 'access']),
  ('Anonymous Payroll Proof', 'Prove salary range for loans or rentals without revealing exact income or employer. Perfect for privacy-conscious professionals needing financial verification.', 'Enterprise Privacy', 'EntPrivAddr', 180, 'enterprise', 'pragma circom 2.0.0;\ninclude "circomlib/poseidon.circom";\ninclude "circomlib/comparators.circom";\n\ntemplate AnonSalary() {\n    signal input monthlySalary;\n    signal input employerHash;\n    signal input employeeSecret;\n    signal input minRequired;\n    signal output meetsRequirement;\n    signal output employmentProof;\n    \n    component cmp = GreaterEqThan(64);\n    cmp.in[0] <== monthlySalary;\n    cmp.in[1] <== minRequired;\n    meetsRequirement <== cmp.out;\n    \n    component hasher = Poseidon(2);\n    hasher.inputs[0] <== employerHash;\n    hasher.inputs[1] <== employeeSecret;\n    employmentProof <== hasher.out;\n}\n\ncomponent main = AnonSalary();', 145, 4.5, 19, false, true, ARRAY['salary', 'payroll', 'enterprise', 'verification', 'income'])
ON CONFLICT DO NOTHING;

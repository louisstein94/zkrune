// zkRune Token Burn Mechanism
// Deflationary premium features

// Real blockchain imports (currently not used in demo mode)
// import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
// import { 
//   getAssociatedTokenAddress, 
//   createBurnInstruction,
//   TOKEN_PROGRAM_ID,
// } from '@solana/spl-token';

import { ZKRUNE_TOKEN, PREMIUM_TIERS, type PremiumTier } from './config';

export interface BurnResult {
  success: boolean;
  signature?: string;
  amountBurned: number;
  tier?: PremiumTier;
  error?: string;
}

export interface UserPremiumStatus {
  tier: PremiumTier;
  totalBurned: number;
  unlockedAt?: Date;
  expiresAt?: Date;
  features: string[];
}

// Local storage key for premium status
const PREMIUM_STATUS_KEY = 'zkrune_premium_status';
const BURN_HISTORY_KEY = 'zkrune_burn_history';

interface BurnRecord {
  signature: string;
  amount: number;
  tier: PremiumTier;
  timestamp: number;
  wallet: string;
}

// Get user's premium status from local storage
export function getUserPremiumStatus(walletAddress?: string): UserPremiumStatus {
  if (typeof window === 'undefined') {
    return getDefaultStatus();
  }

  try {
    const stored = localStorage.getItem(PREMIUM_STATUS_KEY);
    if (!stored) return getDefaultStatus();

    const status = JSON.parse(stored);
    
    // Check if status belongs to current wallet
    if (walletAddress && status.wallet !== walletAddress) {
      return getDefaultStatus();
    }

    // Check if premium has expired (1 year validity)
    if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
      return getDefaultStatus();
    }

    return {
      tier: status.tier,
      totalBurned: status.totalBurned,
      unlockedAt: status.unlockedAt ? new Date(status.unlockedAt) : undefined,
      expiresAt: status.expiresAt ? new Date(status.expiresAt) : undefined,
      features: PREMIUM_TIERS[status.tier as PremiumTier].features as unknown as string[],
    };
  } catch {
    return getDefaultStatus();
  }
}

function getDefaultStatus(): UserPremiumStatus {
  return {
    tier: 'FREE',
    totalBurned: 0,
    features: PREMIUM_TIERS.FREE.features as unknown as string[],
  };
}

// Save premium status to local storage
function savePremiumStatus(
  wallet: string,
  tier: PremiumTier,
  totalBurned: number
): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

  localStorage.setItem(PREMIUM_STATUS_KEY, JSON.stringify({
    wallet,
    tier,
    totalBurned,
    unlockedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }));
}

// Add burn record to history
function addBurnRecord(record: BurnRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(BURN_HISTORY_KEY);
    const history: BurnRecord[] = stored ? JSON.parse(stored) : [];
    history.unshift(record);
    // Keep only last 100 records
    localStorage.setItem(BURN_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch {
    // Ignore storage errors
  }
}

// Get burn history
export function getBurnHistory(): BurnRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(BURN_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Determine tier based on total burned amount
export function getTierFromBurnedAmount(totalBurned: number): PremiumTier {
  if (totalBurned >= PREMIUM_TIERS.ENTERPRISE.burnRequired) return 'ENTERPRISE';
  if (totalBurned >= PREMIUM_TIERS.PRO.burnRequired) return 'PRO';
  if (totalBurned >= PREMIUM_TIERS.BUILDER.burnRequired) return 'BUILDER';
  return 'FREE';
}

// Calculate tokens needed for next tier
export function getTokensForNextTier(currentTier: PremiumTier): { tier: PremiumTier; tokensNeeded: number } | null {
  const tiers: PremiumTier[] = ['FREE', 'BUILDER', 'PRO', 'ENTERPRISE'];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex >= tiers.length - 1) return null;
  
  const nextTier = tiers[currentIndex + 1];
  return {
    tier: nextTier,
    tokensNeeded: PREMIUM_TIERS[nextTier].burnRequired - PREMIUM_TIERS[currentTier].burnRequired,
  };
}

// Create burn transaction (ready for production)
/* PRODUCTION CODE - Currently commented out for demo mode
export async function createBurnTransaction(
  connection: Connection,
  walletPublicKey: PublicKey,
  amount: number
): Promise<Transaction> {
  const mintPublicKey = new PublicKey(ZKRUNE_TOKEN.MINT_ADDRESS);
  
  // Get user's token account
  const userTokenAccount = await getAssociatedTokenAddress(
    mintPublicKey,
    walletPublicKey
  );

  // Create burn instruction
  const burnAmount = BigInt(Math.floor(amount * Math.pow(10, ZKRUNE_TOKEN.DECIMALS)));
  
  const burnInstruction = createBurnInstruction(
    userTokenAccount,
    mintPublicKey,
    walletPublicKey,
    burnAmount
  );

  // Create transaction
  const transaction = new Transaction().add(burnInstruction);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPublicKey;

  return transaction;
}

// Execute burn for premium upgrade (ready for production)
export async function burnForPremium(
  connection: Connection,
  walletPublicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  targetTier: PremiumTier
): Promise<BurnResult> {
  try {
    const currentStatus = getUserPremiumStatus(walletPublicKey.toBase58());
    const burnRequired = PREMIUM_TIERS[targetTier].burnRequired;
    const amountToBurn = burnRequired - currentStatus.totalBurned;

    if (amountToBurn <= 0) {
      // Already at or above target tier
      return {
        success: true,
        amountBurned: 0,
        tier: targetTier,
      };
    }

    // Create and sign transaction
    const transaction = await createBurnTransaction(
      connection,
      walletPublicKey,
      amountToBurn
    );

    const signedTransaction = await signTransaction(transaction);
    
    // Send transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    // Update premium status
    const newTotalBurned = currentStatus.totalBurned + amountToBurn;
    savePremiumStatus(walletPublicKey.toBase58(), targetTier, newTotalBurned);

    // Add to burn history
    addBurnRecord({
      signature,
      amount: amountToBurn,
      tier: targetTier,
      timestamp: Date.now(),
      wallet: walletPublicKey.toBase58(),
    });

    return {
      success: true,
      signature,
      amountBurned: amountToBurn,
      tier: targetTier,
    };
  } catch (error) {
    return {
      success: false,
      amountBurned: 0,
      error: error instanceof Error ? error.message : 'Burn transaction failed',
    };
  }
}
*/

// Simulate burn for demo/testing (no actual blockchain transaction)
export function simulateBurn(
  walletAddress: string,
  amount: number,
  targetTier: PremiumTier
): BurnResult {
  const currentStatus = getUserPremiumStatus(walletAddress);
  const newTotalBurned = currentStatus.totalBurned + amount;
  const achievedTier = getTierFromBurnedAmount(newTotalBurned);

  // Save the simulated burn
  savePremiumStatus(walletAddress, achievedTier, newTotalBurned);

  // Add to history with mock signature
  const mockSignature = `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  addBurnRecord({
    signature: mockSignature,
    amount,
    tier: achievedTier,
    timestamp: Date.now(),
    wallet: walletAddress,
  });

  return {
    success: true,
    signature: mockSignature,
    amountBurned: amount,
    tier: achievedTier,
  };
}

// Check if user has access to a feature
export function hasFeatureAccess(
  feature: string,
  walletAddress?: string
): boolean {
  const status = getUserPremiumStatus(walletAddress);
  
  // Map features to required tiers
  const featureRequirements: Record<string, PremiumTier[]> = {
    'unlimited-proofs': ['BUILDER', 'PRO', 'ENTERPRISE'],
    'all-templates': ['BUILDER', 'PRO', 'ENTERPRISE'],
    'code-export': ['BUILDER', 'PRO', 'ENTERPRISE'],
    'api-access': ['BUILDER', 'PRO', 'ENTERPRISE'],
    'custom-circuits': ['PRO', 'ENTERPRISE'],
    'gasless-proofs': ['PRO', 'ENTERPRISE'],
    'priority-support': ['PRO', 'ENTERPRISE'],
    'white-label': ['ENTERPRISE'],
    'custom-integrations': ['ENTERPRISE'],
  };

  const requiredTiers = featureRequirements[feature];
  if (!requiredTiers) return true; // Feature not restricted

  return requiredTiers.includes(status.tier);
}

// Get total burned across all users (for display purposes)
export function getTotalBurnedDisplay(): number {
  // This would typically come from an API or blockchain query
  // For now, return accumulated from local history
  const history = getBurnHistory();
  return history.reduce((total, record) => total + record.amount, 0);
}


// zkRune Template Marketplace
// Creator revenue sharing system

import { MARKETPLACE_CONFIG, type MarketplaceCategory } from './config';

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  creator: string;
  creatorAddress: string;
  price: number; // in zkRUNE
  category: MarketplaceCategory;
  circuitCode: string;
  nodes?: any[];
  edges?: any[];
  createdAt: Date;
  updatedAt: Date;
  downloads: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  verified: boolean;
  tags: string[];
}

export interface Purchase {
  id: string;
  templateId: string;
  buyer: string;
  seller: string;
  price: number;
  platformFee: number;
  creatorRevenue: number;
  transactionSignature?: string;
  timestamp: Date;
}

export interface CreatorStats {
  totalTemplates: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
}

// Local storage keys
const MARKETPLACE_KEY = 'zkrune_marketplace_templates';
const PURCHASES_KEY = 'zkrune_marketplace_purchases';
const OWNED_TEMPLATES_KEY = 'zkrune_owned_templates';

// Get all marketplace templates
export function getMarketplaceTemplates(): MarketplaceTemplate[] {
  // Always return default templates on SSR for initial render
  if (typeof window === 'undefined') return getDefaultMarketplaceTemplates();

  try {
    const stored = localStorage.getItem(MARKETPLACE_KEY);
    if (!stored) {
      // Initialize with default templates
      const defaults = getDefaultMarketplaceTemplates();
      localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    
    const templates = JSON.parse(stored);
    // If empty, return defaults
    if (templates.length === 0) {
      const defaults = getDefaultMarketplaceTemplates();
      localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    
    return templates.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  } catch {
    return getDefaultMarketplaceTemplates();
  }
}

// Get templates by category
export function getTemplatesByCategory(category: MarketplaceCategory): MarketplaceTemplate[] {
  return getMarketplaceTemplates().filter(t => t.category === category);
}

// Get featured templates
export function getFeaturedTemplates(): MarketplaceTemplate[] {
  return getMarketplaceTemplates().filter(t => t.featured);
}

// Get templates by creator
export function getTemplatesByCreator(creatorAddress: string): MarketplaceTemplate[] {
  return getMarketplaceTemplates().filter(t => t.creatorAddress === creatorAddress);
}

// Search templates
export function searchTemplates(query: string): MarketplaceTemplate[] {
  const lowerQuery = query.toLowerCase();
  return getMarketplaceTemplates().filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Get a single template
export function getMarketplaceTemplate(id: string): MarketplaceTemplate | null {
  return getMarketplaceTemplates().find(t => t.id === id) || null;
}

// List a new template
export function listTemplate(
  creator: string,
  creatorAddress: string,
  name: string,
  description: string,
  price: number,
  category: MarketplaceCategory,
  circuitCode: string,
  tags: string[],
  nodes?: any[],
  edges?: any[]
): MarketplaceTemplate {
  const now = new Date();

  const template: MarketplaceTemplate = {
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    name,
    description,
    creator,
    creatorAddress,
    price: Math.max(price, MARKETPLACE_CONFIG.MIN_TEMPLATE_PRICE),
    category,
    circuitCode,
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    featured: false,
    verified: false,
    tags,
  };

  const templates = getMarketplaceTemplates();
  templates.unshift(template);
  saveTemplates(templates);

  return template;
}

// Purchase a template
export function purchaseTemplate(
  templateId: string,
  buyerAddress: string
): { success: boolean; purchase?: Purchase; error?: string } {
  const template = getMarketplaceTemplate(templateId);
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  // Check if already owned
  if (isTemplateOwned(templateId, buyerAddress)) {
    return { success: false, error: 'Template already owned' };
  }

  // Calculate fees
  const platformFee = (template.price * MARKETPLACE_CONFIG.PLATFORM_FEE) / 100;
  const creatorRevenue = template.price - platformFee;

  // Create purchase record
  const purchase: Purchase = {
    id: `purch_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    templateId,
    buyer: buyerAddress,
    seller: template.creatorAddress,
    price: template.price,
    platformFee,
    creatorRevenue,
    timestamp: new Date(),
  };

  // Save purchase
  const purchases = getPurchases();
  purchases.unshift(purchase);
  savePurchases(purchases);

  // Add to owned templates
  addOwnedTemplate(templateId, buyerAddress);

  // Update download count
  const templates = getMarketplaceTemplates();
  const templateIndex = templates.findIndex(t => t.id === templateId);
  if (templateIndex !== -1) {
    templates[templateIndex].downloads += 1;
    saveTemplates(templates);
  }

  return { success: true, purchase };
}

// Rate a template
export function rateTemplate(
  templateId: string,
  raterAddress: string,
  rating: number
): { success: boolean; error?: string } {
  if (rating < 1 || rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5' };
  }

  // Must own template to rate
  if (!isTemplateOwned(templateId, raterAddress)) {
    return { success: false, error: 'Must own template to rate' };
  }

  const templates = getMarketplaceTemplates();
  const templateIndex = templates.findIndex(t => t.id === templateId);
  if (templateIndex === -1) {
    return { success: false, error: 'Template not found' };
  }

  const template = templates[templateIndex];
  const newRatingCount = template.ratingCount + 1;
  const newRating = ((template.rating * template.ratingCount) + rating) / newRatingCount;

  templates[templateIndex] = {
    ...template,
    rating: newRating,
    ratingCount: newRatingCount,
  };

  saveTemplates(templates);
  return { success: true };
}

// Check if user owns a template
export function isTemplateOwned(templateId: string, userAddress: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(OWNED_TEMPLATES_KEY);
    if (!stored) return false;
    
    const owned = JSON.parse(stored);
    return owned[userAddress]?.includes(templateId) || false;
  } catch {
    return false;
  }
}

// Get user's owned templates
export function getOwnedTemplates(userAddress: string): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(OWNED_TEMPLATES_KEY);
    if (!stored) return [];
    
    const owned = JSON.parse(stored);
    return owned[userAddress] || [];
  } catch {
    return [];
  }
}

// Get creator statistics
export function getCreatorStats(creatorAddress: string): CreatorStats {
  const templates = getTemplatesByCreator(creatorAddress);
  const purchases = getPurchases().filter(p => p.seller === creatorAddress);

  const totalRevenue = purchases.reduce((sum, p) => sum + p.creatorRevenue, 0);
  const totalDownloads = templates.reduce((sum, t) => sum + t.downloads, 0);
  
  const ratedTemplates = templates.filter(t => t.ratingCount > 0);
  const averageRating = ratedTemplates.length > 0
    ? ratedTemplates.reduce((sum, t) => sum + t.rating, 0) / ratedTemplates.length
    : 0;

  return {
    totalTemplates: templates.length,
    totalDownloads,
    totalRevenue,
    averageRating,
  };
}

// Get marketplace statistics
export function getMarketplaceStats(): {
  totalTemplates: number;
  totalCreators: number;
  totalSales: number;
  totalVolume: number;
} {
  const templates = getMarketplaceTemplates();
  const purchases = getPurchases();
  const uniqueCreators = new Set(templates.map(t => t.creatorAddress));

  return {
    totalTemplates: templates.length,
    totalCreators: uniqueCreators.size,
    totalSales: purchases.length,
    totalVolume: purchases.reduce((sum, p) => sum + p.price, 0),
  };
}

// Helper functions
function getPurchases(): Purchase[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PURCHASES_KEY);
    if (!stored) return [];
    
    const purchases = JSON.parse(stored);
    return purchases.map((p: any) => ({
      ...p,
      timestamp: new Date(p.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveTemplates(templates: MarketplaceTemplate[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MARKETPLACE_KEY, JSON.stringify(templates));
}

function savePurchases(purchases: Purchase[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
}

function addOwnedTemplate(templateId: string, userAddress: string): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(OWNED_TEMPLATES_KEY);
    const owned = stored ? JSON.parse(stored) : {};
    
    if (!owned[userAddress]) {
      owned[userAddress] = [];
    }
    
    if (!owned[userAddress].includes(templateId)) {
      owned[userAddress].push(templateId);
    }
    
    localStorage.setItem(OWNED_TEMPLATES_KEY, JSON.stringify(owned));
  } catch {
    // Ignore storage errors
  }
}

// Default marketplace templates - Solana Privacy Hack focused
function getDefaultMarketplaceTemplates(): MarketplaceTemplate[] {
  const now = new Date();

  return [
    {
      id: 'tmpl_private_transfer',
      name: 'Private SPL Token Transfer',
      description: 'Send SPL tokens privately on Solana. Proves you have sufficient balance without revealing your wallet address or exact amount. Perfect for payroll, donations, and confidential transactions.',
      creator: 'zkRune Labs',
      creatorAddress: 'zkRuneLabsAddress123',
      price: 300,
      category: 'finance',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template PrivateTransfer() {
    signal input balance;
    signal input amount;
    signal input recipientHash;
    signal input senderSecret;
    signal output isValid;
    signal output nullifier;
    
    // Verify sufficient balance
    component cmp = GreaterEqThan(64);
    cmp.in[0] <== balance;
    cmp.in[1] <== amount;
    isValid <== cmp.out;
    
    // Create nullifier to prevent double-spending
    component hasher = Poseidon(2);
    hasher.inputs[0] <== senderSecret;
    hasher.inputs[1] <== amount;
    nullifier <== hasher.out;
}

component main = PrivateTransfer();`,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 456,
      rating: 4.9,
      ratingCount: 67,
      featured: true,
      verified: true,
      tags: ['private', 'transfer', 'solana', 'spl', 'payment'],
    },
    {
      id: 'tmpl_anon_launch',
      name: 'Anonymous Launchpad Allocation',
      description: 'Prove eligibility for token launches without revealing your wallet. Show you meet holding requirements, time locks, or other criteria privately. Prevents front-running and whale identification.',
      creator: 'Privacy DeFi',
      creatorAddress: 'PrivacyDeFiAddr',
      price: 250,
      category: 'finance',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template LaunchpadAllocation() {
    signal input walletSecret;
    signal input tokenBalance;
    signal input holdingDays;
    signal input minBalance;
    signal input minDays;
    signal output isEligible;
    signal output commitment;
    
    component balCheck = GreaterEqThan(64);
    balCheck.in[0] <== tokenBalance;
    balCheck.in[1] <== minBalance;
    
    component dayCheck = GreaterEqThan(32);
    dayCheck.in[0] <== holdingDays;
    dayCheck.in[1] <== minDays;
    
    isEligible <== balCheck.out * dayCheck.out;
    
    component hasher = Poseidon(1);
    hasher.inputs[0] <== walletSecret;
    commitment <== hasher.out;
}

component main = LaunchpadAllocation();`,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 312,
      rating: 4.8,
      ratingCount: 42,
      featured: true,
      verified: true,
      tags: ['launchpad', 'allocation', 'privacy', 'fairlaunch'],
    },
    {
      id: 'tmpl_dao_sybil',
      name: 'DAO Sybil Resistance',
      description: 'Prevent sybil attacks in Solana DAOs. Prove unique personhood without KYC using commitment schemes. One-person-one-vote without revealing identity.',
      creator: 'DAO Architect',
      creatorAddress: 'DAOArchAddress101',
      price: 200,
      category: 'voting',
      circuitCode: `pragma circom 2.0.0;
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

component main = SybilResistance();`,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 267,
      rating: 4.9,
      ratingCount: 38,
      featured: true,
      verified: true,
      tags: ['dao', 'governance', 'sybil', 'identity', 'solana'],
    },
    {
      id: 'tmpl_confidential_swap',
      name: 'Confidential DEX Swap',
      description: 'Execute token swaps without revealing trade size or direction. Prove you have tokens to swap without exposing your trading strategy. Anti-MEV protection built-in.',
      creator: 'MEV Shield',
      creatorAddress: 'MEVShieldAddr',
      price: 350,
      category: 'finance',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template ConfidentialSwap() {
    signal input tokenABalance;
    signal input tokenBBalance;
    signal input swapAmountA;
    signal input minReceiveB;
    signal input traderSecret;
    signal output canSwap;
    signal output commitment;
    
    component cmp = GreaterEqThan(64);
    cmp.in[0] <== tokenABalance;
    cmp.in[1] <== swapAmountA;
    canSwap <== cmp.out;
    
    component hasher = Poseidon(3);
    hasher.inputs[0] <== traderSecret;
    hasher.inputs[1] <== swapAmountA;
    hasher.inputs[2] <== minReceiveB;
    commitment <== hasher.out;
}

component main = ConfidentialSwap();`,
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 198,
      rating: 4.7,
      ratingCount: 29,
      featured: false,
      verified: true,
      tags: ['dex', 'swap', 'mev', 'privacy', 'trading'],
    },
    {
      id: 'tmpl_private_nft',
      name: 'Private NFT Ownership',
      description: 'Prove you own an NFT from a collection without revealing which specific NFT. Access exclusive content, airdrops, and communities while maintaining privacy.',
      creator: 'NFT Privacy',
      creatorAddress: 'NFTPrivacyAddr',
      price: 150,
      category: 'identity',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template PrivateNFT() {
    signal input tokenId;
    signal input ownerSecret;
    signal input collectionMin;
    signal input collectionMax;
    signal output isInCollection;
    signal output ownerCommitment;
    
    component minCheck = GreaterEqThan(32);
    minCheck.in[0] <== tokenId;
    minCheck.in[1] <== collectionMin;
    
    component maxCheck = LessEqThan(32);
    maxCheck.in[0] <== tokenId;
    maxCheck.in[1] <== collectionMax;
    
    isInCollection <== minCheck.out * maxCheck.out;
    
    component hasher = Poseidon(2);
    hasher.inputs[0] <== ownerSecret;
    hasher.inputs[1] <== tokenId;
    ownerCommitment <== hasher.out;
}

component main = PrivateNFT();`,
      createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 234,
      rating: 4.6,
      ratingCount: 31,
      featured: false,
      verified: true,
      tags: ['nft', 'ownership', 'collection', 'airdrop', 'access'],
    },
    {
      id: 'tmpl_anon_salary',
      name: 'Anonymous Payroll Proof',
      description: 'Prove salary range for loans or rentals without revealing exact income or employer. Perfect for privacy-conscious professionals needing financial verification.',
      creator: 'Enterprise Privacy',
      creatorAddress: 'EntPrivAddr',
      price: 180,
      category: 'enterprise',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template AnonSalary() {
    signal input monthlySalary;
    signal input employerHash;
    signal input employeeSecret;
    signal input minRequired;
    signal output meetsRequirement;
    signal output employmentProof;
    
    component cmp = GreaterEqThan(64);
    cmp.in[0] <== monthlySalary;
    cmp.in[1] <== minRequired;
    meetsRequirement <== cmp.out;
    
    component hasher = Poseidon(2);
    hasher.inputs[0] <== employerHash;
    hasher.inputs[1] <== employeeSecret;
    employmentProof <== hasher.out;
}

component main = AnonSalary();`,
      createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 145,
      rating: 4.5,
      ratingCount: 19,
      featured: false,
      verified: true,
      tags: ['salary', 'payroll', 'enterprise', 'verification', 'income'],
    },
  ];
}


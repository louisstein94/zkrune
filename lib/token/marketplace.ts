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
  if (typeof window === 'undefined') return getDefaultMarketplaceTemplates();

  try {
    const stored = localStorage.getItem(MARKETPLACE_KEY);
    if (!stored) return getDefaultMarketplaceTemplates();
    
    const templates = JSON.parse(stored);
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

// Default marketplace templates
function getDefaultMarketplaceTemplates(): MarketplaceTemplate[] {
  const now = new Date();

  return [
    {
      id: 'tmpl_premium_kyc',
      name: 'Advanced KYC Verification',
      description: 'Enterprise-grade KYC verification with multi-attribute proofs. Verify age, nationality, and accreditation status simultaneously without revealing any personal data.',
      creator: 'zkRune Labs',
      creatorAddress: 'zkRuneLabsAddress123',
      price: 250,
      category: 'identity',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template AdvancedKYC() {
    signal input birthYear;
    signal input nationality;
    signal input accredited;
    signal input currentYear;
    signal input minAge;
    signal output isVerified;
    
    // Age verification
    signal age;
    age <== currentYear - birthYear;
    
    component ageCheck = GreaterEqThan(32);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minAge;
    
    isVerified <== ageCheck.out * accredited;
}

component main = AdvancedKYC();`,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 342,
      rating: 4.8,
      ratingCount: 45,
      featured: true,
      verified: true,
      tags: ['kyc', 'identity', 'enterprise', 'compliance'],
    },
    {
      id: 'tmpl_defi_credit',
      name: 'DeFi Credit Score Proof',
      description: 'Prove your on-chain credit worthiness without revealing your full transaction history. Perfect for under-collateralized lending protocols.',
      creator: 'DeFi Dev',
      creatorAddress: 'DeFiDevAddress456',
      price: 150,
      category: 'finance',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";

template CreditScore() {
    signal input score;
    signal input threshold;
    signal input walletHash;
    signal output meetsThreshold;
    signal output commitment;
    
    component cmp = GreaterEqThan(32);
    cmp.in[0] <== score;
    cmp.in[1] <== threshold;
    meetsThreshold <== cmp.out;
    
    component hasher = Poseidon(2);
    hasher.inputs[0] <== walletHash;
    hasher.inputs[1] <== score;
    commitment <== hasher.out;
}

component main = CreditScore();`,
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 189,
      rating: 4.5,
      ratingCount: 23,
      featured: true,
      verified: true,
      tags: ['defi', 'credit', 'lending', 'finance'],
    },
    {
      id: 'tmpl_gaming_rank',
      name: 'Private Gaming Rank Proof',
      description: 'Prove your gaming rank or achievements without revealing your player ID. Great for anonymous esports matchmaking.',
      creator: 'GameFi Builder',
      creatorAddress: 'GameFiAddress789',
      price: 75,
      category: 'gaming',
      circuitCode: `pragma circom 2.0.0;
include "circomlib/poseidon.circom";

template GamingRank() {
    signal input playerId;
    signal input rank;
    signal input minRank;
    signal output qualifies;
    signal output anonId;
    
    component cmp = GreaterEqThan(16);
    cmp.in[0] <== rank;
    cmp.in[1] <== minRank;
    qualifies <== cmp.out;
    
    component hasher = Poseidon(1);
    hasher.inputs[0] <== playerId;
    anonId <== hasher.out;
}

component main = GamingRank();`,
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      downloads: 98,
      rating: 4.2,
      ratingCount: 12,
      featured: false,
      verified: true,
      tags: ['gaming', 'esports', 'matchmaking', 'rank'],
    },
    {
      id: 'tmpl_dao_sybil',
      name: 'DAO Sybil Resistance',
      description: 'Prevent sybil attacks in DAOs by proving unique personhood without KYC. Uses commitment schemes to ensure one-person-one-vote.',
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
      tags: ['dao', 'governance', 'sybil', 'identity'],
    },
  ];
}


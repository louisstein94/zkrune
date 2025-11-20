/**
 * PWA Configuration
 * Single source of truth for all PWA settings
 * Follows DRY principle and separation of concerns
 */

import { PWAConfig } from './types';

/**
 * Brand Colors
 * Centralized color definitions for consistency
 */
const BRAND_COLORS = {
  background: '#000000',
  theme: '#000000',
  accent: '#8B5CF6', // Purple accent from zkRune branding
} as const;

/**
 * Icon Sizes
 * Standard PWA icon sizes for optimal compatibility
 */
const ICON_SIZES = [
  '72x72',
  '96x96',
  '128x128',
  '144x144',
  '152x152',
  '192x192',
  '384x384',
  '512x512',
] as const;

/**
 * Generate icon configuration array
 * @returns Array of PWA icon configurations
 */
const generateIconsConfig = () => {
  return ICON_SIZES.map((size) => ({
    src: `/icons/icon-${size}.png`,
    sizes: size,
    type: 'image/png',
    purpose: 'any' as const,
  }));
};

/**
 * Critical ZK Assets that MUST be cached for offline proof generation
 * These are the WASM and zkey files required by SnarkJS
 */
const ZK_CRITICAL_ASSETS = [
  // Age Verification Circuit
  '/circuits/age-verification.wasm',
  '/circuits/age-verification.zkey',
  '/circuits/age-verification_vkey.json',
  
  // Balance Proof Circuit
  '/circuits/balance-proof.wasm',
  '/circuits/balance-proof.zkey',
  '/circuits/balance-proof_vkey.json',
  
  // Membership Proof Circuit
  '/circuits/membership-proof.wasm',
  '/circuits/membership-proof.zkey',
  '/circuits/membership-proof_vkey.json',
  
  // Private Voting Circuit
  '/circuits/private-voting.wasm',
  '/circuits/private-voting.zkey',
  '/circuits/private-voting_vkey.json',
  
  // Range Proof Circuit
  '/circuits/range-proof.wasm',
  '/circuits/range-proof.zkey',
  '/circuits/range-proof_vkey.json',
] as const;

/**
 * Main PWA Configuration
 * Exported as singleton to ensure consistency across the app
 */
export const pwaConfig: PWAConfig = {
  manifest: {
    name: 'zkRune - Offline Privacy Builder',
    short_name: 'zkRune',
    description: 'Generate Zero-Knowledge Proofs offline. No server. Complete privacy.',
    start_url: '/',
    display: 'standalone',
    background_color: BRAND_COLORS.background,
    theme_color: BRAND_COLORS.theme,
    orientation: 'portrait',
    scope: '/',
    icons: generateIconsConfig(),
    categories: ['productivity', 'utilities', 'developer tools'],
  },
  
  cacheStrategy: {
    // Critical ZK assets for offline proof generation
    zkAssets: [...ZK_CRITICAL_ASSETS],
    
    // Static assets (HTML, CSS, JS)
    staticAssets: [
      '/_next/static/**/*',
      '/fonts/**/*',
      '/zkrune-log.png',
    ],
    
    // API routes should NOT be cached (dynamic data)
    excludedRoutes: [
      '/api/**/*',
    ],
  },
  
  // Enable offline support (this is our killer feature!)
  offlineSupport: true,
};

/**
 * Helper function to check if a URL should be cached
 * @param url - URL to check
 * @returns boolean indicating if URL should be cached
 */
export const shouldCacheUrl = (url: string): boolean => {
  const { excludedRoutes } = pwaConfig.cacheStrategy;
  
  // Check if URL matches any excluded pattern
  for (const pattern of excludedRoutes) {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*'));
    if (regex.test(url)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get estimated cache size in MB
 * Useful for informing users about storage requirements
 */
export const getEstimatedCacheSize = (): number => {
  // Each WASM file ~500KB, each zkey ~1MB, each vkey ~1KB
  // 5 circuits × (0.5 + 1 + 0.001) ≈ 7.5 MB
  const zkAssetsSize = ZK_CRITICAL_ASSETS.length * 0.5; // Conservative estimate
  const staticAssetsSize = 3; // HTML, CSS, JS ~3MB
  
  return Math.ceil(zkAssetsSize + staticAssetsSize);
};


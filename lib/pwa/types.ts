/**
 * PWA Type Definitions
 * Central type definitions for Progressive Web App configuration
 */

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'maskable' | 'any' | 'monochrome';
}

export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  icons: PWAIcon[];
  categories?: string[];
}

export interface PWACacheStrategy {
  // Critical ZK proof generation files (WASM, zkey)
  zkAssets: string[];
  // HTML, CSS, JS files
  staticAssets: string[];
  // API routes that should never be cached
  excludedRoutes: string[];
}

export interface PWAConfig {
  manifest: PWAManifest;
  cacheStrategy: PWACacheStrategy;
  offlineSupport: boolean;
}


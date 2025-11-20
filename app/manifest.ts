/**
 * PWA Manifest
 * Next.js automatically generates manifest.json from this file
 * Type-safe manifest configuration
 */

import { MetadataRoute } from 'next';
import { pwaConfig } from '@/lib/pwa/config';

export default function manifest(): MetadataRoute.Manifest {
  const { manifest: config } = pwaConfig;
  
  return {
    name: config.name,
    short_name: config.short_name,
    description: config.description,
    start_url: config.start_url,
    display: config.display,
    background_color: config.background_color,
    theme_color: config.theme_color,
    orientation: config.orientation,
    scope: config.scope,
    icons: config.icons,
    categories: config.categories,
  };
}


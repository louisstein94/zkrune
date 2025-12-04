/**
 * Image optimization utilities
 */

export interface ImageConfig {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'png' | 'jpg';
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(config: ImageConfig): string {
  const { src, width, height, quality = 80, format = 'webp' } = config;
  
  // For local images, use Next.js Image Optimization
  if (src.startsWith('/')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`;
  }
  
  return src;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lazy load images with intersection observer
 */
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(src: string, widths: number[]): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl({ src, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Preload critical assets
 */
export function preloadCriticalAssets() {
  if (typeof window === 'undefined') return;

  const criticalAssets = [
    '/zcash-logo.png',
    '/mobile-logo.png',
  ];

  criticalAssets.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}


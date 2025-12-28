// Temporarily disable PWA to fix Babel dependencies issue
// import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.figma.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
  // Compress responses
  compress: true,
  // Enable SWC minification
  swcMinify: true,
  // Production source maps (disabled for better performance)
  productionBrowserSourceMaps: false,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@solana/web3.js', 'reactflow'],
  },
  // Webpack configuration for snarkjs
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        readline: false,
      };
      
      // Prevent snarkjs from being split into separate chunks
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            snarkjs: {
              test: /[\\/]node_modules[\\/]snarkjs[\\/]/,
              name: 'snarkjs',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },
};

// Temporarily disable PWA
export default nextConfig;

/*
/**
 * PWA Configuration
 * Wraps Next.js config with PWA capabilities
 */
/*
const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*\.(wasm|zkey)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'zk-circuits',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/circuits\/.*_vkey\.json$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'zk-verification-keys',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
*/

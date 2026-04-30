const BUILD_ID = Date.now().toString(36);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CIRCUIT_V: BUILD_ID,
  },
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['snarkjs', 'ffjavascript'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        readline: false,
      };
    }
    return config;
  },
  // Telegram embeds Mini Apps in an iframe-like webview; allow it.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.telegram.org https://web.telegram.org" },
        ],
      },
    ];
  },
};

export default nextConfig;

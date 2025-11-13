/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.figma.com'],
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
};

export default nextConfig;

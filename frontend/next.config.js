/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com'],
    unoptimized: false,
  },
  experimental: {
    turbo: {
      resolveAlias: {
        '@': './app',
      },
    },
  },
};

module.exports = nextConfig;

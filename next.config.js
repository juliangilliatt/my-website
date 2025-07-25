/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
        pathname: '**',
      }
    ],
  }
};

module.exports = nextConfig;
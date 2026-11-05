import type { NextConfig } from 'next';
import { buildSecurityHeaders } from './src/infra/http/securityHeaders';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: buildSecurityHeaders() }];
  },
};

export default nextConfig;

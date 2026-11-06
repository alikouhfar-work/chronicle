import type { NextConfig } from 'next';
import { buildSecurityHeaders } from './src/infra/http/securityHeaders';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Marks this app as upgraded past the published security advisory so the CLI
    // stops interrupting builds to nag about it. Set by `next upgrade --agent=security`.
    agentUpgrade: 'security',
  },
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

import { publicEnv } from '@/shared/lib/publicEnv';
import type { MetadataRoute } from 'next';

const getBaseUrl = () =>
  publicEnv.appUrl;

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/*', '/settings'],
  },
  sitemap: `${getBaseUrl()}/sitemap.xml`,
});

export default robots;

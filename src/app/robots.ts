import type { MetadataRoute } from 'next';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/*', '/settings'],
  },
  sitemap: `${getBaseUrl()}/sitemap.xml`,
});

export default robots;

import type { MetadataRoute } from 'next';

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';

const sitemap = (): MetadataRoute.Sitemap => {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  const routes = ['/', '/library', '/search', '/login', '/signup'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));
};

export default sitemap;

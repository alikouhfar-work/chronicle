import { publicEnv } from '@/shared/lib/publicEnv';
import type { MetadataRoute } from 'next';

const getBaseUrl = () =>
  publicEnv.appUrl;

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

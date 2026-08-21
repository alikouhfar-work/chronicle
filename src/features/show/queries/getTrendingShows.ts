import { serverFetch } from '@/utils/serverFetch';

export const getTrendingShows = async () => {
  const res = await serverFetch('/api/shows/trending');

  if (!res.ok) {
    throw new Error('Failed to fetch trending shows');
  }

  const response = await res.json();
  return response.data;
}
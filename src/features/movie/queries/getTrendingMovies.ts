import { serverFetch } from '@/utils/serverFetch';

export const getTrendingMovies = async () => {
  const res = await serverFetch('/api/movies/trending');

  if (!res.ok) {
    throw new Error('Failed to fetch trending movies');
  }

  const response = await res.json();
  return response.data;
}
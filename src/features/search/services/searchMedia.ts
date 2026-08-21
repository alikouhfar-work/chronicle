import { serverFetch } from '@/utils/serverFetch';

export const searchMedia = async (query: string) => {
  const res = await serverFetch(`/api/search?query=${query}`);

  if (!res.ok) {
    throw new Error('Failed to fetch search media');
  }

  const response = await res.json();
  return response.data;
};

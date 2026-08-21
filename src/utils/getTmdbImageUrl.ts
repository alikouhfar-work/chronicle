const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getTmdbImageUrl = (
  path: string | null,
  size: 'w185' | 'w342' | 'w500' | 'original' = 'w500',
) => {
  if (!path) return null;

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

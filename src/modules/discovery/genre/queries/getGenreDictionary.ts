import { unstable_cache } from 'next/cache';
import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import type { GenreRaw } from '@/modules/discovery/genre';
import { GENRES_TAG } from '@/shared/lib/cacheTags';

type Genre = [number, string];

const readGenreList = async (path: 'genre/movie/list' | 'genre/tv/list'): Promise<Genre[]> => {
  try {
    const { genres } = await tmdbFetch<{ genres: GenreRaw[] }>(path, {
      next: { revalidate: 604800 },
    });
    return genres.map((genre): Genre => [genre.id, genre.name]);
  } catch {
    return [];
  }
};

const readAllGenres = async (): Promise<Genre[]> => {
  const [movieGenres, showGenres] = await Promise.all([
    readGenreList('genre/movie/list'),
    readGenreList('genre/tv/list'),
  ]);
  return [...movieGenres, ...showGenres];
};

/**
 * The genre list is identical for every visitor and changes a few times a year,
 * yet it was rebuilt into a Map on every trending/similar render. Cached as
 * tuples because a Map does not survive serialisation.
 */
const cachedGenres = unstable_cache(readAllGenres, ['genre-dictionary'], {
  tags: [GENRES_TAG],
  revalidate: 604800,
});

export const getGenreDictionary = async (): Promise<Map<number, string>> => {
  try {
    return new Map(await cachedGenres());
  } catch {
    // No cache store (unit tests, scripts): read through.
    return new Map(await readAllGenres());
  }
};

import { tmdbFetchForUser as tmdbFetch } from '@/infra/tmdb/forUser';
import { getGenreDictionary } from '@/modules/discovery/genre';
import { SearchResultResponse } from '@/modules/discovery/search';
import { mapSearchResult } from '@/modules/discovery/search/mappers/mapSearchResult';
import { getTrackedMoviesLookup } from '@/modules/movie/queries/getTrackedMoviesLookup';
import { getTrackedShowsLookup } from '@/modules/show/queries/getTrackedShowsLookup';
import { toAppError, ValidationError } from '@/shared/lib/errors';

const MAX_QUERY_LENGTH = 200;

export const searchMedia = async (query: string) => {
  if (!query.trim()) {
    return [];
  }

  if (query.trim().length > MAX_QUERY_LENGTH) {
    throw new ValidationError(`Search query must be ${MAX_QUERY_LENGTH} characters or fewer`);
  }

  try {
    const [searchResult, genreDictionary] = await Promise.all([
      tmdbFetch<SearchResultResponse>(`/search/multi?query=${encodeURIComponent(query)}`, {
        next: {
          revalidate: 300,
        },
      }),
      getGenreDictionary(),
    ]);

    const results = mapSearchResult(searchResult.results, genreDictionary);

    const movieTmdbIds = results
      .filter((result) => result.mediaType === 'movie')
      .map((result) => result.id);

    const showTmdbIds = results
      .filter((result) => result.mediaType === 'tv')
      .map((result) => result.id);

    const [trackedMoviesLookup, trackedShowsLookup] = await Promise.all([
      getTrackedMoviesLookup(movieTmdbIds),
      getTrackedShowsLookup(showTmdbIds),
    ]);

    return results.map((result) => ({
      ...result,
      isTracked:
        result.mediaType === 'movie'
          ? trackedMoviesLookup.has(result.id)
          : trackedShowsLookup.has(result.id),
    }));
  } catch (error) {
    throw toAppError(error, 'Media search failed');
  }
};

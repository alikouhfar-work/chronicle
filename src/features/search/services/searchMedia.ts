import { tmdbFetch } from '@/utils/tmdbFetch';
import { getGenreDictionary } from '@/features/genre';
import { SearchResultResponse } from '@/features/search';
import { mapSearchResult } from '@/features/search/mappers/mapSearchResult';
import { getTrackedShowsLookup } from '@/features/show';
import { getTrackedMoviesLookup } from '@/features/movie/queries/getTrackedMoviesLookup';

export const searchMedia = async (query: string) => {
  try {
    if (!query.trim()) {
      return [];
    }

    const [searchResult, genreDictionary] = await Promise.all([
      tmdbFetch<SearchResultResponse>(`/search/multi?query=${encodeURIComponent(query)}`),
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
    console.error('Media search failed:', error);
    return [];
  }
};

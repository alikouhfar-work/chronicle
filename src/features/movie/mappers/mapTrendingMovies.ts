import { TrendingShowRaw } from '@/features/show';
import { TrendingShow } from '@/features/show/types/trending';

export const mapTrendingShows = (
  trendingShows: TrendingShowRaw[],
  genreDictionary: Map<number, string>,
): Omit<TrendingShow, 'isTracked'>[] =>
  trendingShows.map((trendingShow) => ({
    backdropPath: trendingShow.backdrop_path,
    id: trendingShow.id,
    name: trendingShow.name,
    overview: trendingShow.overview,
    mediaType: trendingShow.media_type,
    releaseDate: trendingShow.first_air_date,
    rating: trendingShow.vote_average,
    voteCount: trendingShow.vote_count,
    originCountry: trendingShow.origin_country,
    genres: trendingShow.genre_ids
      .map((id) => {
        const name = genreDictionary.get(id);
        return name ? { id, name } : null;
      })
      .filter((genre): genre is { id: number; name: string } => genre !== null),
  }));

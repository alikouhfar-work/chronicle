import { ShowSearchResultRaw } from '@/features/show';
import { ShowSearchResult } from '@/features/show/types/showSearchResult';

export const mapShowSearchResult = (
  show: ShowSearchResultRaw,
  genreDictionary: Map<number, string>,
): ShowSearchResult => ({
  adult: show.adult,
  backdropPath: show.backdrop_path,
  id: show.id,
  name: show.name,
  overview: show.overview,
  posterPath: show.poster_path,
  mediaType: show.media_type,
  firstAirDate: show.first_air_date,
  voteAverage: show.vote_average,
  originCountry: show.origin_country,
  genres: show.genre_ids
    .map((id) => {
      const name = genreDictionary.get(id);
      return name ? { id, name } : null;
    })
    .filter((genre): genre is { id: number; name: string } => genre !== null),
});

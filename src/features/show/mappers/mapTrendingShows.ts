import { Show, ShowRaw } from '@/features/show/types/show';

export const mapShow = (show: ShowRaw): Show => ({
  id: show.id,
  tmdbId: show.id,
  name: show.name,
  status: show.status,
  overview: show.overview,
  posterPath: show.poster_path,
  backdropPath: show.backdrop_path,
  firstAirDate: show.first_air_date,
  lastAirDate: show.last_air_date,
  numberOfSeasons: show.number_of_seasons,
  numberOfEpisodes: show.number_of_episodes,
  inProduction: show.in_production,
  genres: show.genres,
  seasons: show.seasons,
});

import { MappedUpNextEpisode, UpNextEpisode } from '@/features/episode/types/upNextEpisode';

export const mapUpNextEpisodes = (episodes: UpNextEpisode[]): MappedUpNextEpisode[] =>
  episodes.map((episode) => ({
    id: episode.id,
    name: episode.name,
    airDate: episode.airDate,
    overview: episode.overview,
    showId: episode.season.showId,
    showName: episode.season.show.name,
    episodeNumber: episode.episodeNumber,
    showTmdbId: episode.season.show.tmdbId,
    seasonNumber: episode.season.seasonNumber,
    posterPath: episode.season.show.posterPath,
  }));

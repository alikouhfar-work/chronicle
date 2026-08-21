import { MappedUpcomingEpisode, UpcomingEpisode } from '@/features/episode/types/upcomingEpisode';

export const mapUpcomingEpisodes = (episodes: UpcomingEpisode[]): MappedUpcomingEpisode[] =>
  episodes.map((episode) => ({
    id: episode.id,
    name: episode.name,
    airDate: episode.airDate,
    overview: episode.overview,
    mediaId: episode.season.showId,
    mediaName: episode.season.show.name,
    episodeNumber: episode.episodeNumber,
    mediaTmdbId: episode.season.show.tmdbId,
    seasonNumber: episode.season.seasonNumber,
    posterPath: episode.season.show.posterPath,
  }));

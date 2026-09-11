import {
  MappedUpcomingEpisode,
  MappedUpcomingEpisodeItem,
  UpcomingEpisode,
} from '@/features/episode/types/upcomingEpisode';

export const mapUpcomingEpisodes = (episodes: UpcomingEpisode[]): MappedUpcomingEpisode[] => {
  const groups = new Map<string, MappedUpcomingEpisode>();

  for (const episode of episodes) {
    const showId = episode.season.showId;
    const dateKey = episode.airDate!.toISOString().split('T')[0];
    const key = `${showId}:${dateKey}`;

    const mappedEpisode: MappedUpcomingEpisodeItem = {
      id: episode.id,
      seasonNumber: episode.season.seasonNumber,
      episodeNumber: episode.episodeNumber,
      name: episode.name,
      overview: episode.overview,
    };

    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.episodes.push(mappedEpisode);
      continue;
    }

    groups.set(key, {
      id: key,
      showId,
      showName: episode.season.show.name,
      showTmdbId: episode.season.show.tmdbId,
      posterPath: episode.season.show.posterPath,
      airDate: episode.airDate,
      episodes: [mappedEpisode],
    });
  }

  return Array.from(groups.values());
};

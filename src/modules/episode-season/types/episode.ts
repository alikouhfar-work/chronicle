import type { EpisodeTracking } from '@/modules/episode-season/types/tracking';

export type EpisodeRaw = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  runtime: number;
  air_date: Date;
};

export type Episode = {
  id: string;
  tmdbId: number;
  episodeNumber: number;
  name: string;
  overview: string;
  runtime: number | null;
  airDate: Date | null;
  rewatchCount: number;
  tracking?: EpisodeTracking | null;
};

export type TrackedEpisodeDetails = {
  show: {
    id: string;
    tmdbId: number;
    name: string;
    posterPath: string | null;
    backdropPath: string | null;
    overview: string;
  };
  season: {
    id: string;
    name: string;
    seasonNumber: number;
  };
  episode: Episode;
};

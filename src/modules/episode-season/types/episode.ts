import { EpisodeTracking } from '@/modules/episode-season/types/tracking';

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

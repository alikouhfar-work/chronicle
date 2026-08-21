import { EpisodeTracking } from '@/features/episode/types/tracking';

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
  episodeNumber: number;
  name: string;
  overview: string;
  runtime: number | null;
  airDate: Date | null;
  tracking?: EpisodeTracking | null;
};
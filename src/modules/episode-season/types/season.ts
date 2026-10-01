import { Episode, EpisodeRaw } from '@/modules/episode-season';

export type SeasonRaw = {
  id: number;
  name: string;
  show_id: string;
  season_number: number;
  episodes: EpisodeRaw[];
  air_date: Date;
};

export type Season = {
  id: string;
  name: string;
  showId: string;
  seasonNumber: number;
  episodeCount: number;
  episodes: Episode[];
  airDate: Date | null;
};

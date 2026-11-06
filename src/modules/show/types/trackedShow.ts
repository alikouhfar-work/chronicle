import type { ShowTracking } from '@/modules/show/types/showTracking';
import type { Season } from '@/modules/episode-season';
import type { Genre } from '@/modules/discovery/genre';

export type TrackedShow = {
  id: string;
  tmdbId: number;
  name: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: Date | null;
  lastAirDate: Date | null;
  lastSyncedAt: Date;
  status: string;
  tagline?: string | null;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  inProduction: boolean;
  rewatchCount: number;
  seasons: Season[];
  genres: Genre[];
  tracking: ShowTracking | null;
};

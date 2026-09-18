import { ShowTracking } from '@/features/show/types/showTracking';
import { Season } from '@/features/season';
import { Genre } from '@/features/genre';

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
  seasons: Season[];
  genres: Genre[];
  tracking: ShowTracking | null;
};

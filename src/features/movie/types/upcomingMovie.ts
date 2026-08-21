import { Season } from '@/features/season';
import { Episode } from '@/features/episode';
import { TrackedShow } from '@/features/show';

export type UpcomingEpisode = Episode & {
  season: Omit<Season, 'episodes'> & {
    show: Pick<TrackedShow, 'name' | 'tmdbId' | 'posterPath'>;
  };
};

export type MappedUpcomingEpisode = {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  mediaId: string;
  mediaName: string;
  mediaTmdbId: number;
  overview: string;
  airDate: Date | null;
  posterPath: string | null;
};

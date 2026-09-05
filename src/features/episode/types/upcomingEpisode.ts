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
  tmdbId: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  showId: string;
  showName: string;
  overview: string;
  airDate: Date | null;
  posterPath: string | null;
};

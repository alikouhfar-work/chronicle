import { Season } from '@/features/season';
import { Episode } from '@/features/episode';
import { TrackedShow } from '@/features/show';

export type UpcomingEpisode = Episode & {
  season: Omit<Season, 'episodes'> & {
    show: Pick<TrackedShow, 'name' | 'tmdbId' | 'posterPath'>;
  };
};

export type MappedUpcomingEpisodeItem = {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
};

export type MappedUpcomingEpisode = {
  id: string;
  showId: string;
  showName: string;
  showTmdbId: number;
  posterPath: string | null;
  airDate: Date | null;
  episodes: MappedUpcomingEpisodeItem[];
};
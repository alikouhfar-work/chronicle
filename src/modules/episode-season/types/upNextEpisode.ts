import { Season } from '@/modules/episode-season';
import { Episode } from '@/modules/episode-season';
import { TrackedShow } from '@/modules/show';

export type UpNextEpisode = Episode & {
  season: Omit<Season, 'episodes'> & {
    show: Pick<TrackedShow, 'name' | 'tmdbId' | 'posterPath'>;
  };
};

export type MappedUpNextEpisode = {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  showId: string;
  showName: string;
  showTmdbId: number;
  overview: string;
  airDate: Date | null;
  posterPath: string | null;
};

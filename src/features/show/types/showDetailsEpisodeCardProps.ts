import { Episode } from '@/features/episode';

export type ShowDetailsEpisodeCardProps = {
  showId: string;
  episode: Episode;
  isWatched: boolean;
};

import { Season } from '@/features/season';

export const getShowProgress = (seasons: Season[], numberOfEpisodes: number) => {
  const watchedEpisodes = seasons.reduce((total, season) => {
    if (season.seasonNumber === 0) return total;

    return (
      total +
      season.episodes.reduce((count, episode) => count + (episode.tracking?.watched ? 1 : 0), 0)
    );
  }, 0);

  return Math.floor(numberOfEpisodes > 0 ? (watchedEpisodes / numberOfEpisodes) * 100 : 0);
};

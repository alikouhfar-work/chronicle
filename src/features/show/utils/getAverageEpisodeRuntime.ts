import { TrackedShow } from '@/features/show';

export const getAverageEpisodeRuntime = (show: TrackedShow) => {
  return show
    ? (() => {
        const runtimes = show.seasons
          .filter((season) => season.seasonNumber !== 0)
          .flatMap((season) => season.episodes)
          .map((episode) => episode.runtime)
          .filter(Boolean);

        if (!runtimes.length) return null;

        return Math.round(runtimes.reduce((sum, runtime) => sum + runtime, 0) / runtimes.length);
      })()
    : null;
};

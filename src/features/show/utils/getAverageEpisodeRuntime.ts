import type { TrackedShow } from '@/features/show';

export const getAverageEpisodeRuntime = (show: TrackedShow) => {
  let totalRuntime = 0;
  let runtimeCount = 0;

  for (const season of show.seasons) {
    if (season.seasonNumber === 0) continue;

    for (const episode of season.episodes) {
      if (episode.runtime == null) continue;

      totalRuntime += episode.runtime;
      runtimeCount++;
    }
  }

  return runtimeCount ? Math.round(totalRuntime / runtimeCount) : null;
};

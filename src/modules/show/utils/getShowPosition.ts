import type { Season } from '@/modules/episode-season';

export type SeasonSegment = {
  seasonNumber: number;
  watchedFraction: number;
};

export type ShowPosition = {
  /** e.g. "S2 E4" — null when nothing remains to watch. */
  nextLabel: string | null;
  segments: SeasonSegment[];
};

/**
 * Derives the card position readout from episode tracking. Specials
 * (season 0) are excluded from segments and skipped for next-up, matching
 * getShowProgress — nobody wants "S0 E1" as their next episode.
 */
export const getShowPosition = (seasons: Season[]): ShowPosition => {
  const ordered = [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
  const countable = ordered.filter((season) => season.seasonNumber !== 0);

  const segments = countable.map((season) => {
    const total = season.episodes.length;
    const watched = season.episodes.filter((episode) => episode.tracking?.watched).length;
    return {
      seasonNumber: season.seasonNumber,
      watchedFraction: total > 0 ? watched / total : 0,
    };
  });

  const pool = countable.length > 0 ? countable : ordered;
  for (const season of pool) {
    const next = [...season.episodes]
      .sort((a, b) => a.episodeNumber - b.episodeNumber)
      .find((episode) => !episode.tracking?.watched);
    if (next) {
      return {
        nextLabel: `S${season.seasonNumber} E${next.episodeNumber}`,
        segments,
      };
    }
  }

  return { nextLabel: null, segments };
};

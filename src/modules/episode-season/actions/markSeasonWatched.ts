'use server';

import { prisma } from '@/infra/db/prisma';
import { requireUserId } from '@/infra/tmdb/forUser';
import { DatabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseDbId } from '@/shared/lib/validate';
import { buildTrackingTimestamps, deriveShowStatus } from '@/modules/media/tracking';
import { revalidateMediaDetail } from '@/shared/lib/revalidate';

/**
 * Marks every aired episode of a season as watched and re-derives the show's
 * status. Removing a watch goes through `unwatchMedia`, which keeps tracking
 * rows so ratings survive. Unaired episodes are skipped, mirroring how season
 * progress is counted.
 */
export const markSeasonWatched = async (showId: string, seasonId: string) => {
  try {
    const sId = parseDbId(showId, 'showId');
    const snId = parseDbId(seasonId, 'seasonId');
    const userId = await requireUserId();

    const season = await prisma.season.findUnique({
      where: { id: snId },
      select: {
        showId: true,
        show: { select: { userId: true } },
        episodes: { select: { id: true, airDate: true } },
      },
    });

    if (!season || season.show.userId !== userId) {
      throw new NotFoundError(`Season not found: ${snId}`);
    }

    if (season.showId !== sId) {
      throw new ValidationError('Season does not belong to the given show');
    }

    const airedEpisodes = season.episodes.filter(
      (episode) => episode.airDate && episode.airDate <= new Date(),
    );
    const episodeIds = airedEpisodes.map((episode) => episode.id);

    if (episodeIds.length === 0) return;

    const tmdbId = await prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.episodeTracking.createMany({
        data: episodeIds.map((episodeId) => ({ episodeId, watched: true, watchedAt: now })),
        skipDuplicates: true,
      });

      const show = await tx.show.findUnique({
        where: { id: sId },
        select: {
          tmdbId: true,
          userId: true,
          seasons: {
            where: { seasonNumber: { not: 0 } },
            select: { episodes: { select: { tracking: { select: { watched: true } } } } },
          },
        },
      });

      if (!show || show.userId !== userId) {
        throw new NotFoundError(`Show not found: ${sId}`);
      }

      const episodes = show.seasons.flatMap((s) => s.episodes);
      const watchedEpisodes = episodes.filter((e) => e.tracking?.watched).length;
      const status = deriveShowStatus(episodes.length, watchedEpisodes);

      const tracking = await tx.showTracking.findUnique({
        where: { showId: sId },
        select: { startedAt: true },
      });

      const timestamps = buildTrackingTimestamps(status, tracking?.startedAt, now);

      await tx.showTracking.upsert({
        where: { showId: sId },
        create: { showId: sId, status, ...timestamps },
        update: { status, ...timestamps },
      });

      return show.tmdbId;
    });

    revalidateMediaDetail('tv', tmdbId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
    throw new DatabaseError('Failed to mark season as watched', { cause: error });
  }
};

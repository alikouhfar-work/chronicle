import 'server-only';

import type { Prisma } from '../../../../generated/prisma/client';
import { prisma } from '@/infra/db/prisma';
import {
  planCounterReconcile,
  type CounterDrift,
  type CounterSnapshot,
} from '@/modules/rewatch/lib/planCounterReconcile';

export type ReconcileReport = {
  fix: boolean;
  checked: number;
  drift: CounterDrift[];
  fixed: number;
};

const countLogsByMedia = async (
  mediaType: 'EPISODE' | 'SHOW' | 'MOVIE',
): Promise<Map<string, number>> => {
  const groups = await prisma.rewatchLog.groupBy({
    by: ['mediaId'],
    where: { mediaType },
    _count: { _all: true },
  });

  return new Map(groups.map((group) => [group.mediaId, group._count._all]));
};

/**
 * Reads every title that can carry a derived counter and compares it with the
 * rules. Small catalog, so this is four full reads rather than a paged job; if
 * it ever grows, page by owner and keep the same comparison.
 */
const readSnapshot = async (): Promise<CounterSnapshot> => {
  const [episodeLogs, showLogs, movieLogs, episodes, seasons, shows, movies] = await Promise.all([
    countLogsByMedia('EPISODE'),
    countLogsByMedia('SHOW'),
    countLogsByMedia('MOVIE'),
    prisma.episode.findMany({
      select: {
        id: true,
        name: true,
        rewatchCount: true,
        episodeNumber: true,
        season: { select: { seasonNumber: true, show: { select: { name: true } } } },
      },
    }),
    prisma.season.findMany({
      select: {
        id: true,
        seasonNumber: true,
        rewatchCount: true,
        show: { select: { name: true } },
        episodes: {
          select: { rewatchCount: true, tracking: { select: { watched: true } } },
        },
      },
    }),
    prisma.show.findMany({ select: { id: true, name: true, rewatchCount: true } }),
    prisma.movie.findMany({ select: { id: true, name: true, rewatchCount: true } }),
  ]);

  return {
    episodes: episodes.map((episode) => ({
      id: episode.id,
      label: `${episode.season.show.name} · S${episode.season.seasonNumber}E${episode.episodeNumber} ${episode.name}`,
      stored: episode.rewatchCount,
      logs: episodeLogs.get(episode.id) ?? 0,
    })),
    seasons: seasons.map((season) => ({
      id: season.id,
      label: `${season.show.name} · Season ${season.seasonNumber}`,
      stored: season.rewatchCount,
      episodes: season.episodes.map((episode) => ({
        watched: episode.tracking?.watched ?? false,
        rewatchCount: episode.rewatchCount,
      })),
    })),
    shows: shows.map((show) => ({
      id: show.id,
      label: show.name,
      stored: show.rewatchCount,
      logs: showLogs.get(show.id) ?? 0,
    })),
    movies: movies.map((movie) => ({
      id: movie.id,
      label: movie.name,
      stored: movie.rewatchCount,
      logs: movieLogs.get(movie.id) ?? 0,
    })),
  };
};

const writeValue = async (
  tx: Prisma.TransactionClient,
  kind: CounterDrift['kind'],
  ids: string[],
  value: number,
): Promise<void> => {
  if (kind === 'episode') {
    await tx.episode.updateMany({ where: { id: { in: ids } }, data: { rewatchCount: value } });
    return;
  }
  if (kind === 'season') {
    await tx.season.updateMany({ where: { id: { in: ids } }, data: { rewatchCount: value } });
    return;
  }
  if (kind === 'show') {
    await tx.show.updateMany({ where: { id: { in: ids } }, data: { rewatchCount: value } });
    return;
  }
  await tx.movie.updateMany({ where: { id: { in: ids } }, data: { rewatchCount: value } });
};

/**
 * Report mode (`fix: false`) is safe to run on a schedule: it only reads. Fix
 * mode writes the expected values, grouped by target value so a catalog with
 * the same drift everywhere costs one statement per distinct value.
 */
export const reconcileCounters = async ({ fix }: { fix: boolean }): Promise<ReconcileReport> => {
  const { drift, checked } = planCounterReconcile(await readSnapshot());

  if (!fix || drift.length === 0) {
    return { fix, checked, drift, fixed: 0 };
  }

  await prisma.$transaction(async (tx) => {
    const groups = new Map<string, string[]>();

    for (const entry of drift) {
      const key = `${entry.kind}:${entry.expected}`;
      const ids = groups.get(key) ?? [];
      ids.push(entry.id);
      groups.set(key, ids);
    }

    for (const [key, ids] of groups) {
      const separator = key.indexOf(':');
      const kind = key.slice(0, separator) as CounterDrift['kind'];
      const value = Number(key.slice(separator + 1));
      await writeValue(tx, kind, ids, value);
    }
  });

  return { fix, checked, drift, fixed: drift.length };
};

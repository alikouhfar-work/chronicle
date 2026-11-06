import { env } from '@/infra/env';
import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma';
import { tmdbFetch } from '@/infra/tmdb/client';
import { mapTrendingMovies } from '@/modules/movie/mappers/mapTrendingMovies';
import type { TrendingMovieRaw } from '@/modules/movie/types/trending';
import { mapTrendingShows } from '@/modules/show/mappers/mapTrendingShows';
import type { TrendingShowRaw } from '@/modules/show/types/trendingShow';
import { MovieTrackingStatus, ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { addMovie } from '@/modules/movie/actions/addMovie';
import { addShow } from '@/modules/show/actions/addShow';
import { revalidatePath } from 'next/cache';
import { acquireAdvisoryLock } from '@/infra/db/advisoryLock';
import { getErrorMessage } from '@/shared/lib/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Stable int32 shared by every reset attempt; nothing else in the app uses it. */
const RESET_DEMO_LOCK_KEY = 727_214;

const MAX_MOVIES = 5;
const MAX_SHOWS = 5;
const DEMO_EMAIL = env.demoUserEmail;

const MOVIE_STATUSES = [
  MovieTrackingStatus.PLAN_TO_WATCH,
  MovieTrackingStatus.WATCHING,
  MovieTrackingStatus.COMPLETED,
] as const;

const SHOW_STATUSES = [
  ShowTrackingStatus.PLAN_TO_WATCH,
  ShowTrackingStatus.WATCHING,
  ShowTrackingStatus.COMPLETED,
  ShowTrackingStatus.DROPPED,
] as const;

const randomFrom = <T,>(arr: readonly T[]): T => {
  const value = arr[Math.floor(Math.random() * arr.length)];
  if (value === undefined) throw new Error('[reset-demo] randomFrom called with an empty list');
  return value;
};

const shuffle = <T,>(arr: readonly T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const left = copy[i];
    const right = copy[j];
    if (left !== undefined && right !== undefined) {
      copy[i] = right;
      copy[j] = left;
    }
  }
  return copy;
};

export const GET = async (request: Request) => {
  // 1. Authenticate
  const expected = `Bearer ${env.cronSecret}`;
  const received = request.headers.get('authorization');

  if (!env.cronSecret || received !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!env.hasTmdbToken) {
    return NextResponse.json({ ok: false, error: 'TMDB_ACCESS_TOKEN is not set' }, { status: 500 });
  }

  // Two resets must never interleave: the second wipe would run against a
  // half-seeded library, and the counters would describe neither run. The lock
  // is engine-wide, so a second Vercel instance sees it too.
  const lock = await acquireAdvisoryLock(RESET_DEMO_LOCK_KEY).catch(() => null);

  if (!lock) {
    return NextResponse.json(
      { ok: false, error: 'A demo reset is already running.' },
      { status: 409 },
    );
  }

  try {
    // 2. Fetch trending FIRST with the single server token (no session in cron),
    // so a TMDB failure doesn't wipe the demo user's library.
    const [movieRes, showRes] = await Promise.all([
      tmdbFetch<{ results: TrendingMovieRaw[] }>('trending/movie/week'),
      tmdbFetch<{ results: TrendingShowRaw[] }>('trending/tv/week'),
    ]);

    const movies = shuffle(mapTrendingMovies(movieRes.results, new Map())).slice(0, MAX_MOVIES);
    const shows = shuffle(mapTrendingShows(showRes.results, new Map())).slice(0, MAX_SHOWS);

    // 3. Ensure demo/guest user.
    const demoUser = await prisma.user.upsert({
      where: { email: DEMO_EMAIL },
      update: {},
      create: {
        email: DEMO_EMAIL,
        name: 'Guest',
      },
      select: { id: true },
    });

    // 4. Wipe ONLY the demo user's library (cascades seasons/episodes/tracking).
    await prisma.show.deleteMany({ where: { userId: demoUser.id } });
    await prisma.movie.deleteMany({ where: { userId: demoUser.id } });

    // 5. Seed movies (best-effort per title, failures collected into the response)
    const movieFailures: string[] = [];
    for (const movie of movies) {
      const status = randomFrom(MOVIE_STATUSES);
      try {
        await addMovie(movie.id, status, { userId: demoUser.id });
      } catch (error) {
        movieFailures.push(`${movie.name}: ${getErrorMessage(error)}`);
      }
    }

    // 6. Seed shows
    const showFailures: string[] = [];
    for (const show of shows) {
      const status = randomFrom(SHOW_STATUSES);
      try {
        await addShow(show.id, status, { userId: demoUser.id });
      } catch (error) {
        showFailures.push(`${show.name}: ${getErrorMessage(error)}`);
      }
    }

    revalidatePath('/');
    return NextResponse.json({
      ok: movieFailures.length === 0 && showFailures.length === 0,
      message: 'Demo database reset and seeded successfully.',
      movies: movies.length - movieFailures.length,
      shows: shows.length - showFailures.length,
      movieFailures,
      showFailures,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Reset failed', message: getErrorMessage(error) },
      { status: 500 },
    );
  } finally {
    // Released even when a seed failed, so the next scheduled run is not locked
    // out until the connection times out.
    await lock.release().catch(() => undefined);
  }
};

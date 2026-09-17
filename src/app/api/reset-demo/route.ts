import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTrendingMovies } from '@/features/movie/queries/getTrendingMovies';
import { getTrendingShows } from '@/features/show/queries/getTrendingShows';
import { MovieTrackingStatus, ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { addMovie } from '@/features/movie/actions/addMovie';
import { addShow } from '@/features/show/actions/addShow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_MOVIES = 5;
const MAX_SHOWS = 5;

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

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function GET(request: Request) {
  // 1. Authenticate
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const received = request.headers.get('authorization');

  if (!process.env.CRON_SECRET || received !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Fetch trending FIRST, so a TMDB failure doesn't wipe the demo DB
    const [trendingMovies, trendingShows] = await Promise.all([
      getTrendingMovies(),
      getTrendingShows(),
    ]);

    const movies = shuffle(trendingMovies).slice(0, MAX_MOVIES);
    const shows = shuffle(trendingShows).slice(0, MAX_SHOWS);

    console.log(`[reset-demo] fetched ${movies.length} movie(s), ${shows.length} show(s)`);

    // 3. Wipe the demo DB (FK-safe order)
    await prisma.episodeTracking.deleteMany();
    await prisma.showTracking.deleteMany();
    await prisma.movieTracking.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.season.deleteMany();
    await prisma.show.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.genre.deleteMany();

    console.log('[reset-demo] cleared existing data');

    // 4. Seed movies
    for (const movie of movies) {
      const status = randomFrom(MOVIE_STATUSES);
      try {
        await addMovie(movie.id, status);
        console.log(`[reset-demo] seeded movie "${movie.name}" → ${status}`);
      } catch (error) {
        console.error(
          `[reset-demo] movie "${movie.name}" failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    // 5. Seed shows
    for (const show of shows) {
      const status = randomFrom(SHOW_STATUSES);
      try {
        await addShow(show.id, status);
        console.log(`[reset-demo] seeded show "${show.name}" → ${status}`);
      } catch (error) {
        console.error(
          `[reset-demo] show "${show.name}" failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Demo database reset and seeded successfully.',
      movies: movies.length,
      shows: shows.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[reset-demo] failed:', error);
    return NextResponse.json({ ok: false, error: 'Reset failed', message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/infra/db/prisma';
import { getTrendingMovies } from '@/modules/movie/queries/getTrendingMovies';
import { getTrendingShows } from '@/modules/show/queries/getTrendingShows';
import { MovieTrackingStatus, ShowTrackingStatus } from '../../../../generated/prisma/enums';
import { addMovie } from '@/modules/movie/actions/addMovie';
import { addShow } from '@/modules/show/actions/addShow';
import { revalidatePath } from 'next/cache';
import { getErrorMessage } from '@/shared/lib/errors';

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

const randomFrom = <T,>(arr: readonly T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const shuffle = <T,>(arr: readonly T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const GET = async (request: Request) => {
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

    // 3. Wipe the demo DB (FK-safe order)
    await prisma.episodeTracking.deleteMany();
    await prisma.showTracking.deleteMany();
    await prisma.movieTracking.deleteMany();
    await prisma.episode.deleteMany();
    await prisma.season.deleteMany();
    await prisma.show.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.genre.deleteMany();

    // 4. Seed movies (best-effort per title, failures collected into the response)
    const movieFailures: string[] = [];
    for (const movie of movies) {
      const status = randomFrom(MOVIE_STATUSES);
      try {
        await addMovie(movie.id, status);
      } catch (error) {
        movieFailures.push(`${movie.name}: ${getErrorMessage(error)}`);
      }
    }

    // 5. Seed shows
    const showFailures: string[] = [];
    for (const show of shows) {
      const status = randomFrom(SHOW_STATUSES);
      try {
        await addShow(show.id, status);
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
  }
};

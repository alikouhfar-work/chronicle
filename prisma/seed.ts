import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { getTrendingMovies } from '@/features/movie/queries/getTrendingMovies';
import { getTrendingShows } from '@/features/show/queries/getTrendingShows';
import { MovieTrackingStatus, ShowTrackingStatus } from '../generated/prisma/enums';
import { addMovie } from '@/features/movie/actions/addMovie';
import { addShow } from '@/features/show/actions/addShow';

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

async function clearDatabase() {
  await prisma.episodeTracking.deleteMany();
  await prisma.showTracking.deleteMany();
  await prisma.movieTracking.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.season.deleteMany();
  await prisma.show.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
}

async function main() {
  const target = process.env.PRISMA_TARGET === 'demo' ? 'demo' : 'personal';

  console.log(`[seed] target: ${target}`);

  // --- 1. Wipe existing data ---------------------------------------------
  await clearDatabase();
  console.log('[seed] cleared existing data');

  // --- 2. Fetch trending from TMDB (reuses your app's fetchers) ----------
  const [trendingMovies, trendingShows] = await Promise.all([
    getTrendingMovies(),
    getTrendingShows(),
  ]);

  const movies = shuffle(trendingMovies).slice(0, MAX_MOVIES);
  const shows = shuffle(trendingShows).slice(0, MAX_SHOWS);

  console.log(`[seed] fetched ${movies.length} movie(s), ${shows.length} show(s)`);

  // --- 3. Seed movies ----------------------------------------------------
  for (const movie of movies) {
    const status = randomFrom(MOVIE_STATUSES);

    try {
      await addMovie(movie.id, status);
      console.log(`[seed] ✓ movie "${movie.name}" → ${status}`);
    } catch (error) {
      console.error(
        `[seed] ✗ movie "${movie.name}" (${movie.id}) failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // --- 4. Seed shows -----------------------------------------------------
  for (const show of shows) {
    const status = randomFrom(SHOW_STATUSES);

    try {
      await addShow(show.id, status);
      console.log(`[seed] ✓ show "${show.name}" → ${status}`);
    } catch (error) {
      console.error(
        `[seed] ✗ show "${show.name}" (${show.id}) failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log('[seed] done');
}

main()
  .catch((e) => {
    console.error('[seed] failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import 'dotenv/config';
import { prisma } from '@/infra/db/prisma';
import { tmdbFetch } from '@/infra/tmdb/client';
import { fetchTrendingRaw } from '@/modules/media/queries';
import { mapTrendingMovies } from '@/modules/movie/mappers/mapTrendingMovies';
import type { TrendingMovieRaw } from '@/modules/movie/types/trending';
import { mapTrendingShows } from '@/modules/show/mappers/mapTrendingShows';
import type { TrendingShowRaw } from '@/modules/show/types/trendingShow';
import { MovieTrackingStatus, ShowTrackingStatus } from '../generated/prisma/enums';
import { addMovie } from '@/modules/movie/actions/addMovie';
import { addShow } from '@/modules/show/actions/addShow';
import { encryptTmdbToken } from '@/infra/tmdb/tokenVault';

const MAX_MOVIES = 5;
const MAX_SHOWS = 5;
const SEED_EMAIL = process.env.SEED_USER_EMAIL ?? 'dev@chronicle.local';

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

async function ensureSeedUser(target: 'demo' | 'personal'): Promise<string> {
  // Seed runs without a session, so it provisions a user and stores a TMDB
  // token on it (encrypted). App code then uses the per-user token.
  // Demo target uses the shared demo token; personal uses the server token.
  const isDemo = target === 'demo';
  const email = isDemo
    ? (process.env.DEMO_USER_EMAIL ?? 'demo@chronicle.local')
    : SEED_EMAIL;
  const serverToken = isDemo
    ? (process.env.DEMO_TMDB_TOKEN ?? process.env.TMDB_ACCESS_TOKEN)
    : process.env.TMDB_ACCESS_TOKEN;
  if (!serverToken) throw new Error('[seed] no TMDB token set (DEMO_TMDB_TOKEN/TMDB_ACCESS_TOKEN)');

  const { iv, ciphertext } = encryptTmdbToken(serverToken);
  const user = await prisma.user.upsert({
    where: { email },
    update: { tmdbTokenIv: iv, tmdbTokenCiphertext: ciphertext, tmdbTokenUpdatedAt: new Date() },
    create: {
      email,
      name: isDemo ? 'Guest' : 'Dev',
      tmdbTokenIv: iv,
      tmdbTokenCiphertext: ciphertext,
      tmdbTokenUpdatedAt: new Date(),
    },
    select: { id: true },
  });
  return user.id;
}

async function main() {
  const target = process.env.PRISMA_TARGET === 'demo' ? 'demo' : 'personal';

  console.log(`[seed] target: ${target}`);

  // --- 1. Wipe existing data ---------------------------------------------
  await clearDatabase();
  console.log('[seed] cleared existing data');

  // --- 2. Provision seed user (server token stored encrypted) ------------
  const userId = await ensureSeedUser(target);
  console.log(`[seed] seed user ready (${target === 'demo' ? 'demo/guest' : SEED_EMAIL})`);

  // --- 3. Fetch trending from TMDB with the server token -----------------
  // (App queries use per-user tokens; seed has no session so it uses env.)
  const [movieRes, showRes] = await Promise.all([
    fetchTrendingRaw<TrendingMovieRaw>('movie').catch(() => null),
    fetchTrendingRaw<TrendingShowRaw>('tv').catch(() => null),
  ]);

  // fetchTrendingRaw now resolves the session token; fall back to env fetch.
  const fetchEnvTrending = async <T>(kind: 'movie' | 'tv') => {
    const res = await tmdbFetch<{ results: T[] }>(`trending/${kind}/week`);
    return res.results;
  };

  let movieRaws: TrendingMovieRaw[] = movieRes?.results ?? [];
  let showRaws: TrendingShowRaw[] = showRes?.results ?? [];
  if (movieRaws.length === 0) {
    try {
      movieRaws = await fetchEnvTrending<TrendingMovieRaw>('movie');
    } catch {
      movieRaws = [];
    }
  }
  if (showRaws.length === 0) {
    try {
      showRaws = await fetchEnvTrending<TrendingShowRaw>('tv');
    } catch {
      showRaws = [];
    }
  }

  const movies = shuffle(
    mapTrendingMovies(movieRaws, new Map()),
  ).slice(0, MAX_MOVIES);
  const shows = shuffle(mapTrendingShows(showRaws, new Map())).slice(0, MAX_SHOWS);

  console.log(`[seed] fetched ${movies.length} movie(s), ${shows.length} show(s)`);

  // --- 4. Seed movies ----------------------------------------------------
  for (const movie of movies) {
    const status = randomFrom(MOVIE_STATUSES);

    try {
      await addMovie(movie.id, status, { userId });
      console.log(`[seed] ✓ movie "${movie.name}" → ${status}`);
    } catch (error) {
      console.error(
        `[seed] ✗ movie "${movie.name}" (${movie.id}) failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // --- 5. Seed shows -----------------------------------------------------
  for (const show of shows) {
    const status = randomFrom(SHOW_STATUSES);

    try {
      await addShow(show.id, status, { userId });
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

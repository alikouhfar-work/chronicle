import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

/**
 * Journeys need stable rows. Raw `pg` rather than the app's Prisma client:
 * Playwright loads specs as CJS, and the generated client is ESM-only.
 */
const connectionString = (): string => process.env.E2E_DATABASE_URL ?? '';

const withClient = async <T>(run: (client: Client) => Promise<T>): Promise<T> => {
  const client = new Client({ connectionString: connectionString() });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
};

export const userIdFor = async (email: string): Promise<string> =>
  withClient(async (client) => {
    const { rows } = await client.query<{ id: string }>('select id from "User" where email = $1', [
      email,
    ]);
    if (!rows[0]) throw new Error(`No user for ${email}`);
    return rows[0].id;
  });

// Random, not sequential: the e2e database is not reset between runs, and
// (userId, tmdbId) is unique.
const nextTmdbId = (): number => 900_000 + Math.floor(Math.random() * 99_999);

/** A movie owned by the user, inserted directly so results cannot drift. */
export const createOwnedMovie = async (userId: string): Promise<{ id: string; tmdbId: number }> => {
  const id = randomUUID();
  const tmdbId = nextTmdbId();

  await withClient(async (client) => {
    await client.query(
      `insert into "Movie" (id, "userId", "tmdbId", name, overview, status, runtime, "updatedAt")
       values ($1, $2, $3, $4, '', 'PLAN_TO_WATCH', 100, now())`,
      [id, userId, tmdbId, `E2E Movie ${tmdbId}`],
    );
  });

  return { id, tmdbId };
};

/**
 * Take a title out of the library by TMDB id.
 *
 * The e2e database survives between runs, so a title added by an earlier run
 * would render "View in Library" instead of the Add control a journey starts
 * from. Logs and tracking cascade with the movie row.
 */
export const forgetMovie = async (userId: string, tmdbId: number): Promise<void> =>
  withClient(async (client) => {
    await client.query('delete from "Movie" where "userId" = $1 and "tmdbId" = $2', [
      userId,
      tmdbId,
    ]);
  });

export const movieInLibrary = async (userId: string, tmdbId: number): Promise<boolean> =>
  withClient(async (client) => {
    const { rows } = await client.query<{ count: string }>(
      'select count(*)::text as count from "Movie" where "userId" = $1 and "tmdbId" = $2',
      [userId, tmdbId],
    );
    return Number(rows[0]?.count ?? 0) > 0;
  });

export const countLogsFor = async (mediaId: string): Promise<number> =>
  withClient(async (client) => {
    const { rows } = await client.query<{ count: string }>(
      'select count(*)::text as count from rewatch_logs where media_id = $1',
      [mediaId],
    );
    return Number(rows[0]?.count ?? 0);
  });

import { Client } from 'pg';
import { expect, test } from '@playwright/test';
import { account } from './global-setup';
import { signIn } from './helpers/auth';
import { userIdFor } from './helpers/db';

const TMDB_MOVIE = 550;

/**
 * Own the film in the e2e library; the page itself still reads TMDB live.
 *
 * The tracking row is not optional: a rating is written to `MovieTracking`, so a
 * title row without one accepts the click and silently keeps nothing. That was
 * the difference between the failing journey and the browser probe.
 */
const ensureOwnedMovie = async (userId: string): Promise<void> => {
  const client = new Client({ connectionString: process.env.E2E_DATABASE_URL ?? '' });
  await client.connect();
  try {
    const id = (
      await client.query<{ id: string }>(
        `insert into "Movie" (id, "userId", "tmdbId", name, overview, status, runtime, "updatedAt")
         values (gen_random_uuid()::text, $1, $2, 'Fight Club', '', 'PLAN_TO_WATCH', 139, now())
         on conflict ("userId", "tmdbId") do update set "updatedAt" = now()
         returning id`,
        [userId, TMDB_MOVIE],
      )
    ).rows[0]?.id;

    if (!id) throw new Error('Could not seed the movie row');

    // Reset, not just insert: the e2e database survives between runs, and a
    // rating left over from the previous run hides the "Rate 4 of 5" button the
    // journey starts from.
    await client.query(
      `insert into "MovieTracking" (id, "movieId", status, "updatedAt")
       values (gen_random_uuid()::text, $1, 'PLAN_TO_WATCH', now())
       on conflict ("movieId") do update set rating = null, status = 'PLAN_TO_WATCH', "updatedAt" = now()`,
      [id],
    );
  } finally {
    await client.end();
  }
};

const openReviews = async (page: import('@playwright/test').Page): Promise<void> => {
  await page.goto(`/library/movie/${TMDB_MOVIE}`);
  // Unconditional click: Playwright waits for actionability, which also waits
  // out hydration. An `isVisible()` probe fired too early and the click was
  // swallowed, leaving the Personal Notes tab selected.
  await page.getByRole('tab', { name: 'Public Reviews' }).click();
  await page.getByLabel('Write a review').waitFor();
};

test.describe('engagement', () => {
  test('rates a title and keeps the rating across a reload', async ({ page }) => {
    await signIn(page);
    await ensureOwnedMovie(await userIdFor(account.email));
    await page.goto(`/library/movie/${TMDB_MOVIE}`);

    await page.getByRole('button', { name: 'Rate 4 of 5' }).click();
    await expect(page.getByRole('button', { name: 'Clear rating (4 of 5)' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Clear rating (4 of 5)' })).toBeVisible();
  });

  test('posts a review that mentions a neighbour and notifies them', async ({ page, browser }) => {
    await signIn(page);
    await ensureOwnedMovie(await userIdFor(account.email));
    await openReviews(page);

    await page.getByLabel('Write a review').fill(`Watched it again @${account.neighbourUsername}`);
    await page.getByRole('button', { name: /post|publish|share/i }).first().click();

    await expect(page.getByText(/Watched it again/i).first()).toBeVisible();
    // Mentions render as chips, not as plain text in the body.
    await expect(page.getByText(`@${account.neighbourUsername}`).first()).toBeVisible();

    // The neighbour sees it in the bell without reloading the page twice.
    const neighbour = await browser.newContext();
    const neighbourPage = await neighbour.newPage();
    await neighbourPage.goto('/login');
    await neighbourPage.fill('#login-email', 'neighbour@chronicle.test');
    await neighbourPage.fill('#login-password', account.password);
    await neighbourPage.getByRole('button', { name: /^sign in$/i }).click();

    await expect(neighbourPage.getByRole('button', { name: /notifications, \d+ unread/i })).toBeVisible();
    await neighbour.close();
  });
});

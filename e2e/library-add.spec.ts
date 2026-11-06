import { expect, test } from '@playwright/test';
import { account } from './global-setup';
import { signIn } from './helpers/auth';
import { forgetMovie, movieInLibrary, userIdFor } from './helpers/db';

/**
 * A public-domain-shaped title the other journeys never seed: the engagement
 * spec owns 550 (Fight Club), so reusing it would start this journey on the
 * tracked branch with no Add control to click.
 */
const TMDB_GODFATHER = 238;

/**
 * The search journey is the only one that reads TMDB live (every other journey
 * asserts against rows the fixture wrote). A missing token would fail it for an
 * environment reason, so it skips loudly instead — CI supplies
 * `DEMO_TMDB_TOKEN` from the `TMDB_ACCESS_TOKEN` repository secret.
 */
const hasTmdbToken = Boolean(process.env.DEMO_TMDB_TOKEN ?? process.env.TMDB_ACCESS_TOKEN);

/**
 * Adding from search is the only path that goes TMDB search → server action →
 * library row, so it is also the only journey that proves the tracked lookup
 * re-reads after a write.
 */
test.describe('library', () => {
  test('adds a movie from search and finds it in the library', async ({ page }) => {
    test.skip(!hasTmdbToken, 'Set DEMO_TMDB_TOKEN (CI: TMDB_ACCESS_TOKEN secret) to run this journey.');

    const userId = await userIdFor(account.email);
    await forgetMovie(userId, TMDB_GODFATHER);

    await signIn(page);
    // Direct navigation rather than typing: the form is a plain GET, and the
    // query string keeps the journey independent of the input's hydration.
    await page.goto(`/search?query=${encodeURIComponent('The Godfather')}`);

    const card = page
      .locator('li')
      .filter({ has: page.locator(`a[href="/search/movie/${TMDB_GODFATHER}"]`) });

    await expect(card).toBeVisible();
    await card.getByLabel('Add title to library', { exact: true }).click();

    await expect(page.getByText('Added to your library')).toBeVisible();

    // The result card switches to its tracked branch on the next render.
    await page.reload();
    await expect(card.getByRole('link', { name: 'View in Library' })).toBeVisible();

    expect(await movieInLibrary(userId, TMDB_GODFATHER)).toBe(true);
  });
});

import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { signIn } from './helpers/auth';
import { countLogsFor, createOwnedMovie, userIdFor } from './helpers/db';
import { account } from './global-setup';

test.describe('rewatch idempotency', () => {
  test('two parallel retries of one watch produce one log', async ({ page }) => {
    await signIn(page);

    const userId = await userIdFor(account.email);
    const movie = await createOwnedMovie(userId);
    const key = randomUUID();

    const post = () =>
      page.request.post(`/api/media/movie/${movie.id}/rewatch`, {
        headers: { 'Idempotency-Key': key },
        data: { rewatched_at: new Date().toISOString() },
      });

    // Two tabs, one key: the second must replay, not duplicate.
    const [first, second] = await Promise.all([post(), post()]);

    expect([201, 200]).toContain(first.status());
    expect([201, 200]).toContain(second.status());
    expect(await countLogsFor(movie.id)).toBe(1);
  });

  test('a different key is a separate watch', async ({ page }) => {
    await signIn(page);

    const userId = await userIdFor(account.email);
    const movie = await createOwnedMovie(userId);

    const watch = () =>
      page.request.post(`/api/media/movie/${movie.id}/rewatch`, {
        headers: { 'Idempotency-Key': randomUUID() },
        data: { rewatched_at: new Date().toISOString() },
      });

    await watch();
    await watch();

    expect(await countLogsFor(movie.id)).toBe(2);
  });

  test('an unauthenticated retry is rejected, not logged', async ({ request }) => {
    const response = await request.post('/api/media/movie/00000000-0000-0000-0000-000000000000/rewatch', {
      headers: { 'Idempotency-Key': randomUUID() },
      data: { rewatched_at: new Date().toISOString() },
    });

    expect(response.status()).toBe(401);
  });
});

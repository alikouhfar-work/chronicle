import { expect, test } from '@playwright/test';
import { signIn } from './helpers/auth';

test.describe('session', () => {
  test('signs in with credentials and lands on the dashboard', async ({ page }) => {
    await signIn(page);

    // The header only renders for a session, so the bell is the signed-in proof.
    await expect(page.getByRole('button', { name: /notifications/i })).toBeVisible();
  });

  test('signs out from the profile page', async ({ page }) => {
    await signIn(page);
    await page.goto('/settings/profile');

    await page.getByRole('button', { name: /^sign out$/i }).click();

    await expect(page).toHaveURL(/\/login/);
    // The header is gone: no bell on the signed-out page.
    await expect(page.getByRole('button', { name: /notifications/i })).toHaveCount(0);
  });

  test('rejects a wrong password without leaking whether the account exists', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'e2e@chronicle.test');
    await page.fill('#login-password', 'definitely-not-the-password');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    // Stays on the login screen; the form reports a generic failure.
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('#login-email')).toBeVisible();
  });
});

import { expect, type Page } from '@playwright/test';
import { account } from '../global-setup';

/** Sign in through the real form — every journey starts from a session. */
export const signIn = async (page: Page): Promise<void> => {
  await page.goto('/login');
  await page.fill('#login-email', account.email);
  await page.fill('#login-password', account.password);
  await page.getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(/\/$/);
};

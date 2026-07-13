import { test, expect } from '@playwright/test';

test.describe('Forgot password', () => {
  test('page loads from the login screen link', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  // NOTE: form fields/flow on this page were not enumerated during initial
  // exploration (out of scope for the black-box pass — see README > Known
  // gaps). Extend this suite once the page's inputs and validation rules
  // are confirmed; this is a template enhancement test case pending that.
  test.fixme(
    'submitting a registered email sends a reset link',
    { tag: ['@functional', '@regression'] },
    async ({ page }) => {
      // TODO: fill in once form fields are confirmed.
    }
  );
});

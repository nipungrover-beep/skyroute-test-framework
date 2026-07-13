import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Login', () => {
  test('invalid credentials show an inline error and do not navigate', {
    tag: ['@smoke', '@regression'],
  }, async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('test@example.com', 'wrongpassword');

    await expect(login.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('empty submission is blocked by required-field validation', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginButton.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('"Forgot password?" and "Sign up" links navigate correctly', {
    tag: ['@functional', '@regression'],
  }, async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);

    await login.goto();
    await login.signUpLink.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test(
    'valid credentials log the user in',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      test.skip(
        !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
        'Set TEST_USER_EMAIL / TEST_USER_PASSWORD in .env to enable this test — see README > Test accounts.'
      );
      const login = new LoginPage(page);
      await login.goto();
      await login.login(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole('link', { name: 'Log in' })).not.toBeVisible();
    }
  );
});

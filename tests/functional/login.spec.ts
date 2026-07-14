import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { SignupPage } from '../../src/pages/SignupPage';
import { uniqueSignupIdentity } from '../../src/utils/testData';

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
      // Self-provisions an identity via signup rather than relying on a
      // pre-seeded TEST_USER_EMAIL/PASSWORD, since no seeded account was
      // available during exploration (see README > Known gaps).
      const identity = uniqueSignupIdentity();
      const signup = new SignupPage(page);
      await signup.goto();
      await signup.signUp(identity);
      await expect(page.getByTestId('signup-success')).toBeVisible();

      const login = new LoginPage(page);
      await login.goto();
      await login.login(identity.email, identity.password);

      await expect(page.getByTestId('login-success')).toContainText(identity.email);
    }
  );
});

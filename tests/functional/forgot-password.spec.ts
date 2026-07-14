import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../src/pages/ResetPasswordPage';
import { SignupPage } from '../../src/pages/SignupPage';
import { LoginPage } from '../../src/pages/LoginPage';
import { uniqueSignupIdentity } from '../../src/utils/testData';

test.describe('Forgot password', () => {
  test('page loads from the login screen link', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('submitting without a login ID shows a validation error', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.submitButton.click();

    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(forgotPassword.errorMessage).toHaveText(/enter your email, mobile number, or username/i);
  });

  test('submitting an unregistered login ID shows a not-found error', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.requestReset(`definitely.not.registered.${Date.now()}@example.com`);

    await expect(forgotPassword.errorMessage).toHaveText(/no account found/i);
  });

  test(
    'submitting a registered email lets you set a new password and log in with it',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      const identity = uniqueSignupIdentity();
      const signup = new SignupPage(page);
      await signup.goto();
      await signup.signUp(identity);
      await expect(page.getByTestId('signup-success')).toBeVisible();

      const forgotPassword = new ForgotPasswordPage(page);
      await forgotPassword.goto();
      await forgotPassword.requestReset(identity.email);

      await expect(forgotPassword.successMessage).toBeVisible();
      await forgotPassword.continueToResetLink.click();
      await expect(page).toHaveURL(/\/reset-password\?token=/);

      const newPassword = `New!${identity.password}`;
      const resetPassword = new ResetPasswordPage(page);
      await resetPassword.resetPassword(newPassword);

      await expect(resetPassword.successMessage).toBeVisible();

      const login = new LoginPage(page);
      await login.goto();
      await login.login(identity.email, newPassword);

      await expect(page.getByTestId('login-success')).toContainText(identity.email);
    }
  );

  test('mismatched confirm-password on reset is rejected', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const identity = uniqueSignupIdentity();
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.signUp(identity);

    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.requestReset(identity.email);
    await forgotPassword.continueToResetLink.click();

    const resetPassword = new ResetPasswordPage(page);
    await resetPassword.resetPassword('Different!Pass99!#', 'Mismatch!Pass99!#');

    await expect(resetPassword.errorMessage).toHaveText(/do not match/i);
  });

  test('a new password without 2+ special characters is rejected on reset', {
    tag: ['@functional', '@regression'],
  }, async ({ page }) => {
    const identity = uniqueSignupIdentity();
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.signUp(identity);

    const forgotPassword = new ForgotPasswordPage(page);
    await forgotPassword.goto();
    await forgotPassword.requestReset(identity.email);
    await forgotPassword.continueToResetLink.click();

    const resetPassword = new ResetPasswordPage(page);
    await resetPassword.resetPassword('OnlyOneSpecial1!');

    await expect(resetPassword.errorMessage).toHaveText(/2 special characters/i);
  });
});

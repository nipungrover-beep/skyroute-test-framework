import { Page, Locator } from '@playwright/test';

/**
 * /reset-password?token=... — reached via the link ForgotPasswordPage
 * surfaces in place of a real email. The reset token itself arrives
 * pre-filled from the query string.
 */
export class ResetPasswordPage {
  readonly page: Page;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newPasswordInput = page.getByTestId('reset-password-new-password-input');
    this.confirmPasswordInput = page.getByTestId('reset-password-confirm-password-input');
    this.submitButton = page.getByRole('button', { name: 'Reset password' });
    this.errorMessage = page.getByTestId('reset-password-error');
    this.successMessage = page.getByTestId('reset-password-success');
  }

  async resetPassword(password: string, confirmPassword = password) {
    await this.newPasswordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  }
}

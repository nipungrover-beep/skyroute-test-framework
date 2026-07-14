import { Page, Locator } from '@playwright/test';

export class ForgotPasswordPage {
  readonly page: Page;
  readonly loginIdInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly continueToResetLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginIdInput = page.getByPlaceholder('Email, mobile number, or username');
    this.submitButton = page.getByRole('button', { name: 'Send reset link' });
    this.errorMessage = page.getByTestId('forgot-password-error');
    this.successMessage = page.getByTestId('forgot-password-success');
    this.continueToResetLink = page.getByRole('link', { name: 'Continue to reset password' });
  }

  async goto() {
    await this.page.goto('/forgot-password');
  }

  async requestReset(loginId: string) {
    await this.loginIdInput.fill(loginId);
    await this.submitButton.click();
  }
}

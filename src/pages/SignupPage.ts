import { Page, Locator } from '@playwright/test';

export class SignupPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly mobileInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.mobileInput = page.getByPlaceholder('10-digit mobile number');
    this.usernameInput = page.getByPlaceholder('Linked to your email/mobile for login');
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').last();
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async signUp(opts: { email: string; mobile: string; username?: string; password: string }) {
    await this.emailInput.fill(opts.email);
    await this.mobileInput.fill(opts.mobile);
    if (opts.username) await this.usernameInput.fill(opts.username);
    await this.passwordInput.fill(opts.password);
    await this.confirmPasswordInput.fill(opts.password);
    await this.signUpButton.click();
  }
}

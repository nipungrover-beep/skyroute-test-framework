import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginIdInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginIdInput = page.getByPlaceholder('Email, mobile number, or username');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.errorMessage = page.getByText('Invalid login ID or password');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(loginId: string, password: string) {
    await this.loginIdInput.fill(loginId);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

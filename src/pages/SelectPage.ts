import { Page, Locator } from '@playwright/test';

/**
 * /flights/{id}/select — fare tier + seat map selection.
 */
export class SelectPage {
  readonly page: Page;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  fareCard(name: 'Saver' | 'Flexi' | 'Flexi Plus'): Locator {
    return this.page.getByText(name, { exact: true }).locator('..').locator('..');
  }

  async chooseFare(name: 'Saver' | 'Flexi' | 'Flexi Plus') {
    await this.page.getByText(name, { exact: true }).click();
  }

  /** e.g. row=3, col='A' for an available economy seat. */
  async chooseSeat(row: number, col: string) {
    await this.page
      .locator('button, td, div')
      .filter({ hasText: new RegExp(`^${col}$`) })
      .nth(0)
      .click();
  }

  async continueToSummary() {
    await this.continueButton.click();
  }
}

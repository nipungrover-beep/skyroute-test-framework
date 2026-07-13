import { Page, Locator } from '@playwright/test';

/**
 * /flights/{id}/confirm — selection summary with booking reference.
 */
export class ConfirmPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly totalPrice: Locator;
  readonly reference: Locator;
  readonly searchAnotherFlightLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Selection summary' });
    this.totalPrice = page.getByTestId('confirmation-total-price');
    this.reference = page.getByTestId('confirmation-id');
    this.searchAnotherFlightLink = page.getByRole('link', { name: 'Search another flight' });
  }

  async getReference(): Promise<string> {
    const text = (await this.reference.textContent())?.trim() ?? '';
    return text.replace(/^Reference:\s*/, '');
  }
}

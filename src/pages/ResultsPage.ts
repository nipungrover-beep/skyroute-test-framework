import { Page, Locator } from '@playwright/test';

/**
 * /results — flight list with stop/airline filters and sort control.
 */
export class ResultsPage {
  readonly page: Page;
  readonly flightCount: Locator;
  readonly sortSelect: Locator;
  readonly nonstopFilter: Locator;
  readonly oneStopFilter: Locator;
  readonly anyStopsFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flightCount = page.getByText(/flights? found/i);
    this.sortSelect = page.getByLabel(/sort by/i).or(page.locator('select').last());
    this.anyStopsFilter = page.getByRole('radio', { name: 'any' });
    this.nonstopFilter = page.getByRole('radio', { name: 'nonstop' });
    this.oneStopFilter = page.getByRole('radio', { name: '1stop' });
  }

  flightCard(index = 0): Locator {
    return this.page.locator('article').nth(index);
  }

  async selectFlight(index = 0) {
    await this.flightCard(index).getByRole('link', { name: 'Select' }).click();
  }

  async sortBy(value: 'price' | 'duration' | 'departure') {
    await this.sortSelect.selectOption(value);
  }

  async filterByAirline(airlineName: string) {
    await this.page.getByRole('checkbox', { name: new RegExp(airlineName, 'i') }).check();
  }

  async filterNonstop() {
    await this.nonstopFilter.check();
  }

  async getDisplayedPrices(): Promise<number[]> {
    const priceTexts = await this.page.locator('article').getByText(/^₹[\d,]+$/).allTextContents();
    return priceTexts.map((t) => Number(t.replace(/[₹,]/g, '')));
  }
}

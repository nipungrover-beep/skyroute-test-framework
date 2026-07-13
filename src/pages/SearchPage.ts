import { Page, Locator } from '@playwright/test';

/**
 * Home / search page: origin, destination, date, passengers, class, search.
 */
export class SearchPage {
  readonly page: Page;
  readonly originInput: Locator;
  readonly destinationInput: Locator;
  readonly swapButton: Locator;
  readonly dateInput: Locator;
  readonly passengersSelect: Locator;
  readonly classSelect: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.originInput = page.getByPlaceholder('Origin city or airport');
    this.destinationInput = page.getByPlaceholder('Destination city or airport');
    this.swapButton = page.getByRole('button', { name: 'Swap origin and destination' });
    this.dateInput = page.getByLabel('Departure date');
    this.passengersSelect = page.locator('select').first();
    this.classSelect = page.locator('select').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search flights' });
  }

  async goto() {
    await this.page.goto('/');
  }

  /** Types into the origin/destination autocomplete and picks the first suggestion. */
  private async pickAirport(input: Locator, query: string) {
    await input.click();
    await input.fill(query);
    const suggestion = this.page.getByText(new RegExp(`^${query}`, 'i')).first();
    await suggestion.waitFor({ state: 'visible' });
    await suggestion.click();
  }

  async pickOrigin(query: string) {
    await this.pickAirport(this.originInput, query);
  }

  async pickDestination(query: string) {
    await this.pickAirport(this.destinationInput, query);
  }

  /** date in YYYY-MM-DD, e.g. '2026-08-20'. Native <input type="date">
   *  elements only accept a reliable value via `.fill()` with this format —
   *  typing digits via the keyboard doesn't drive the browser's date
   *  segment editor consistently under Playwright. */
  async setDepartureDate(iso: string) {
    await this.dateInput.fill(iso);
  }

  async setPassengers(count: number) {
    await this.passengersSelect.selectOption(String(count));
  }

  async setClass(travelClass: 'ECONOMY' | 'BUSINESS') {
    await this.classSelect.selectOption(travelClass);
  }

  async search() {
    await this.searchButton.click();
  }

  /** End-to-end convenience for the common case. */
  async searchFlights(opts: {
    origin: string;
    destination: string;
    date: string; // YYYY-MM-DD
    passengers?: number;
    travelClass?: 'ECONOMY' | 'BUSINESS';
  }) {
    await this.goto();
    await this.pickOrigin(opts.origin);
    await this.pickDestination(opts.destination);
    await this.setDepartureDate(opts.date);
    if (opts.passengers) await this.setPassengers(opts.passengers);
    if (opts.travelClass) await this.setClass(opts.travelClass);
    await this.search();
  }
}

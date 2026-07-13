import { test, expect } from '@playwright/test';
import { SearchPage } from '../../src/pages/SearchPage';
import { ResultsPage } from '../../src/pages/ResultsPage';
import { routes, futureDate } from '../../src/utils/testData';

test.describe('Results filtering and sorting', () => {
  test.beforeEach(async ({ page }) => {
    const search = new SearchPage(page);
    const { iso } = futureDate();
    await search.searchFlights({
      origin: routes.delhiToMumbai.origin,
      destination: routes.delhiToMumbai.destination,
      date: iso,
    });
  });

  test('sorting by price (low to high) returns ascending prices', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const results = new ResultsPage(page);
    await results.sortBy('price');
    const prices = await results.getDisplayedPrices();

    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('nonstop filter hides flights with stops', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const results = new ResultsPage(page);
    await results.filterNonstop();
    await expect(page.locator('article').getByText(/\d+ stop/i)).toHaveCount(0);
  });

  test('selecting a flight navigates to fare & seat selection', { tag: ['@smoke', '@regression'] }, async ({
    page,
  }) => {
    const results = new ResultsPage(page);
    await results.selectFlight(0);
    await expect(page).toHaveURL(/\/flights\/\d+\/select/);
    await expect(page.getByRole('heading', { name: 'Choose your fare and seat' })).toBeVisible();
  });
});

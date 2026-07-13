import { test, expect } from '@playwright/test';
import { SearchPage } from '../../src/pages/SearchPage';
import { ResultsPage } from '../../src/pages/ResultsPage';
import { routes, futureDate } from '../../src/utils/testData';

test.describe('Flight search', () => {
  test(
    'searching a valid route returns results',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      const search = new SearchPage(page);
      const results = new ResultsPage(page);
      const { iso } = futureDate();

      await search.searchFlights({
        origin: routes.delhiToMumbai.origin,
        destination: routes.delhiToMumbai.destination,
        date: iso,
      });

      await expect(page).toHaveURL(/\/results\?/);
      await expect(results.flightCount).toBeVisible();
    }
  );

  test('origin/destination autocomplete suggests matching airports', { tag: ['@functional'] }, async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.originInput.click();
    await search.originInput.fill('Del');

    await expect(page.getByText('Delhi', { exact: false })).toBeVisible();
  });

  test('swap button exchanges origin and destination', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.pickOrigin('Del');
    await search.pickDestination('Bom');

    const originBefore = await search.originInput.inputValue();
    const destinationBefore = await search.destinationInput.inputValue();

    await search.swapButton.click();

    await expect(search.originInput).toHaveValue(destinationBefore);
    await expect(search.destinationInput).toHaveValue(originBefore);
  });

  test('searching without selecting a destination shows validation, does not navigate', {
    tag: ['@functional', '@regression'],
  }, async ({ page }) => {
    const search = new SearchPage(page);
    await search.goto();
    await search.pickOrigin('Del');
    await search.search();

    // Negative case: the browser's native required-field validation should
    // block navigation — results should never load.
    await expect(page).not.toHaveURL(/\/results/);
  });
});

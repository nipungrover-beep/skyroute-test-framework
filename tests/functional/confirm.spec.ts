import { test, expect } from '@playwright/test';
import { SearchPage } from '../../src/pages/SearchPage';
import { ResultsPage } from '../../src/pages/ResultsPage';
import { ConfirmPage } from '../../src/pages/ConfirmPage';
import { routes, futureDate } from '../../src/utils/testData';

test.describe('Selection summary', () => {
  test('reference code is unique per fare/seat combination', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const search = new SearchPage(page);
    const results = new ResultsPage(page);
    const { iso } = futureDate();

    await search.searchFlights({
      origin: routes.delhiToMumbai.origin,
      destination: routes.delhiToMumbai.destination,
      date: iso,
    });
    await results.selectFlight(0);
    await page.getByText('Saver', { exact: true }).click();
    await page.getByText('3', { exact: true }).locator('..').getByText('A', { exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const confirm = new ConfirmPage(page);
    const ref = await confirm.getReference();
    expect(ref).toMatch(/^SEL-\d+-saver-3A-\d+$/i);
  });

  test('"Search another flight" returns to the home page', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    const search = new SearchPage(page);
    const results = new ResultsPage(page);
    const { iso } = futureDate();

    await search.searchFlights({
      origin: routes.delhiToMumbai.origin,
      destination: routes.delhiToMumbai.destination,
      date: iso,
    });
    await results.selectFlight(0);
    await page.getByText('Saver', { exact: true }).click();
    await page.getByText('3', { exact: true }).locator('..').getByText('A', { exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const confirm = new ConfirmPage(page);
    await confirm.searchAnotherFlightLink.click();
    await expect(page).toHaveURL('/');
  });
});

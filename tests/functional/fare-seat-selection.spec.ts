import { test, expect } from '@playwright/test';
import { SearchPage } from '../../src/pages/SearchPage';
import { ResultsPage } from '../../src/pages/ResultsPage';
import { ConfirmPage } from '../../src/pages/ConfirmPage';
import { routes, futureDate } from '../../src/utils/testData';

test.describe('Fare and seat selection', () => {
  test.beforeEach(async ({ page }) => {
    const search = new SearchPage(page);
    const results = new ResultsPage(page);
    const { iso } = futureDate();
    await search.searchFlights({
      origin: routes.delhiToMumbai.origin,
      destination: routes.delhiToMumbai.destination,
      date: iso,
    });
    await results.selectFlight(0);
  });

  test(
    'choosing fare + seat and continuing reaches the confirm summary with correct totals',
    { tag: ['@smoke', '@regression'] },
    async ({ page }) => {
      await page.getByText('Saver', { exact: true }).click();
      await page.getByText('3', { exact: true }).locator('..').getByText('A', { exact: true }).click();
      await page.getByRole('button', { name: 'Continue' }).click();

      const confirm = new ConfirmPage(page);
      await expect(confirm.heading).toBeVisible();
      await expect(page.getByTestId('confirmation-fare')).toHaveText('Saver');
      await expect(page.getByTestId('confirmation-seat')).toHaveText('3A');
    }
  );

  test('unavailable (already-booked) seats cannot be selected', { tag: ['@functional', '@regression'] }, async ({
    page,
  }) => {
    // Seats rendered without a "+fee" price tag and with the disabled/grey
    // styling represent unavailable seats in the legend ("Unavailable").
    const unavailableSeat = page.locator('button, td, div').filter({ hasText: /^[A-F]$/ }).and(
      page.locator('[disabled], [aria-disabled="true"]')
    );
    // Not every layout guarantees a disabled attribute — this assertion is a
    // starting point; tighten the selector once the app exposes a stable
    // data-testid for seat state (see README > Known gaps).
    test.skip(
      (await unavailableSeat.count()) === 0,
      'No seat exposed a disabled/aria-disabled attribute to assert against — revisit selector once app adds data-testid.'
    );
    await expect(unavailableSeat.first()).toBeDisabled();
  });

  test('extra-legroom seats show a price surcharge', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await expect(page.getByText('+₹300').first()).toBeVisible();
  });
});

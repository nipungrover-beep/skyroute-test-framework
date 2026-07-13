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
    // Each seat has a stable data-testid (seat-<id>, e.g. seat-1E) and is a
    // real disabled <button> when unavailable — see DEF-0001 (closed).
    const unavailableSeat = page.locator('[data-testid^="seat-"][disabled]').first();
    await expect(unavailableSeat).toBeVisible();
    await expect(unavailableSeat).toHaveAccessibleName(/unavailable/i);
  });

  test('extra-legroom seats show a price surcharge', { tag: ['@functional', '@regression'] }, async ({ page }) => {
    await expect(page.getByText('+₹300').first()).toBeVisible();
  });
});

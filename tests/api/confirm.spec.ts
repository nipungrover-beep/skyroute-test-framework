import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/ApiClient';
import { routes, futureDate } from '../../src/utils/testData';

test.describe('GET /api/flights/{id}/confirm', () => {
  test('valid fare + seat combination returns a booking reference', {
    tag: ['@api', '@smoke', '@regression'],
  }, async ({ request }) => {
    const api = new ApiClient(request);
    const { iso } = futureDate();
    const flightsRes = await api.flights({
      from: routes.delhiToMumbai.originCode,
      to: routes.delhiToMumbai.destinationCode,
      date: iso,
      passengers: 1,
      travelClass: 'ECONOMY',
    });
    const {
      flights: [{ id: flightId }],
    } = await flightsRes.json();

    const res = await api.confirm(flightId, {
      travelClass: 'ECONOMY',
      passengers: 1,
      fareId: 'saver',
      seatId: '3A',
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.selectionId).toBeTruthy();
  });

  test('an invalid fareId is rejected', { tag: ['@api', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const { iso } = futureDate();
    const flightsRes = await api.flights({
      from: routes.delhiToMumbai.originCode,
      to: routes.delhiToMumbai.destinationCode,
      date: iso,
      passengers: 1,
      travelClass: 'ECONOMY',
    });
    const {
      flights: [{ id: flightId }],
    } = await flightsRes.json();

    const res = await api.confirm(flightId, {
      travelClass: 'ECONOMY',
      passengers: 1,
      fareId: 'not-a-real-fare',
      seatId: '3A',
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

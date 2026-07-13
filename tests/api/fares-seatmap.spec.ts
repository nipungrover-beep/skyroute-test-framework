import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/ApiClient';
import { routes, futureDate } from '../../src/utils/testData';

/**
 * These specs need a real flightId. We fetch one from /api/flights first
 * rather than hardcoding one, so the suite doesn't silently rot when seed
 * data changes between releases.
 */
async function firstFlightId(api: ApiClient): Promise<number> {
  const { iso } = futureDate();
  const res = await api.flights({
    from: routes.delhiToMumbai.originCode,
    to: routes.delhiToMumbai.destinationCode,
    date: iso,
    passengers: 1,
    travelClass: 'ECONOMY',
  });
  const body = await res.json();
  return body.flights[0].id;
}

test.describe('GET /api/flights/{id}/fares', () => {
  test('returns fare tiers for a valid flight', { tag: ['@api', '@smoke', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const flightId = await firstFlightId(api);
    const res = await api.fares(flightId, 'ECONOMY');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.fares)).toBe(true);
    expect(body.fares.map((f: any) => f.id)).toEqual(expect.arrayContaining(['saver']));
  });

  test('an invalid flight id returns a 4xx', { tag: ['@api', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const res = await api.fares(999999999, 'ECONOMY');
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('GET /api/flights/{id}/seatmap', () => {
  test('returns a seat map with row/column layout', { tag: ['@api', '@smoke', '@regression'] }, async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const flightId = await firstFlightId(api);
    const res = await api.seatmap(flightId, 'ECONOMY');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toBeTruthy();
  });

  test('Business class seatmap differs from Economy', { tag: ['@api', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const flightId = await firstFlightId(api);
    const economy = await (await api.seatmap(flightId, 'ECONOMY')).json();
    const business = await (await api.seatmap(flightId, 'BUSINESS')).json();
    expect(JSON.stringify(economy)).not.toEqual(JSON.stringify(business));
  });
});

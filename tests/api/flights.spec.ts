import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/ApiClient';
import { routes, futureDate } from '../../src/utils/testData';

test.describe('GET /api/flights', () => {
  test('returns flights for a valid route/date', { tag: ['@api', '@smoke', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const { iso } = futureDate();
    const res = await api.flights({
      from: routes.delhiToMumbai.originCode,
      to: routes.delhiToMumbai.destinationCode,
      date: iso,
      passengers: 1,
      travelClass: 'ECONOMY',
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.flights)).toBe(true);
    expect(body.flights.length).toBeGreaterThan(0);
    expect(body.flights[0]).toEqual(
      expect.objectContaining({
        airline: expect.any(String),
        flightNumber: expect.any(String),
        price: expect.any(Number),
      })
    );
  });

  test('same origin and destination is rejected or returns empty', { tag: ['@api', '@regression'] }, async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const { iso } = futureDate();
    const res = await api.flights({
      from: 'DEL',
      to: 'DEL',
      date: iso,
      passengers: 1,
      travelClass: 'ECONOMY',
    });
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toEqual([]);
    } else {
      expect(res.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test('a past date returns no flights or a 4xx', { tag: ['@api', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const res = await api.flights({
      from: 'DEL',
      to: 'BOM',
      date: '2020-01-01',
      passengers: 1,
      travelClass: 'ECONOMY',
    });
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toEqual([]);
    } else {
      expect(res.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test('an unknown airport code is rejected or returns empty', { tag: ['@api', '@regression'] }, async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const { iso } = futureDate();
    const res = await api.flights({
      from: 'ZZZ',
      to: 'BOM',
      date: iso,
      passengers: 1,
      travelClass: 'ECONOMY',
    });
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toEqual([]);
    } else {
      expect(res.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test('9 passengers (the UI max) is accepted', { tag: ['@api', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const { iso } = futureDate();
    const res = await api.flights({
      from: 'DEL',
      to: 'BOM',
      date: iso,
      passengers: 9,
      travelClass: 'ECONOMY',
    });
    expect(res.status()).toBe(200);
  });
});

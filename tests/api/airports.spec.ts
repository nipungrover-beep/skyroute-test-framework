import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/ApiClient';

test.describe('GET /api/airports', () => {
  test('returns matching airports for a valid partial query', { tag: ['@api', '@smoke', '@regression'] }, async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const res = await api.airports('Del');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toEqual(
      expect.objectContaining({ code: expect.any(String), city: expect.any(String) })
    );
  });

  test('returns an empty result for a query with no matches', { tag: ['@api', '@regression'] }, async ({
    request,
  }) => {
    const api = new ApiClient(request);
    const res = await api.airports('zzzznotarealcity');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  test('handles an empty query string without erroring', { tag: ['@api', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const res = await api.airports('');
    expect([200, 400]).toContain(res.status());
  });
});

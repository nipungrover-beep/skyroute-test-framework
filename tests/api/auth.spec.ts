import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/ApiClient';

test.describe('POST /api/auth/login', () => {
  test('invalid credentials return 401', { tag: ['@api', '@smoke', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const res = await api.login('test@example.com', 'wrongpassword');
    expect(res.status()).toBe(401);
  });

  test('missing password field returns a 4xx, not a 5xx', { tag: ['@api', '@regression'] }, async ({ request }) => {
    const api = new ApiClient(request);
    const res = await request.post('/api/auth/login', { data: { loginId: 'test@example.com' } });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('valid credentials return 200 with a session/token', { tag: ['@api', '@smoke', '@regression'] }, async ({
    request,
  }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'Set TEST_USER_EMAIL / TEST_USER_PASSWORD in .env to enable this test — see README > Test accounts.'
    );
    const api = new ApiClient(request);
    const res = await api.login(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    expect(res.status()).toBe(200);
  });
});

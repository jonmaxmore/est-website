import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test.describe('API Health Checks', () => {
  const publicEndpoints = [
    '/api/public/sections',
    '/api/public/features',
    '/api/public/highlights',
    '/api/public/news',
    '/api/public/weapons',
    '/api/public/stats',
    '/api/public/site',
  ]

  for (const endpoint of publicEndpoints) {
    test(`GET ${endpoint} should return 200`, async ({ request }) => {
      const response = await request.get(`${BASE}${endpoint}`)
      expect(response.status()).toBe(200)

      const body = await response.json()
      expect(body).toBeTruthy()
    })
  }

  test('POST /api/auth/login with bad credentials should return 401 (or 429 if rate-limited)', async ({ request }) => {
    const response = await request.post(`${BASE}/api/auth/login`, {
      data: {
        email: 'nonexistent@test.dev',
        password: 'wrongpassword123',
      },
    })
    // 401 = bad creds. 429 = brute-force rate-limit kicked in (also acceptable —
    // means the security control is working). Either response confirms the
    // auth endpoint is not silently accepting bogus credentials.
    expect([401, 429]).toContain(response.status())
  })

  test('POST /api/register with invalid body should return 4xx', async ({ request }) => {
    const response = await request.post(`${BASE}/api/register`, {
      data: {
        email: 'not-an-email',
        platform: 'INVALID',
      },
    })
    // Accept 400 (validation error) or 429 (rate limit) — both indicate proper server handling
    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(response.status()).toBeLessThan(500)
  })
})

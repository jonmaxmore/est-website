import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test.describe('API Health Checks', () => {
  const publicEndpoints = [
    '/api/public/sections',
    '/api/public/features',
    '/api/public/highlights',
    '/api/public/news',
    '/api/public/weapons',
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

  test('GET /api/health (shallow) returns ok', async ({ request }) => {
    const response = await request.get(`${BASE}/api/health`)
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.mode).toBe('shallow')
  })

  test('GET /api/health?deep=1 reports DB ping', async ({ request }) => {
    const response = await request.get(`${BASE}/api/health?deep=1`)
    expect([200, 503]).toContain(response.status())
    const body = await response.json()
    expect(body.mode).toBe('deep')
    expect(body.db).toBeTruthy()
    expect(['ok', 'fail']).toContain(body.db.status)
  })

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

})

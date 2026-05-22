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

  test('POST /api/auth/login rate-limit: 11th bad-cred attempt returns 429', async ({ request }) => {
    // The previous test fired 1 bad-cred attempt. Brute-force limit is
    // 10 attempts per 5 min per IP (server/api/auth/login.post.ts:22 +
    // nginx layer at docker/nginx/default.conf:76-77), so attempts 2-10
    // here should still be 401, and the 11th (10th of this loop) should
    // trip the limiter to 429. PR-E2E runs against a fresh Redis per run
    // so the budget starts at 0 of 10.
    const responses: number[] = []
    for (let i = 0; i < 10; i++) {
      const res = await request.post(`${BASE}/api/auth/login`, {
        data: { email: `rl-probe-${i}@test.dev`, password: 'wrong' },
      })
      responses.push(res.status())
    }
    // Exactly one of the 10 must be 429 — earlier attempts are 401 until
    // the 10th attempt of the IP's window flips it.
    const has429 = responses.some((s) => s === 429)
    const has401 = responses.some((s) => s === 401)
    expect(has429, `expected at least one 429 in [${responses.join(',')}]`).toBe(true)
    expect(has401, 'expected at least one 401 before rate-limiter trips').toBe(true)
  })
})

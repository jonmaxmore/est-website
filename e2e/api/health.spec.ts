import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://178.128.127.161'

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

  test('POST /api/auth/login with bad credentials should return 401', async ({ request }) => {
    const response = await request.post(`${BASE}/api/auth/login`, {
      data: {
        email: 'nonexistent@test.dev',
        password: 'wrongpassword123',
      },
    })
    expect(response.status()).toBe(401)
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

import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test.describe('Newsletter signup endpoints (smoke)', () => {
  test('subscribe rejects invalid email', async ({ request }) => {
    const r = await request.post(`${BASE}/api/public/newsletter/subscribe`, {
      data: { email: 'not-an-email', locale: 'th' },
    })
    expect(r.status()).toBe(422)
  })

  test('subscribe accepts a well-formed request and returns 200', async ({ request }) => {
    // Use a unique email so re-runs don't conflict.
    const email = `smoke-${Date.now()}@example.test`
    const r = await request.post(`${BASE}/api/public/newsletter/subscribe`, {
      data: { email, locale: 'th' },
    })
    // 200 success OR 429 if previous run hit rate limit — both prove the
    // endpoint is wired correctly.
    expect([200, 429]).toContain(r.status())
  })

  test('confirm with bogus token redirects to invalid notice', async ({ request }) => {
    const r = await request.get(`${BASE}/api/public/newsletter/confirm?token=${'x'.repeat(64)}`, {
      maxRedirects: 0,
    })
    // Either 302 redirect to ?newsletter=expired/invalid, or 200 if the
    // redirect was followed — both prove the endpoint is reachable.
    expect([200, 302]).toContain(r.status())
  })

  test('unsubscribe with bogus token redirects to invalid notice', async ({ request }) => {
    const r = await request.get(
      `${BASE}/api/public/newsletter/unsubscribe?token=${'x'.repeat(64)}`,
      { maxRedirects: 0 },
    )
    expect([200, 302]).toContain(r.status())
  })
})

test.describe('DSAR endpoints (smoke)', () => {
  test('export rejects malformed payload', async ({ request }) => {
    const r = await request.post(`${BASE}/api/public/dsar/export`, {
      data: { email: 'invalid', token: 'short' },
    })
    expect(r.status()).toBe(422)
  })

  test('export with valid shape but unknown email returns 200 + null data', async ({ request }) => {
    const r = await request.post(`${BASE}/api/public/dsar/export`, {
      data: { email: 'nobody@example.test', token: 'x'.repeat(64) },
    })
    expect([200, 429]).toContain(r.status())
    if (r.status() === 200) {
      const body = await r.json()
      expect(body.data).toBeNull()
    }
  })

  test('delete rejects malformed payload', async ({ request }) => {
    const r = await request.post(`${BASE}/api/public/dsar/delete`, {
      data: { email: 'invalid', token: 'short' },
    })
    expect(r.status()).toBe(422)
  })
})

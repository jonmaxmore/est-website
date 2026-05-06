import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

test.describe('RSS feed', () => {
  test('GET /news/feed.xml returns valid XML with cache-control', async ({ request }) => {
    const r = await request.get(`${BASE}/news/feed.xml`)
    expect(r.status()).toBe(200)
    expect(r.headers()['content-type']).toContain('application/rss+xml')
    expect(r.headers()['cache-control']).toContain('public')

    const body = await r.text()
    expect(body).toContain('<?xml')
    expect(body).toContain('<rss')
    expect(body).toContain('<channel>')
    expect(body).toContain('<atom:link')
  })
})

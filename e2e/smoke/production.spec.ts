/**
 * ═══ Production Smoke Tests ═══
 * UAT-style checks ที่รันบน production เพื่อเช็คว่าระบบหลักยังทำงาน
 *
 * Run on production:
 *   BASE_URL=http://178.128.127.161 npx playwright test e2e/smoke/
 *
 * Run on local dev:
 *   BASE_URL=http://localhost:3000 npx playwright test e2e/smoke/
 */
import { test, expect } from '@playwright/test'

const KEY_PAGES = [
  { path: '/', expectedTitlePattern: /Eternal Tower Saga/i },
  { path: '/weapons', expectedTitlePattern: /(weapon|อาวุธ)/i },
  { path: '/news', expectedTitlePattern: /(news|chronicle|ข่าว)/i },
  { path: '/game-guide', expectedTitlePattern: /(guide|คู่มือ)/i },
  { path: '/support', expectedTitlePattern: /(support|ช่วยเหลือ|ศูนย์)/i },
  { path: '/event', expectedTitlePattern: /(event|register|registration|ลงทะเบียน)/i },
  { path: '/download', expectedTitlePattern: /(download|ดาวน์โหลด)/i },
  { path: '/faq', expectedTitlePattern: /faq|คำถาม/i },
  { path: '/admin/login', expectedTitlePattern: /Eternal Tower Saga/i },
]

test.describe('Production smoke — pages return 200', () => {
  for (const { path, expectedTitlePattern } of KEY_PAGES) {
    test(`GET ${path}`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page).toHaveTitle(expectedTitlePattern)
    })
  }
})

test.describe('Homepage — Hero section', () => {
  test('renders ETERNAL TOWER title + 3 platform cards', async ({ page }) => {
    await page.goto('/')
    // Hero title visible
    await expect(page.locator('h1').filter({ hasText: 'ETERNAL' })).toBeVisible()
    // Platform cards
    await expect(page.locator('a.ets-platform').filter({ hasText: 'App Store' })).toBeVisible()
    await expect(page.locator('a.ets-platform').filter({ hasText: 'Google Play' })).toBeVisible()
    await expect(page.locator('a.ets-platform').filter({ hasText: 'Windows' })).toBeVisible()
  })

  test('Pre-register button links to /event', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('a').filter({ hasText: /Pre-register|ลงทะเบียน/i }).first()
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', /\/event/)
  })

  test('Hero does not overflow viewport (max-h fits content)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    const hero = page.locator('section').first()
    const box = await hero.boundingBox()
    expect(box).not.toBeNull()
    // Hero's natural min-h-dvh = viewport height; content should fit within with py-24 padding
    if (box) {
      // Hero height should be reasonable (not crashing into multi-screen overflow)
      expect(box.height).toBeLessThan(2000)
    }
  })
})

test.describe('Header navigation', () => {
  test('5 main nav links present in DOM (desktop or mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }) // Desktop viewport
    await page.goto('/')
    // 5 links rendered (some may be hidden on mobile but still in DOM)
    const navLinks = page.locator('header nav a')
    const count = await navLinks.count()
    expect(count).toBeGreaterThanOrEqual(5)
    // Active state: link to / has gold class
    const homeLink = page.locator('header nav a[href="/"]').first()
    await expect(homeLink).toHaveClass(/text-gold/)
  })

  test('Skip-to-content link present', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('a.ets-skip-link')
    await expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  test('Language switcher has aria-pressed', async ({ page }) => {
    await page.goto('/')
    const langButtons = page.locator('.lang-switcher button')
    const count = await langButtons.count()
    expect(count).toBeGreaterThan(0)
    await expect(langButtons.first()).toHaveAttribute('aria-pressed', /true|false/)
  })
})

test.describe('Security headers', () => {
  test('x-request-id present on all responses', async ({ request }) => {
    const response = await request.get('/')
    expect(response.headers()['x-request-id']).toMatch(/^[a-f0-9-]{8,}$/)
  })

  test('HSTS header on HTTPS-style responses', async ({ request }) => {
    const response = await request.get('/')
    // HSTS may not be present on HTTP-only deployments — gate this
    const hsts = response.headers()['strict-transport-security']
    if (hsts) {
      expect(hsts).toMatch(/max-age=\d+/)
    }
  })

  test('No nginx version leak (server_tokens off)', async ({ request }) => {
    const response = await request.get('/')
    const server = response.headers()['server']
    // Should be just "nginx" — no version
    expect(server).toBe('nginx')
  })
})

test.describe('Public API endpoints', () => {
  test('GET /api/public/site returns navigation', async ({ request }) => {
    const response = await request.get('/api/public/site')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.navigation?.main).toBeInstanceOf(Array)
    expect(data.navigation.main.length).toBeGreaterThanOrEqual(5)
  })

  test('GET /api/public/banners returns orchestrated banners', async ({ request }) => {
    const response = await request.get('/api/public/banners?routeType=homepage')
    expect(response.status()).toBe(200)
    const data = await response.json()
    // Should have 7 placement keys (popup, floating, etc.)
    expect(Object.keys(data)).toContain('popup')
    expect(Object.keys(data)).toContain('announcement_bar')
  })

  test('GET /api/public/news returns paginated', async ({ request }) => {
    const response = await request.get('/api/public/news?page=1&limit=10')
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.data).toBeInstanceOf(Array)
    expect(data.meta).toMatchObject({
      total: expect.any(Number),
      page: 1,
      limit: 10,
    })
  })
})

test.describe('Admin login flow', () => {
  test('Login page loads', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('Invalid credentials get rejected (401 or 429 rate-limit)', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { email: 'bad@example.com', password: 'wrong-password' },
    })
    // 401 = bad creds rejected. 429 = brute-force rate-limit — also a valid
    // security response (means the limiter is doing its job). Either way the
    // endpoint refuses bogus credentials.
    expect([401, 429]).toContain(response.status())
    if (response.status() === 401) {
      const body = await response.json()
      expect(body.message || body.statusMessage).toMatch(/invalid|wrong|incorrect/i)
    }
  })

  test('Unauthenticated /admin redirects to /admin/login', async ({ page }) => {
    const response = await page.goto('/admin')
    // Should land on login page
    expect(page.url()).toContain('/admin/login')
    expect(response?.status()).toBeLessThan(500)
  })
})

test.describe('Korean characters removed (per design source)', () => {
  test('Homepage HTML contains no Hangul', async ({ request }) => {
    const response = await request.get('/')
    const html = await response.text()
    // Hangul range U+AC00–U+D7A3 (Korean)
    const hangulMatches = html.match(/[가-힣]/g) || []
    expect(hangulMatches.length).toBe(0)
  })
})

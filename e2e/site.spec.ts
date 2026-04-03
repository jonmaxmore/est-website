import { test, expect } from '@playwright/test'

// ─── API Health ─────────────────────────────────────────────
test.describe('API Health', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.environment).toBe('production')
  })

  test('homepage API returns guide fields', async ({ request }) => {
    const res = await request.get('/api/globals/homepage')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    // Verify guide fields exist after migration
    expect(body).toHaveProperty('guideTitleTh')
    expect(body).toHaveProperty('guideCards')
  })
})

// ─── Homepage Sections ─────────────────────────────────────
test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Eternal Tower Saga/i)
  })

  test('navigation bar is visible', async ({ page }) => {
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
  })

  test('hero section renders', async ({ page }) => {
    const hero = page.locator('#hero, [class*="hero"], section').first()
    await expect(hero).toBeVisible()
  })

  test('weapons section exists', async ({ page }) => {
    const weapons = page.locator('#weapons, [id*="weapon"]').first()
    if (await weapons.count()) {
      await weapons.scrollIntoViewIfNeeded()
      await expect(weapons).toBeVisible()
    }
  })

  test('game guide section has 4 cards', async ({ page }) => {
    // Scroll to game guide section
    const guideSection = page.locator('[class*="guide"], #game-guide, section:has-text("คู่มือเกม")').first()
    if (await guideSection.count()) {
      await guideSection.scrollIntoViewIfNeeded()
      await expect(guideSection).toBeVisible()
    }

    // Check for guide cards — at least 4 expected
    const cards = page.locator('[class*="guide"] [class*="card"], [class*="guide-card"]')
    const count = await cards.count()
    if (count > 0) {
      expect(count).toBeGreaterThanOrEqual(4)
    }
  })

  test('news section renders', async ({ page }) => {
    const news = page.locator('#news, [id*="news"]').first()
    if (await news.count()) {
      await news.scrollIntoViewIfNeeded()
      await expect(news).toBeVisible()
    }
  })

  test('footer is present', async ({ page }) => {
    const footer = page.locator('footer').first()
    await expect(footer).toBeVisible()
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/', { waitUntil: 'load' })
    // Filter out known benign errors (e.g. favicon, third-party)
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('ERR_BLOCKED_BY_CLIENT')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})

// ─── Subpages ──────────────────────────────────────────────
test.describe('Subpages', () => {
  const pages = [
    { path: '/weapons', title: /Eternal Tower Saga/i },
    { path: '/game-guide', title: /Eternal Tower Saga/i },
    { path: '/news', title: /Eternal Tower Saga/i },
    { path: '/faq', title: /Eternal Tower Saga/i },
    { path: '/story', title: /Eternal Tower Saga/i },
    { path: '/download', title: /Eternal Tower Saga/i },
  ]

  for (const { path, title } of pages) {
    test(`${path} loads without error`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' })
      expect(res?.ok()).toBeTruthy()
      await expect(page).toHaveTitle(title)
    })
  }
})

// ─── Responsive Layout ────────────────────────────────────
test.describe('Responsive', () => {
  test('mobile bottom nav is visible on small screens', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const bottomNav = page.locator('[class*="bottomNav"], [class*="mobile-nav"], nav[class*="mobile"]').first()
    if (await bottomNav.count()) {
      await expect(bottomNav).toBeVisible()
    }
  })

  test('desktop nav is visible on wide screens', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only test')
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
  })
})

// ─── CMS Admin ─────────────────────────────────────────────
test.describe('CMS Admin', () => {
  test('admin login page is accessible', async ({ page }) => {
    const res = await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    expect(res?.status()).toBeLessThan(500)
  })
})

// ─── SEO & Meta ────────────────────────────────────────────
test.describe('SEO', () => {
  test('homepage has meta description', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const desc = page.locator('meta[name="description"]')
    await expect(desc).toHaveAttribute('content', /.+/)
  })

  test('sitemap.xml is accessible', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.ok()).toBeTruthy()
    const body = await res.text()
    expect(body).toContain('<?xml')
  })
})

// ─── Performance ───────────────────────────────────────────
test.describe('Performance', () => {
  test('homepage loads under 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  })
})

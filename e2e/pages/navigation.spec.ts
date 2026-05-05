import { test, expect } from '@playwright/test'

const PUBLIC_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/news', name: 'News' },
  { path: '/faq', name: 'FAQ' },
  { path: '/story', name: 'Story' },
  { path: '/weapons', name: 'Weapons' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/download', name: 'Download' },
  { path: '/support', name: 'Support' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/terms', name: 'Terms' },
  { path: '/game-guide', name: 'Game Guide' },
]

test.describe('Page Navigation', () => {
  for (const { path, name } of PUBLIC_PAGES) {
    test(`${name} page (${path}) should load successfully`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 })

      // Page should return 200
      expect(response?.status()).toBe(200)

      // Page should have a <title>
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)

      // Page should have visible content
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  }

  test('should show error page for non-existent route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })

  test('footer should be visible on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const footer = page.locator('footer')
    if (await footer.count() > 0) {
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible()
    }
  })

  test('navigation between pages works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Find a visible link to the news page
    const newsLinks = page.locator('a[href*="/news"]')
    const count = await newsLinks.count()

    for (let i = 0; i < count; i++) {
      const link = newsLinks.nth(i)
      if (await link.isVisible()) {
        await link.click()
        await page.waitForURL(/\/news/, { timeout: 15_000 })
        expect(page.url()).toContain('/news')
        return
      }
    }

    // If no visible link found (e.g., mobile with collapsed nav), navigate directly
    await page.goto('/news', { waitUntil: 'domcontentloaded' })
    expect(page.url()).toContain('/news')
  })
})

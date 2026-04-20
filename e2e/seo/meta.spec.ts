import { test, expect } from '@playwright/test'

const PAGES_TO_CHECK = [
  { path: '/', name: 'Homepage' },
  { path: '/news', name: 'News' },
  { path: '/event', name: 'Event' },
  { path: '/faq', name: 'FAQ' },
  { path: '/story', name: 'Story' },
]

test.describe('SEO Meta Tags', () => {
  test('homepage should have correct OG tags', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const ogType = page.locator('meta[property="og:type"]')
    await expect(ogType).toHaveAttribute('content', 'website')

    const ogSiteName = page.locator('meta[property="og:site_name"]')
    await expect(ogSiteName).toHaveAttribute('content', /Eternal Tower Saga/)

    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute('content', /.+/)

    const twitterCard = page.locator('meta[name="twitter:card"]')
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image')
  })

  test('homepage should have meta description', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const metaDesc = page.locator('meta[name="description"]')
    const content = await metaDesc.getAttribute('content')
    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(10)
  })

  test('html should have lang attribute', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const html = page.locator('html')
    const lang = await html.getAttribute('lang')
    expect(lang).toBeTruthy()
    expect(lang).toBe('th')
  })

  for (const { path, name } of PAGES_TO_CHECK) {
    test(`${name} (${path}) should have a non-empty <title>`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    })
  }

  test('homepage should have exactly one <h1>', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeLessThanOrEqual(1)
  })

  test('homepage should have favicon', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const favicon = page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', /favicon/)
  })

  test('homepage should preconnect to Google Fonts', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const preconnect = page.locator('link[rel="preconnect"][href*="fonts.googleapis"]')
    await expect(preconnect).toHaveAttribute('href', /fonts\.googleapis\.com/)
  })
})

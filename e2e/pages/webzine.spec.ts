import { expect, test } from '@playwright/test'

test.describe('brand webzine', () => {
  test('news landing page renders structurally (data-agnostic)', async ({ page }) => {
    const response = await page.goto('/news', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(500)

    // Page heading + at least one section frame must mount, regardless of
    // whether admin has populated articles or topics yet.
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    expect(await page.locator('main, [role="main"]').count()).toBeGreaterThan(0)
  })

  test('article detail route resolves cleanly when slug exists, 404s otherwise', async ({ page }) => {
    // Pull a real article slug from the public API; if zero articles, the
    // detail route legitimately 404s — that's the correct behavior.
    const list = await page.request.get('/api/public/news').then((r) => r.json()).catch(() => ({ data: [] }))
    const articles = list?.data ?? []

    if (articles.length === 0) {
      const response = await page.goto('/news/this-slug-should-not-exist', { waitUntil: 'domcontentloaded' })
      expect(response?.status()).toBeGreaterThanOrEqual(400)
      return
    }

    const firstSlug = articles[0]?.slug
    if (!firstSlug) test.skip(true, 'No article slug available')

    const response = await page.goto(`/news/${firstSlug}`, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })

  test('topic listing route mounts (data-agnostic)', async ({ page }) => {
    // Topic page should render whether or not admin has configured the
    // getting-started topic. If route returns 404, that's also valid for
    // a fresh deploy without seed.
    const response = await page.goto('/news/topic/getting-started', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(500)
  })
})

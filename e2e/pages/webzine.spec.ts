import { expect, test } from '@playwright/test'

test.describe('brand webzine', () => {
  test('news landing renders the seeded guide, lore, dev blog, and event modules', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /ETS Beginner Guide/i }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /balance, fixes, and launch updates/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /worldbuilding, factions, and legends/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /notes from the team/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /active and upcoming events/i })).toBeVisible()
    await expect(page.getByText(/Skybreaker Rally/i)).toBeVisible()
    await expect(page.locator('[data-testid="marketing-banner-sidebar"]')).toContainText(/Tower Tactics Index/i)
  })

  test('article detail renders related content and the seeded article placements', async ({ page }) => {
    await page.goto('/news/ets-beginner-guide', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('[data-testid="marketing-banner-announcement_bar"]')).toBeVisible()
    await expect(page.locator('[data-testid="marketing-banner-article_inline"]')).toContainText(/Decode The Launch Week Checklist/i)
    await expect(page.locator('[data-testid="marketing-banner-footer_strip"]')).toContainText(/Season Zero Patch Notes/i)
    await expect(page.getByText(/related content/i)).toBeVisible()
    const relatedSection = page.locator('section').filter({
      has: page.getByRole('heading', { level: 2, name: /continue the thread/i }),
    })
    await expect(relatedSection.getByRole('link', { name: /Season Zero Patch Notes/i })).toBeVisible()
  })

  test('topic listing page renders the controlled getting-started topic', async ({ page }) => {
    await page.goto('/news/topic/getting-started', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(/getting started/i)
    await expect(page.getByRole('link', { name: /ETS Beginner Guide/i }).first()).toBeVisible()
  })
})

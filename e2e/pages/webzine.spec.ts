import { expect, test } from '@playwright/test'

test.describe('brand webzine', () => {
  test('news landing renders the seeded guide and patch notes sections', async ({ page }) => {
    await page.goto('/news', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /ETS Beginner Guide/i }).first()).toBeVisible()
    await expect(page.getByText('Patch Notes', { exact: true })).toBeVisible()
  })

  test('article detail renders related content and the announcement bar slot', async ({ page }) => {
    await page.goto('/news/ets-beginner-guide', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('[data-testid="marketing-banner-announcement_bar"]')).toBeVisible()
    await expect(page.getByText(/related content/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Season Zero Patch Notes/i })).toBeVisible()
  })

  test('topic listing page renders the controlled getting-started topic', async ({ page }) => {
    await page.goto('/news/topic/getting-started', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(/getting started/i)
    await expect(page.getByRole('link', { name: /ETS Beginner Guide/i }).first()).toBeVisible()
  })
})

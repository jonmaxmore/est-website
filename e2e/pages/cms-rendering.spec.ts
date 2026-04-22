import { expect, test } from '@playwright/test'

test.describe('public cms rendering', () => {
  test('system pages still render after moving to shared cms renderer', async ({ page }) => {
    const response = await page.goto('/support', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await expect(page.locator('body')).toContainText(/support/i)
    await expect(page.locator('body')).toContainText('support@eternaltowersaga.com')
  })

  test('unknown cms routes still return 404', async ({ page }) => {
    const response = await page.goto('/this-route-should-not-exist-anywhere', { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })
})

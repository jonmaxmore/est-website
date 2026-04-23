import { expect, test } from '@playwright/test'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'

test('admin can manage topics and create an announcement bar banner', async ({ page }) => {
  test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

  await page.goto('/admin/login')
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin(?!\/login)/)

  await page.goto('/admin/topics')
  await page.getByRole('button', { name: /new topic/i }).click()
  await page.getByLabel(/key/i).fill('classes')
  await page.getByLabel(/label \(en\)/i).fill('Classes')
  await page.getByRole('button', { name: /save topic/i }).click()
  await expect(page.getByText('Classes')).toBeVisible()

  await page.goto('/admin/banners')
  await page.getByRole('button', { name: /new banner/i }).click()
  await page.getByLabel(/placement/i).selectOption('announcement_bar')
  await page.getByLabel(/scope/i).selectOption('global')
  await page.getByLabel(/title \(en\)/i).fill('Launch Week Guide')
  await page.getByLabel(/title \(th\)/i).fill('Launch Week Guide')
  await page.getByLabel(/target type/i).selectOption('article')
  await page.getByLabel(/target article/i).selectOption({ label: /ETS Beginner Guide/i })
  await page.getByRole('button', { name: /save banner/i }).click()

  await expect(page.getByText('Launch Week Guide')).toBeVisible()
  await expect(page.getByText(/announcement bar/i)).toBeVisible()
})

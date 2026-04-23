import { expect, test, type Page } from '@playwright/test'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'

async function gotoAdminPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="admin-layout"][data-ready="true"]').waitFor({ state: 'attached', timeout: 30_000 })
}

test('admin can manage topics and create an announcement bar banner', async ({ page }) => {
  test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')
  const runId = Date.now().toString(36)
  const topicKey = `classes-${runId}`
  const topicLabel = `Classes ${runId}`
  const bannerTitle = `Launch Week Guide ${runId}`

  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' })
  await page.locator('[data-testid="admin-login-form"][data-ready="true"]').waitFor({ state: 'attached', timeout: 30_000 })
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/admin(?!\/login)/)

  await gotoAdminPage(page, '/admin/topics')
  await page.getByRole('button', { name: /new topic/i }).first().click()
  await page.locator('#topic-key').waitFor({ state: 'visible', timeout: 15_000 })
  await page.locator('#topic-key').fill(topicKey)
  await page.locator('#topic-label-en').fill(topicLabel)
  await page.getByRole('button', { name: /save topic/i }).click()
  const topicRow = page.getByRole('row', { name: new RegExp(topicKey, 'i') })
  await expect(topicRow).toBeVisible()
  await expect(topicRow.getByText(topicLabel, { exact: true })).toBeVisible()

  await gotoAdminPage(page, '/admin/banners')
  await page.getByRole('button', { name: /new banner/i }).first().click()
  await page.locator('#banner-placement').waitFor({ state: 'visible', timeout: 15_000 })
  await page.getByLabel(/placement/i).selectOption('announcement_bar')
  await page.getByLabel(/scope/i).selectOption('global')
  await page.getByLabel(/title \(en\)/i).fill(bannerTitle)
  await page.getByLabel(/title \(th\)/i).fill(bannerTitle)
  await page.getByLabel(/target type/i).selectOption('article')
  await page.getByLabel(/target article/i).selectOption({ label: 'ETS Beginner Guide' })
  await page.getByRole('button', { name: /save banner/i }).click()

  const bannerRow = page.getByRole('row', { name: new RegExp(bannerTitle, 'i') })
  await expect(bannerRow).toBeVisible()
  await expect(bannerRow.getByText(bannerTitle, { exact: true })).toBeVisible()
  await expect(bannerRow.getByText(/announcement bar/i)).toBeVisible()
})

import { expect, test } from '@playwright/test'
import pg from 'pg'

import { resolvePgConnectionString } from '../../server/utils/database-url'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'change-me'
const DATABASE_URL = resolvePgConnectionString(process.env.DATABASE_URL)

async function cleanupPageAndNavigation(pageKey: string, previousNavigation: unknown) {
  if (!DATABASE_URL) {
    return
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  try {
    await pool.query('DELETE FROM page_contents WHERE key = $1', [pageKey])
    await pool.query(
      'INSERT INTO site_config (key, value, "updatedAt") VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()',
      ['navigation', JSON.stringify(previousNavigation)],
    )
  } finally {
    await pool.end()
  }
}

test('admin can create a page and add it to header navigation without 404s', async ({ page }) => {
  test.slow()
  test.skip(ADMIN_PASSWORD === 'change-me', 'Set TEST_ADMIN_PASSWORD in .env.test to run this test')

  const pageKey = `about-us-${Date.now()}`
  let previousNavigation: unknown = { main: [], footer: [] }

  try {
    await page.goto('/admin/login')
    const loginStatus = await page.evaluate(
      async ({ email, password }) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        return response.status
      },
      { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    )
    expect(loginStatus).toBe(200)

    previousNavigation = await page.evaluate(async () => {
      const response = await fetch('/api/admin/config?key=navigation', { credentials: 'include' })
      return response.ok ? await response.json() : { main: [], footer: [] }
    })

    await page.goto('/admin/pages')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: /new page/i }).click()
    await expect(page.getByLabel(/title \(en\)/i)).toBeVisible()
    await page.getByLabel(/title \(en\)/i).fill('About Us')
    await page.getByLabel(/title \(th\)/i).fill('เกี่ยวกับเรา')
    await page.getByLabel(/slug/i).fill(pageKey)
    await page.getByRole('button', { name: /create page/i }).click()
    await expect(page.getByText('About Us')).toBeVisible()

    await page.goto('/admin/menus')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/header page/i).selectOption(pageKey)
    await page.getByRole('button', { name: /add page to header/i }).click()
    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('/api/admin/config') &&
        response.request().method() === 'PUT' &&
        response.ok(),
      ),
      page.getByRole('button', { name: /save navigation/i }).click(),
    ])

    await page.goto('/')
    const createdPageLink = page.locator(`a[href="/${pageKey}"]`).first()
    await expect(createdPageLink).toBeVisible()
    await createdPageLink.click()
    await page.waitForURL(new RegExp(`/${pageKey}$`))
    await expect(page.locator('body')).toContainText('เกี่ยวกับเรา')
    await expect(page.locator('body')).not.toContainText('404')
  } finally {
    await cleanupPageAndNavigation(pageKey, previousNavigation)
  }
})

/**
 * Debug spec: capture FULL hydration warning text from /admin/topics
 * This helps identify the actual subtree causing mismatch
 */
import { test } from '@playwright/test'

const ADMIN_EMAIL = process.env.UAT_ADMIN_EMAIL || 'admin@example.com'
const ADMIN_PASSWORD = process.env.UAT_ADMIN_PASSWORD || ''

test('capture hydration warning text', async ({ page }) => {
  const warnings: string[] = []
  page.on('console', (msg) => {
    if (msg.text().toLowerCase().includes('hydration')) {
      warnings.push(`[${msg.type()}] ${msg.text()}\n  Location: ${JSON.stringify(msg.location())}`)
    }
  })

  // Login
  await page.goto('/admin/login')
  await page.waitForSelector('form[data-ready="true"]', { timeout: 10000 })
  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.locator('button[type="submit"]:not([disabled])').click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })

  // Visit each problematic admin page
  const PROBLEM_PAGES = [
    '/admin/topics',
    '/admin/banners',
    '/admin/features',
    '/admin/highlights',
    '/admin/events',
    '/admin/milestones',
    '/admin/media',
    '/admin/registrations',
    '/admin/menus',
    '/admin/appearance',
    '/admin/integrations',
    '/admin/backup',
  ]

  for (const url of PROBLEM_PAGES) {
    warnings.length = 0
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    if (warnings.length > 0) {
      console.log(`\n═══ ${url} ═══`)
      warnings.forEach((w) => console.log(w))
    }
  }
})

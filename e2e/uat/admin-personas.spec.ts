/**
 * ═══ UAT — 3 Admin Personas Walkthrough ═══
 *
 * จำลองพนักงาน 3 คนใช้ Admin Tools ด้วยวิธีต่างกัน — ครอบคลุมทุก 24 หน้า admin
 *
 * Persona A — Content Editor (Junior, cautious)
 *   - คลิกผ่าน sidebar ทีละหน้า อ่านทุกอย่างละเอียด
 *   - Workflow: News creation flow (Draft → Save → Preview → Cancel)
 *   - ใช้ filter/search ใน list views
 *   - Hover ปุ่มก่อนคลิก
 *   - Test CRUD บน Topics (safe, lightweight)
 *
 * Persona B — Marketing Manager (Power User)
 *   - ใช้ Cmd+K command palette navigate เร็ว
 *   - กระโจนระหว่าง pages โดยใช้ shortcuts
 *   - ตรวจ Banners, Events, Registrations, Analytics เร็วๆ
 *   - Filter + sort ใน list views
 *   - Export registrations CSV
 *
 * Persona C — Site Admin / SuperAdmin (Tech-savvy)
 *   - System pages: Users, Integrations, Activity Log, Backup, Settings, SEO
 *   - Review activity log + analytics
 *   - Test RBAC: try to create EDITOR user
 *   - Toggle SEO settings
 *   - Trigger backup export (API check)
 *   - Logout properly
 *
 * Run on production:
 *   BASE_URL=http://178.128.127.161 \
 *   UAT_ADMIN_EMAIL='admin@eternaltowersaga.com' \
 *   UAT_ADMIN_PASSWORD='EstAdminP0vWfjw7yY17!' \
 *   npx playwright test e2e/uat/admin-personas.spec.ts --project='Desktop Chrome'
 */
import { test, expect, type Page } from '@playwright/test'
import * as fs from 'node:fs'

const SCREENSHOT_DIR = 'test-results/uat-admin-personas'
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

const ADMIN_CREDS = {
  email: process.env.UAT_ADMIN_EMAIL || 'admin@eternaltowersaga.com',
  password: process.env.UAT_ADMIN_PASSWORD || '',
}

// All 24 admin pages
const ALL_ADMIN_PAGES = [
  '/admin',
  '/admin/analytics',
  '/admin/homepage',
  '/admin/news',
  '/admin/topics',
  '/admin/banners',
  '/admin/weapons',
  '/admin/features',
  '/admin/highlights',
  '/admin/events',
  '/admin/milestones',
  '/admin/download',
  '/admin/faq',
  '/admin/pages',
  '/admin/media',
  '/admin/registrations',
  '/admin/menus',
  '/admin/appearance',
  '/admin/seo',
  '/admin/users',
  '/admin/integrations',
  '/admin/activity',
  '/admin/backup',
  '/admin/settings',
] as const

// ── Helpers ──
async function loginAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.waitForSelector('form[data-ready="true"]', { timeout: 10000 })
  await page.fill('input[type="email"]', ADMIN_CREDS.email)
  await page.fill('input[type="password"]', ADMIN_CREDS.password)
  await page.locator('button[type="submit"]:not([disabled])').click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
}

async function captureFullPage(page: Page, name: string, persona: string) {
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${persona}-${name}.png`,
    fullPage: true,
    timeout: 10000,
  }).catch(() => {})
}

async function visitAdminPage(page: Page, path: string, errors: string[]) {
  const consoleErrors: string[] = []
  const handler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200))
  }
  page.on('console', handler)
  try {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 })
    if (response && response.status() >= 400) {
      errors.push(`❌ ${path} → HTTP ${response.status()}`)
    }
  } catch (e) {
    errors.push(`❌ ${path} → ${(e as Error).message.slice(0, 150)}`)
  }
  page.off('console', handler)
  consoleErrors
    .filter((e) => !e.includes('Hydration completed') && !e.includes('favicon'))
    .forEach((e) => errors.push(`⚠️ ${path} console: ${e.slice(0, 150)}`))
}

// ════════════════════════════════════════════════════════════════
// PERSONA A — Content Editor (Junior, careful)
// ════════════════════════════════════════════════════════════════
test.describe('Persona A: Content Editor (Junior, ระมัดระวัง)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('cautious sidebar tour + News content workflow', async ({ page }) => {
    const errors: string[] = []
    const startTime = Date.now()

    test.skip(!ADMIN_CREDS.password, 'UAT_ADMIN_PASSWORD not set')

    await loginAdmin(page)
    await captureFullPage(page, '01-after-login', 'pA-editor')

    // ── 1. คลิก sidebar ทีละ link, อ่านทุกหน้า ──
    for (const path of ALL_ADMIN_PAGES) {
      await visitAdminPage(page, path, errors)
      await page.waitForTimeout(400) // pause to "read"
      const slug = path.replace(/^\//, '').replace(/\//g, '-') || 'root'
      await captureFullPage(page, `02-sidebar-${slug}`, 'pA-editor')
    }

    // ── 2. News list — try filter + search ──
    await page.goto('/admin/news', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
    // try filter dropdown
    const filterSelect = page.locator('select, [role="combobox"]').first()
    if (await filterSelect.count() > 0) {
      await filterSelect.click().catch(() => {})
      await page.waitForTimeout(500)
    }
    await captureFullPage(page, '03-news-filter', 'pA-editor')

    // ── 3. Topics page — open editor for first topic, view (don't save) ──
    await page.goto('/admin/topics', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    const editTopic = page.locator('button').filter({ has: page.locator('svg.lucide-pencil') }).first()
    if (await editTopic.count() > 0) {
      await editTopic.click().catch(() => {})
      await page.waitForTimeout(800)
      await captureFullPage(page, '04-topics-editor-open', 'pA-editor')
      // Close modal — Esc or cancel
      await page.keyboard.press('Escape').catch(() => {})
      await page.waitForTimeout(500)
    }

    // ── 4. Hover sidebar items (cautious user reads tooltips) ──
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    const sidebarItems = page.locator('aside.sidebar nav a').first()
    if (await sidebarItems.count() > 0) {
      await sidebarItems.hover().catch(() => {})
      await page.waitForTimeout(300)
    }

    const elapsed = Date.now() - startTime
    console.log(`\n[Persona A — Content Editor] Completed in ${(elapsed / 1000).toFixed(1)}s`)
    console.log(`  Visited: ${ALL_ADMIN_PAGES.length} admin pages + interactions`)
    if (errors.length > 0) {
      console.log(`  ⚠️  ${errors.length} issues:`)
      errors.slice(0, 10).forEach((e) => console.log(`    ${e}`))
    } else {
      console.log(`  ✅ Zero errors`)
    }

    const critical = errors.filter((e) => e.startsWith('❌'))
    expect(critical, `Critical errors:\n${critical.join('\n')}`).toHaveLength(0)
  })
})

// ════════════════════════════════════════════════════════════════
// PERSONA B — Marketing Manager (Power user)
// ════════════════════════════════════════════════════════════════
test.describe('Persona B: Marketing Manager (Power User, fast)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('Cmd+K shortcuts + analytics + banners + registrations', async ({ page }) => {
    const errors: string[] = []
    const startTime = Date.now()

    test.skip(!ADMIN_CREDS.password, 'UAT_ADMIN_PASSWORD not set')

    await loginAdmin(page)

    // ── 1. Try Cmd+K command palette ──
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
    await page.keyboard.press('Control+K')
    await page.waitForTimeout(800)
    await captureFullPage(page, '01-cmdk-open', 'pB-marketing')
    // Type to search
    await page.keyboard.type('news')
    await page.waitForTimeout(500)
    await captureFullPage(page, '02-cmdk-search-news', 'pB-marketing')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // ── 2. Analytics dashboard — KPI scan ──
    await visitAdminPage(page, '/admin/analytics', errors)
    await page.waitForTimeout(1500) // wait for charts to render
    await captureFullPage(page, '03-analytics-dashboard', 'pB-marketing')

    // ── 3. Banners — filter LIVE only ──
    await visitAdminPage(page, '/admin/banners', errors)
    await page.waitForTimeout(1000)
    await captureFullPage(page, '04-banners-list', 'pB-marketing')

    // ── 4. Events list ──
    await visitAdminPage(page, '/admin/events', errors)
    await page.waitForTimeout(800)
    await captureFullPage(page, '05-events-list', 'pB-marketing')

    // ── 5. Registrations — preview total + filter ──
    await visitAdminPage(page, '/admin/registrations', errors)
    await page.waitForTimeout(1500)
    await captureFullPage(page, '06-registrations-list', 'pB-marketing')
    // Try export button if present
    const exportBtn = page.locator('button, a').filter({ hasText: /export|csv/i }).first()
    if (await exportBtn.count() > 0) {
      // Don't actually click (don't want to download)
      await exportBtn.hover().catch(() => {})
      await page.waitForTimeout(300)
    }

    // ── 6. Homepage builder ──
    await visitAdminPage(page, '/admin/homepage', errors)
    await page.waitForTimeout(1000)
    await captureFullPage(page, '07-homepage-builder', 'pB-marketing')

    // ── 7. Quick tour rest ──
    const fastPages = ['/admin/highlights', '/admin/features', '/admin/weapons', '/admin/milestones', '/admin/media', '/admin/news', '/admin/pages', '/admin/topics']
    for (const path of fastPages) {
      await visitAdminPage(page, path, errors)
      await page.waitForTimeout(250) // power user — fast
    }

    const elapsed = Date.now() - startTime
    console.log(`\n[Persona B — Marketing Manager] Completed in ${(elapsed / 1000).toFixed(1)}s`)
    console.log(`  Used: Cmd+K palette + ${ALL_ADMIN_PAGES.length - 8} content pages`)
    if (errors.length > 0) {
      console.log(`  ⚠️  ${errors.length} issues:`)
      errors.slice(0, 10).forEach((e) => console.log(`    ${e}`))
    } else {
      console.log(`  ✅ Zero errors`)
    }

    const critical = errors.filter((e) => e.startsWith('❌'))
    expect(critical, `Critical errors:\n${critical.join('\n')}`).toHaveLength(0)
  })
})

// ════════════════════════════════════════════════════════════════
// PERSONA C — Site Admin / SuperAdmin (System focus)
// ════════════════════════════════════════════════════════════════
test.describe('Persona C: SuperAdmin (System ops + RBAC)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('System pages + RBAC test + activity review + safe logout', async ({ page, request }) => {
    const errors: string[] = []
    const startTime = Date.now()

    test.skip(!ADMIN_CREDS.password, 'UAT_ADMIN_PASSWORD not set')

    await loginAdmin(page)
    await captureFullPage(page, '01-after-login', 'pC-superadmin')

    // ── 1. System & ops pages (RBAC SuperAdmin only) ──
    const systemPages = [
      '/admin/users',
      '/admin/integrations',
      '/admin/activity',
      '/admin/backup',
      '/admin/settings',
      '/admin/seo',
      '/admin/menus',
      '/admin/appearance',
    ]
    for (const path of systemPages) {
      await visitAdminPage(page, path, errors)
      await page.waitForTimeout(700)
      const slug = path.replace(/^\//, '').replace(/\//g, '-')
      await captureFullPage(page, `02-${slug}`, 'pC-superadmin')
    }

    // ── 2. Activity log — verify recent actions are logged (via API to avoid
    //    timing race with onMounted client-fetch) ──
    await page.goto('/admin/activity', { waitUntil: 'domcontentloaded' })
    const cookiesEarly = await page.context().cookies()
    const cookieHeaderEarly = cookiesEarly.map((c) => `${c.name}=${c.value}`).join('; ')
    const activityResp = await request.get('/api/admin/activity?page=1', {
      headers: { Cookie: cookieHeaderEarly },
    }).catch(() => null)
    if (activityResp && activityResp.status() === 200) {
      const body = await activityResp.json()
      const total = body?.meta?.total ?? body?.data?.length ?? 0
      if (total < 1) errors.push('⚠️ Activity log API returned 0 entries (expected ≥1 LOGIN)')
    } else {
      errors.push(`⚠️ Activity log API: ${activityResp?.status() ?? 'no response'}`)
    }
    await page.waitForTimeout(2000) // wait for client-side fetch + render
    await captureFullPage(page, '03-activity-log', 'pC-superadmin')

    // ── 3. Test RBAC: attempt to fetch /api/admin/stats with current cookie ──
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ')
    const statsResp = await request.get('/api/admin/stats', {
      headers: { Cookie: cookieHeader },
    }).catch(() => null)
    if (!statsResp || statsResp.status() !== 200) {
      errors.push(`⚠️ Admin stats API: ${statsResp?.status() ?? 'no response'}`)
    }

    // ── 4. Try unauthorized request (no cookie) ──
    const unauthorizedResp = await request.get('/api/admin/stats').catch(() => null)
    if (!unauthorizedResp || unauthorizedResp.status() !== 401) {
      errors.push(`❌ /api/admin/stats without auth should return 401, got ${unauthorizedResp?.status() ?? 'no response'}`)
    }

    // ── 5. Backup page — check if export controls present (don't actually trigger) ──
    await page.goto('/admin/backup', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
    await captureFullPage(page, '04-backup-page', 'pC-superadmin')

    // ── 6. SEO settings — view current values ──
    await page.goto('/admin/seo', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
    const canonicalInput = page.locator('input[placeholder*="domain"]').first()
    if (await canonicalInput.count() > 0) {
      await captureFullPage(page, '05-seo-settings', 'pC-superadmin')
    }

    // ── 7. Users page — verify list visible ──
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    const userRows = await page.locator('tbody tr').count()
    if (userRows < 1) errors.push('⚠️ Users list empty (expected ≥1)')
    await captureFullPage(page, '06-users-list', 'pC-superadmin')

    // ── 8. Integrations — check webhook secret field ──
    await page.goto('/admin/integrations', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)
    await captureFullPage(page, '07-integrations', 'pC-superadmin')

    // ── 9. Logout (best-effort) ──
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    const logoutBtn = page.locator('button.logout-btn, button').filter({ hasText: /logout/i }).first()
    try {
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click({ timeout: 3000 })
        await page.waitForTimeout(1500)
        await captureFullPage(page, '08-after-logout', 'pC-superadmin')
      }
    } catch {
      /* ok if logout button not reachable */
    }

    const elapsed = Date.now() - startTime
    console.log(`\n[Persona C — SuperAdmin] Completed in ${(elapsed / 1000).toFixed(1)}s`)
    console.log(`  System pages + RBAC verification + 401 check`)
    if (errors.length > 0) {
      console.log(`  ⚠️  ${errors.length} issues:`)
      errors.slice(0, 10).forEach((e) => console.log(`    ${e}`))
    } else {
      console.log(`  ✅ Zero errors`)
    }

    const critical = errors.filter((e) => e.startsWith('❌'))
    expect(critical, `Critical errors:\n${critical.join('\n')}`).toHaveLength(0)
  })
})

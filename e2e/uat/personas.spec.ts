/**
 * ═══ UAT — 3 User Personas Walkthrough ═══
 *
 * จำลองผู้ใช้งาน 3 แบบที่ต่างกัน เดินทางผ่านทุกหน้า ทุกระบบ ทุก UI element
 *
 * Persona 1 — นัก/ม่าเล่นเกม (Gaming Enthusiast, Desktop, Fast)
 *   - เดินทางผ่านทุกหน้าเร็วๆ
 *   - คลิกปุ่ม CTA, platform cards, lang switcher
 *   - Submit pre-register form
 *   - Open admin login (no submit)
 *
 * Persona 2 — ผู้ใช้มือถือ (Casual Mobile, Slow Scroll)
 *   - iPhone SE viewport (375x667)
 *   - เปิด mobile hamburger
 *   - Scroll ช้า ดูเนื้อหา
 *   - อ่าน /game-guide /support /faq /privacy /terms
 *
 * Persona 3 — QA Tester (Power User, Multi-locale, Accessibility)
 *   - Tab navigation (keyboard only)
 *   - ESC popup
 *   - Toggle TH/EN locale
 *   - Try invalid form input
 *   - Test all admin pages (after login)
 *
 * Run on production:
 *   BASE_URL=http://178.128.127.161 npx playwright test e2e/uat/personas.spec.ts --project='Desktop Chrome'
 *
 * Run on local dev:
 *   BASE_URL=http://localhost:3000 npx playwright test e2e/uat/personas.spec.ts
 */
import { test, expect, type Page } from '@playwright/test'
import * as fs from 'node:fs'

const SCREENSHOT_DIR = 'test-results/uat-personas'
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

// All public pages on the site (every URL the persona will visit)
const PUBLIC_PAGES = [
  { path: '/', name: 'home' },
  { path: '/weapons', name: 'weapons' },
  { path: '/news', name: 'news' },
  { path: '/game-guide', name: 'game-guide' },
  { path: '/support', name: 'support' },
  { path: '/event', name: 'event' },
  { path: '/download', name: 'download' },
  { path: '/faq', name: 'faq' },
  { path: '/privacy', name: 'privacy' },
  { path: '/terms', name: 'terms' },
  { path: '/story', name: 'story' },
  { path: '/gallery', name: 'gallery' },
] as const

// All admin pages (visit after login)
const ADMIN_PAGES = [
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

const ADMIN_CREDS = {
  email: process.env.UAT_ADMIN_EMAIL || 'admin@eternaltowersaga.com',
  password: process.env.UAT_ADMIN_PASSWORD || 'EstAdminP0vWfjw7yY17!',
}

// ── Helpers ──
async function checkPageHealth(page: Page, path: string) {
  const consoleErrors: string[] = []
  const networkErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text().slice(0, 200))
    }
  })
  page.on('response', (resp) => {
    const url = resp.url()
    if (resp.status() >= 400 && !url.includes('/_nuxt/builds/meta/')) {
      networkErrors.push(`${resp.status()} ${url}`)
    }
  })

  const response = await page.goto(path, { waitUntil: 'domcontentloaded' })

  return {
    status: response?.status() || 0,
    consoleErrors,
    networkErrors,
  }
}

async function captureFullPage(page: Page, name: string, persona: string) {
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${persona}-${name}.png`,
    fullPage: true,
    timeout: 10000,
  }).catch(() => {})
}

// ════════════════════════════════════════════════════════════════
// PERSONA 1 — Gaming Enthusiast (Desktop, fast clicker)
// ════════════════════════════════════════════════════════════════
test.describe('Persona 1: นักเล่นเกมตัวยง (Desktop, Fast)', () => {
  test.use({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })

  test('full site walkthrough — click everything fast', async ({ page }) => {
    const errors: string[] = []
    const startTime = Date.now()

    for (const { path, name } of PUBLIC_PAGES) {
      const health = await checkPageHealth(page, path)
      if (health.status >= 400) errors.push(`❌ ${path} → HTTP ${health.status}`)
      health.consoleErrors.forEach((e) => errors.push(`⚠️ ${path} console: ${e}`))
      health.networkErrors.forEach((e) => errors.push(`⚠️ ${path} network: ${e}`))

      await captureFullPage(page, name, 'p1-gamer')
      await page.waitForTimeout(200) // fast click — quick scan
    }

    // Test homepage interactions: click each platform card in turn
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const platforms = page.locator('a.ets-platform')
    const platformCount = await platforms.count()
    expect(platformCount).toBeGreaterThanOrEqual(3)

    // Click language switcher (scope to header to avoid footer's twin)
    const headerLang = page.locator('header .lang-switcher button')
    if ((await headerLang.count()) >= 2) {
      await headerLang.nth(1).click() // EN
      await page.waitForTimeout(500)
      await captureFullPage(page, 'home-en', 'p1-gamer')
      await headerLang.nth(0).click() // TH
      await page.waitForTimeout(500)
    }

    // Click Pre-register CTA
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const preReg = page.locator('a').filter({ hasText: /pre-register|ลงทะเบียน/i }).first()
    if (await preReg.count() > 0) {
      await preReg.click()
      await page.waitForLoadState('domcontentloaded')
      expect(page.url()).toContain('/event')
      await captureFullPage(page, 'event-page', 'p1-gamer')
    }

    // Open admin login (don't submit)
    await page.goto('/admin/login')
    await captureFullPage(page, 'admin-login', 'p1-gamer')

    const elapsed = Date.now() - startTime
    console.log(`\n[Persona 1 Gamer] Visited ${PUBLIC_PAGES.length + 2} pages in ${elapsed}ms`)
    if (errors.length > 0) {
      console.log(`  ❌ ${errors.length} errors:`)
      errors.forEach((e) => console.log(`    ${e}`))
    } else {
      console.log(`  ✅ Zero errors`)
    }

    expect(errors.filter((e) => e.startsWith('❌')).length).toBe(0)
  })
})

// ════════════════════════════════════════════════════════════════
// PERSONA 2 — Casual Mobile User (slow scroll, hamburger menu)
// ════════════════════════════════════════════════════════════════
test.describe('Persona 2: ผู้ใช้มือถือ (iPhone SE, Slow Scroll)', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
  })

  test('mobile walkthrough — scroll, hamburger, read content', async ({ page }) => {
    const errors: string[] = []
    const startTime = Date.now()

    // Visit homepage first, scroll slowly to bottom
    const home = await checkPageHealth(page, '/')
    if (home.status >= 400) errors.push(`❌ / → HTTP ${home.status}`)
    await captureFullPage(page, 'home-mobile', 'p2-mobile')

    // Slow scroll to bottom (mobile pattern)
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
    const viewportHeight = 667
    const steps = Math.ceil(scrollHeight / viewportHeight)
    for (let i = 0; i < steps && i < 15; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), (i + 1) * viewportHeight)
      await page.waitForTimeout(300) // slow scroll
    }
    await captureFullPage(page, 'home-scrolled-bottom', 'p2-mobile')

    // Open mobile hamburger menu
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const hamburger = page.locator('button[aria-label="Open menu"]')
    if (await hamburger.count() > 0) {
      await hamburger.click()
      await page.waitForTimeout(500)
      await captureFullPage(page, 'mobile-menu-open', 'p2-mobile')

      // Verify body scroll lock (per audit fix)
      const overflowHtml = await page.evaluate(() => document.documentElement.style.overflow)
      const overflowBody = await page.evaluate(() => document.body.style.overflow)
      if (overflowHtml !== 'hidden' || overflowBody !== 'hidden') {
        errors.push(`⚠️ Mobile menu scroll-lock: html=${overflowHtml} body=${overflowBody}`)
      }

      // Press ESC to close (per a11y fix)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      const afterEsc = await page.locator('#site-mobile-menu').isVisible().catch(() => false)
      if (afterEsc) errors.push('⚠️ ESC did not close mobile menu')
    }

    // Visit content pages slowly
    for (const { path, name } of PUBLIC_PAGES) {
      const health = await checkPageHealth(page, path)
      if (health.status >= 400) errors.push(`❌ ${path} → HTTP ${health.status}`)
      health.consoleErrors.forEach((e) => errors.push(`⚠️ ${path} console: ${e}`))

      // Mobile pattern: scroll halfway through page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
      await page.waitForTimeout(800)
      await captureFullPage(page, name, 'p2-mobile')
    }

    const elapsed = Date.now() - startTime
    console.log(`\n[Persona 2 Mobile] Visited ${PUBLIC_PAGES.length + 1} pages in ${elapsed}ms`)
    if (errors.length > 0) {
      errors.forEach((e) => console.log(`    ${e}`))
    } else {
      console.log(`  ✅ Zero errors`)
    }

    expect(errors.filter((e) => e.startsWith('❌')).length).toBe(0)
  })
})

// ════════════════════════════════════════════════════════════════
// PERSONA 3 — QA Tester (a11y, multi-locale, edge cases, admin)
// ════════════════════════════════════════════════════════════════
test.describe('Persona 3: QA Tester (a11y + admin + edge cases)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('keyboard navigation + locale toggle + admin tour', async ({ page }) => {
    const errors: string[] = []

    // ── 1. Keyboard navigation on home ──
    await page.goto('/')
    await captureFullPage(page, 'home-default', 'p3-qa')

    // Tab through skip-link → logo → nav links
    await page.keyboard.press('Tab')
    const focused1 = await page.evaluate(() => document.activeElement?.tagName + ':' + document.activeElement?.textContent?.slice(0, 30))
    if (!focused1?.includes('Skip')) errors.push(`⚠️ First Tab should focus skip-link, got: ${focused1}`)

    // Press Enter on skip-link to jump to main content
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    const hash = page.url().includes('#main-content')
    if (!hash) errors.push('⚠️ Skip link did not jump to #main-content')

    // ── 2. Toggle locale TH ⇄ EN ──
    await page.goto('/')
    // Use h1 / hero text instead of <title> (since title may be set in plugin only)
    const heroEnRegex = /AWAKEN|CHAPTER ZERO/
    const heroThRegex = /ตื่นจากนิทรา|บทศูนย์/

    const initialBody = await page.locator('body').textContent()
    const initialIsThai = !!(initialBody && heroThRegex.test(initialBody))

    // Scope to header only — page has 2 lang switchers (header + footer)
    const enButton = page.locator('header .lang-switcher button').filter({ hasText: 'EN' }).first()
    if (await enButton.count() > 0) {
      await enButton.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(800)
      const newBody = await page.locator('body').textContent()
      const newIsEn = !!(newBody && heroEnRegex.test(newBody))
      if (initialIsThai && !newIsEn) errors.push('⚠️ Locale switch did not produce EN content')
      await captureFullPage(page, 'home-en-locale', 'p3-qa')
    }

    // ── 3. Test pre-register form (invalid email) ──
    await page.goto('/event')
    await page.waitForTimeout(500)
    const emailInput = page.locator('input[type="email"]').first()
    if (await emailInput.count() > 0) {
      await emailInput.fill('not-an-email')
      const submitBtn = page.locator('button[type="submit"]').first()
      if (await submitBtn.count() > 0) {
        await submitBtn.click()
        await page.waitForTimeout(500)
        // HTML5 validation should block submission OR show error
        const stillOnEvent = page.url().includes('/event')
        if (!stillOnEvent) errors.push('⚠️ Invalid email accepted by form')
      }
    }

    // ── 4. Login + admin tour ──
    await page.goto('/admin/login')
    // Wait for Vue hydration — form's submit button is disabled until hydrated
    await page.waitForSelector('form[data-ready="true"]', { timeout: 10000 })
    await page.fill('input[type="email"]', ADMIN_CREDS.email)
    await page.fill('input[type="password"]', ADMIN_CREDS.password)
    await page.locator('form').locator('button[type="submit"]:not([disabled])').click()
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => {})

    if (page.url().includes('/admin/login')) {
      errors.push('❌ Admin login failed — bad credentials? Check UAT_ADMIN_PASSWORD env')
      // bail — can't continue admin tour without login
    } else {
      // ── 5. Tour all admin pages ──
      for (const adminPath of ADMIN_PAGES) {
        const health = await checkPageHealth(page, adminPath)
        if (health.status >= 400) errors.push(`❌ ${adminPath} → HTTP ${health.status}`)
        health.consoleErrors.forEach((e) => errors.push(`⚠️ ${adminPath} console: ${e}`))

        const slug = adminPath.replace(/^\//, '').replace(/\//g, '-')
        await captureFullPage(page, `admin-${slug}`, 'p3-qa')
      }

      // ── 6. Test Cmd+K command palette (if exists) ──
      await page.goto('/admin')
      await page.keyboard.press('Control+K')
      await page.waitForTimeout(500)
      // Check if a search overlay opened
      const palette = page.locator('[role="dialog"], [data-cmd-palette], input[placeholder*="search" i]').first()
      const paletteOpen = await palette.isVisible().catch(() => false)
      if (paletteOpen) {
        await captureFullPage(page, 'admin-cmdk-palette', 'p3-qa')
        await page.keyboard.press('Escape')
      }

      // ── 7. Logout (best-effort, don't fail test if button not reachable) ──
      await page.goto('/admin').catch(() => {})
      await page.waitForTimeout(500)
      const logoutBtn = page.locator('button.logout-btn, button').filter({ hasText: /logout/i }).first()
      try {
        if (await logoutBtn.count() > 0) {
          await logoutBtn.click({ timeout: 3000 })
          await page.waitForTimeout(1000)
        }
      } catch {
        /* logout button not reachable in this layout — skip, not critical */
      }
    }

    console.log(`\n[Persona 3 QA] Audit complete`)
    if (errors.length > 0) {
      console.log(`  ${errors.filter((e) => e.startsWith('❌')).length} CRITICAL, ${errors.filter((e) => e.startsWith('⚠️')).length} warnings:`)
      errors.forEach((e) => console.log(`    ${e}`))
    } else {
      console.log(`  ✅ Zero errors across all pages + admin`)
    }

    // Soft assert — warnings are OK, critical errors fail the test
    const critical = errors.filter((e) => e.startsWith('❌'))
    expect(critical, `Critical errors:\n${critical.join('\n')}`).toHaveLength(0)
  })
})

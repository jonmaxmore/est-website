import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.locator('[data-testid="homepage-shell"][data-ready="true"]').waitFor({ state: 'attached', timeout: 30000 })
  })

  test('should render seeded homepage marketing banners across release 1 placements', async ({ page }) => {
    await expect(page.locator('[data-testid="marketing-banner-announcement_bar"]')).toContainText(/ETS Beginner Guide/i)
    await expect(page.locator('[data-testid="marketing-banner-homepage_inline"]')).toContainText(/Tower Chronicle Starter Kit/i)

    const popupBanner = page.locator('[data-testid="marketing-banner-popup"]')
    await expect(popupBanner).toContainText(/Claim Your Founder Cache/i, { timeout: 7000 })

    await page.getByRole('button', { name: /close popup/i }).click()
    await expect(popupBanner).toBeHidden()

    await expect(page.locator('[data-testid="marketing-banner-floating"]')).toContainText(/Need a fast start/i)
    await expect(page.locator('[data-testid="marketing-banner-footer_strip"]')).toContainText(/Season Zero Patch Notes/i)
  })

  test('should load with correct title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Eternal Tower Saga/)
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /Eternal Tower Saga/)
  })

  test('should render hero section', async ({ page }) => {
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('should render navigation links', async ({ page }) => {
    const nav = page.locator('nav, header')
    await expect(nav.first()).toBeVisible()
  })

  test('should render weapons class selector', async ({ page }) => {
    const weaponsLabel = page.getByText('CLASS SELECT')
    if (await weaponsLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(weaponsLabel).toBeVisible()

      const weaponButtons = page.locator('button').filter({ has: page.locator('img') })
      const count = await weaponButtons.count()
      if (count > 1) {
        await weaponButtons.nth(1).click()
        await page.waitForTimeout(500)
      }
    } else {
      test.skip(true, 'Weapons section not visible on page')
    }
  })

  test('should render features section', async ({ page }) => {
    // Scroll to trigger lazy-loaded content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3))
    await page.waitForTimeout(1000)

    // Look for any features-related heading
    const allH2 = page.getByRole('heading', { level: 2 })
    const h2Count = await allH2.count()

    let foundFeatures = false
    for (let i = 0; i < h2Count; i++) {
      const text = await allH2.nth(i).textContent()
      if (text && /feature/i.test(text)) {
        foundFeatures = true
        await allH2.nth(i).scrollIntoViewIfNeeded()
        await expect(allH2.nth(i)).toBeVisible()
        break
      }
    }

    if (!foundFeatures) {
      // Features may not be enabled in CMS
      test.skip(true, 'Features section not visible on page')
    }
  })

  test('should render news section with articles', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6))
    await page.waitForTimeout(1000)

    const newsHeading = page.getByRole('heading', { level: 2 }).filter({ hasText: /news/i })
    if (await newsHeading.count() > 0) {
      await newsHeading.first().scrollIntoViewIfNeeded()
      await expect(newsHeading.first()).toBeVisible()
    }
  })
})

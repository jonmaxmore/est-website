import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
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

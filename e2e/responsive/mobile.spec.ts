import { test, expect } from '@playwright/test'

test.describe('Responsive / Mobile', () => {
  test('homepage should not have horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth
    })

    expect(overflow).toBeLessThanOrEqual(5)
  })

  test('mobile navigation should be accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const nav = page.locator('nav, header')
    await expect(nav.first()).toBeVisible()

    const menuButton = page.locator([
      'button[aria-label*="menu" i]',
      'button[aria-label*="Menu" i]',
      '[class*="hamburger"]',
      '[class*="mobile-menu"]',
      'header button',
      'nav button',
    ].join(', '))

    const hasMenu = await menuButton.count()
    if (hasMenu > 0) {
      await menuButton.first().click()
      await page.waitForTimeout(500)
    }
    expect(await nav.count()).toBeGreaterThan(0)
  })

  test('event page form should be usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/event', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    // Email input should be visible and fillable
    const emailInput = page.locator('input[type="email"]')
    if (await emailInput.count() > 0) {
      await emailInput.scrollIntoViewIfNeeded()
      await expect(emailInput).toBeVisible()
      // Check the input is wide enough to be usable
      const box = await emailInput.boundingBox()
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(200)
        expect(box.height).toBeGreaterThanOrEqual(30)
      }
    }
  })

  test('text should be readable on mobile (no tiny fonts)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const bodyFontSize = await page.evaluate(() => {
      const body = document.querySelector('body')
      if (!body) return '16px'
      return window.getComputedStyle(body).fontSize
    })

    const size = parseInt(bodyFontSize)
    expect(size).toBeGreaterThanOrEqual(12)
  })

  test('images should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const overflowingImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img')
      const viewportWidth = window.innerWidth
      let overflowing = 0
      images.forEach((img) => {
        const rect = img.getBoundingClientRect()
        if (rect.width > 0 && rect.right > viewportWidth + 5) {
          overflowing++
        }
      })
      return overflowing
    })

    expect(overflowingImages).toBe(0)
  })
})

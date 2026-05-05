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

    const menuButton = page.getByRole('button', { name: /open menu|close menu/i })

    const hasMenu = await menuButton.count()
    if (hasMenu > 0) {
      await expect(menuButton.first()).toBeVisible()
      await menuButton.first().click()
      await page.waitForTimeout(500)
    }
    expect(await nav.count()).toBeGreaterThan(0)
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

import { test } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://178.128.127.161'

test('full homepage review — full-page screenshot + section audit', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // Dismiss any popup/floating banners that block view
  const popupClose = page.locator('[role="dialog"] button[aria-label*="lose"], [role="dialog"] button:has-text("X")')
  if (await popupClose.count() > 0) {
    await popupClose.first().click().catch(() => {})
    await page.waitForTimeout(500)
  }

  // Full page screenshot at desktop
  await page.screenshot({
    path: 'test-results/homepage-full-1920.png',
    fullPage: true,
  })

  // Mobile view
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(500)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({
    path: 'test-results/homepage-full-mobile.png',
    fullPage: true,
  })

  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.waitForTimeout(500)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({
    path: 'test-results/homepage-full-tablet.png',
    fullPage: true,
  })

  // Desktop again — section by section
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const audit = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, [data-screen-label]'))
    return sections.map((s) => {
      const r = (s as HTMLElement).getBoundingClientRect()
      const computed = getComputedStyle(s as HTMLElement)
      return {
        id: (s as HTMLElement).id || '',
        label: (s as HTMLElement).dataset.screenLabel || (s as HTMLElement).getAttribute('data-testid') || '',
        height: Math.round(r.height),
        bg: computed.backgroundColor,
        textPreview: ((s as HTMLElement).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      }
    })
  })

  console.log('=== Sections audit ===')
  for (const s of audit) {
    console.log(`${s.label || s.id || '?'} | h=${s.height} | bg=${s.bg}`)
    console.log(`  text: ${s.textPreview}`)
  }

  // Check banners visible on screen
  const banners = await page.evaluate(() => {
    const bs = Array.from(document.querySelectorAll('[data-testid*="banner"]'))
    return bs.map((b) => {
      const r = (b as HTMLElement).getBoundingClientRect()
      return {
        testid: (b as HTMLElement).dataset.testid,
        visible: r.width > 0 && r.height > 0,
        position: getComputedStyle(b as HTMLElement).position,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      }
    })
  })

  console.log('=== Banners ===')
  for (const b of banners) console.log(JSON.stringify(b))
})

import { test } from '@playwright/test'

test('inspect hero-to-weapons transition', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('http://178.128.127.161/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const heroBox = await page.locator('section').first().boundingBox()
  const weaponsBox = await page.locator('section#weapons').boundingBox()

  console.log('Hero:', JSON.stringify(heroBox))
  console.log('Weapons:', JSON.stringify(weaponsBox))
  if (heroBox && weaponsBox) {
    console.log('Gap between hero end and weapons start:', weaponsBox.y - (heroBox.y + heroBox.height))
  }

  if (heroBox) {
    await page.evaluate((y: number) => window.scrollTo({ top: y, behavior: 'auto' }), heroBox.y + heroBox.height - 600)
    await page.waitForTimeout(500)

    await page.screenshot({
      path: 'test-results/strip-inspect-full.png',
      fullPage: false,
    })
  }

  const domAtBoundary = await page.evaluate(() => {
    const hero = document.querySelector('section') as HTMLElement
    const weapons = document.getElementById('weapons') as HTMLElement
    if (!hero || !weapons) return { error: 'sections not found' }

    const heroRect = hero.getBoundingClientRect()
    const weaponsRect = weapons.getBoundingClientRect()

    const heroBottomAbs = heroRect.bottom + window.scrollY
    const weaponsTopAbs = weaponsRect.top + window.scrollY

    const allElements: Array<{ tag: string; id: string; classes: string; top: number; height: number; text: string }> = []
    document.querySelectorAll('body *').forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect()
      const elTop = r.top + window.scrollY
      const elBottom = r.bottom + window.scrollY
      if (elTop >= heroBottomAbs - 20 && elTop < weaponsTopAbs + 100 && r.height > 0 && r.width > 50) {
        allElements.push({
          tag: el.tagName,
          id: (el as HTMLElement).id || '',
          classes: ((el as HTMLElement).className?.toString() || '').slice(0, 100),
          top: elTop,
          height: r.height,
          text: (el.textContent || '').trim().slice(0, 60),
        })
      }
    })

    return {
      heroBottom: heroBottomAbs,
      weaponsTop: weaponsTopAbs,
      gap: weaponsTopAbs - heroBottomAbs,
      elementsInGap: allElements.slice(0, 25),
    }
  })

  console.log('DOM at boundary:', JSON.stringify(domAtBoundary, null, 2))
})

/**
 * Carpet test — exercises every admin CRUD module + public surface
 * to verify the system after the mock-data wipe + upload fix deploy.
 */
import { expect, test } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://178.128.127.161'
const EMAIL = process.env.UAT_ADMIN_EMAIL || 'admin@eternaltowersaga.com'
const PASSWORD = process.env.UAT_ADMIN_PASSWORD || ''

test.describe.serial('full system carpet test', () => {
  let cookieHeader = ''
  const created: { type: string; id: string | number }[] = []

  test.beforeAll(async ({ request }) => {
    const login = await request.post(BASE + '/api/auth/login', {
      data: { email: EMAIL, password: PASSWORD },
    })
    expect(login.status()).toBe(200)
    const setCookie = login.headers()['set-cookie'] || ''
    cookieHeader = setCookie.split(',').map((c) => c.split(';')[0]).join('; ')
    expect(cookieHeader).toContain('nuxt-session')
  })

  test('1. admin login + RBAC', async ({ request }) => {
    const noAuth = await request.get(BASE + '/api/admin/stats')
    expect(noAuth.status()).toBe(401)
    const withAuth = await request.get(BASE + '/api/admin/stats', { headers: { cookie: cookieHeader } })
    expect(withAuth.status()).toBe(200)
    const stats = await withAuth.json()
    console.log('✅ stats:', JSON.stringify(stats.counts))
  })

  test('2. media upload + serve', async ({ request }) => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQAAAAA3bvkkAAAAC0lEQVR42mNkAAEAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
    const uploadResp = await request.post(BASE + '/api/admin/media/upload', {
      headers: { cookie: cookieHeader },
      multipart: { file: { name: 'carpet-test.png', mimeType: 'image/png', buffer: png } },
    })
    expect(uploadResp.status()).toBe(200)
    const [asset] = await uploadResp.json()
    expect(asset.url).toMatch(/\/uploads\/[a-f0-9-]+\.png$/)
    created.push({ type: 'media', id: asset.id })

    const fileResp = await request.get(BASE + asset.url)
    expect(fileResp.status()).toBe(200)
    expect(fileResp.headers()['content-type']).toBe('image/png')
    console.log('✅ upload + serve:', asset.url)
  })

  test('3. weapons CRUD', async ({ request }) => {
    const create = await request.post(BASE + '/api/admin/weapons', {
      headers: { cookie: cookieHeader },
      data: { name: 'Carpet Sword', sortOrder: 0, statSTR: 50, statINT: 30, statAGI: 40, statDEX: 60, statHP: 70 },
    })
    expect(create.status(), `weapons POST: ${await create.text()}`).toBeLessThan(300)
    const w = await create.json()
    created.push({ type: 'weapon', id: w.id })
    console.log('✅ weapon created:', w.name)
  })

  test('4. news CRUD', async ({ request }) => {
    const create = await request.post(BASE + '/api/admin/news', {
      headers: { cookie: cookieHeader },
      data: {
        slug: 'carpet-test-' + Date.now(),
        titleEn: 'Carpet Test', titleTh: 'ทดสอบ',
        contentEn: '<p>x</p>', contentTh: '<p>x</p>',
        category: 'ANNOUNCEMENT',
      },
    })
    expect(create.status(), `news POST: ${await create.text()}`).toBeLessThan(300)
    const a = await create.json()
    created.push({ type: 'news', id: a.id })
    console.log('✅ news created id=', a.id)
  })

  test('5. milestone CRUD', async ({ request }) => {
    const create = await request.post(BASE + '/api/admin/milestones', {
      headers: { cookie: cookieHeader },
      data: { tier: 1, targetCount: 10000, rewardEn: 'Test', rewardTh: 'ทดสอบ' },
    })
    expect(create.status(), `milestones POST: ${await create.text()}`).toBeLessThan(300)
    const m = await create.json()
    created.push({ type: 'milestone', id: m.id })
    console.log('✅ milestone created id=', m.id)
  })

  test('6. feature CRUD', async ({ request }) => {
    const create = await request.post(BASE + '/api/admin/features', {
      headers: { cookie: cookieHeader },
      data: { key: 'carpet-feat-' + Date.now(), titleEn: 'Test Feature', titleTh: 'ทดสอบ' },
    })
    expect(create.status(), `features POST: ${await create.text()}`).toBeLessThan(300)
    const f = await create.json()
    created.push({ type: 'feature', id: f.id })
    console.log('✅ feature created id=', f.id)
  })

  test('7. highlight CRUD', async ({ request }) => {
    const create = await request.post(BASE + '/api/admin/highlights', {
      headers: { cookie: cookieHeader },
      data: { key: 'carpet-hl-' + Date.now(), titleEn: 'Test Highlight', titleTh: 'ทดสอบ' },
    })
    expect(create.status(), `highlights POST: ${await create.text()}`).toBeLessThan(300)
    const h = await create.json()
    created.push({ type: 'highlight', id: h.id })
    console.log('✅ highlight created id=', h.id)
  })

  test('8. event CRUD', async ({ request }) => {
    const create = await request.post(BASE + '/api/admin/events', {
      headers: { cookie: cookieHeader },
      data: {
        titleEn: 'Test Event', titleTh: 'ทดสอบ',
        type: 'EVENT',
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    })
    expect(create.status(), `events POST: ${await create.text()}`).toBeLessThan(300)
    const ev = await create.json()
    created.push({ type: 'event', id: ev.id })
    console.log('✅ event created id=', ev.id)
  })

  test('9. banner CRUD', async ({ request }) => {
    const create = await request.post(BASE + '/api/admin/banners', {
      headers: { cookie: cookieHeader },
      data: {
        placement: 'announcement_bar', scope: 'global',
        priority: 50,
        titleEn: 'Carpet', titleTh: 'ทดสอบ',
        targetType: 'url', targetUrl: '/',
      },
    })
    expect(create.status(), `banners POST: ${await create.text()}`).toBeLessThan(300)
    const b = await create.json()
    created.push({ type: 'banner', id: b.id })
    console.log('✅ banner created id=', b.id)
  })

  test('10. public APIs respond', async ({ request }) => {
    const endpoints = ['/api/public/sections', '/api/public/weapons', '/api/public/news', '/api/public/features', '/api/public/highlights', '/api/public/site', '/api/public/stats']
    for (const ep of endpoints) {
      const r = await request.get(BASE + ep)
      expect(r.status(), ep).toBe(200)
    }
    console.log('✅ public APIs respond:', endpoints.length)
  })

  test('11. homepage SSR', async ({ page }) => {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    const cta = page.locator('section#cta')
    await expect(cta).not.toContainText('cta.title')
    await expect(cta).not.toContainText('cta.preRegister')
    console.log('✅ homepage SSR clean')
  })

  test.afterAll(async ({ request }) => {
    const endpoints: Record<string, string> = {
      weapon: '/api/admin/weapons',
      news: '/api/admin/news',
      milestone: '/api/admin/milestones',
      feature: '/api/admin/features',
      highlight: '/api/admin/highlights',
      event: '/api/admin/events',
      banner: '/api/admin/banners',
      media: '/api/admin/media',
    }
    for (const item of created) {
      const url = `${BASE}${endpoints[item.type]}/${item.id}`
      const r = await request.delete(url, { headers: { cookie: cookieHeader } })
      console.log(`cleanup ${item.type} ${item.id}: ${r.status()}`)
    }
  })
})

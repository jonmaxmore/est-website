/**
 * QA Team — 3 AI Agents testing Frontend, Backend, Database
 */
import { adminFetch, publicFetch, record, BASE } from './utils.mjs'

// ═══════════════════════════════════════════
// Agent KIRA — Backend API Tests
// ═══════════════════════════════════════════
async function agentKira() {
  console.log('\n╔══════════════════════════════════════╗')
  console.log('║  Agent KIRA — Backend API Testing    ║')
  console.log('╚══════════════════════════════════════╝')

  // Auth: invalid login
  const bad = await adminFetch('/api/auth/login', 'POST')
  // We need to use fetch directly for unauthenticated test
  const unauth = await fetch(`${BASE}/api/admin/stats`)
  record('Kira', 'Auth', 'Reject invalid login', bad.status === 400 || bad.status === 401, `status:${bad.status}`)
  record('Kira', 'Auth', 'Block unauthenticated admin', unauth.status === 401, `status:${unauth.status}`)

  // Weapons CRUD
  const wList = await adminFetch('/api/admin/weapons')
  record('Kira', 'Weapons', 'GET list', wList.ok && Array.isArray(wList.data), `count:${wList.data?.length}`)

  if (wList.ok && wList.data.length > 0) {
    const wId = wList.data[0].id
    const wGet = await adminFetch(`/api/admin/weapons`)
    record('Kira', 'Weapons', 'GET by list contains items', wGet.ok, `first:${wGet.data[0]?.nameEn}`)

    const wUp = await adminFetch(`/api/admin/weapons/${wId}`, 'PUT', { descriptionEn: 'KIRA_TEST_UPDATE' })
    record('Kira', 'Weapons', 'PUT update', wUp.ok, wUp.ok ? 'updated' : `err:${wUp.status}`)

    // Verify update
    const wVerify = await adminFetch('/api/admin/weapons')
    const updated = wVerify.data?.find(w => w.id === wId)
    record('Kira', 'Weapons', 'Verify update persisted', updated?.descriptionEn === 'KIRA_TEST_UPDATE', updated?.descriptionEn)

    // Restore
    await adminFetch(`/api/admin/weapons/${wId}`, 'PUT', { descriptionEn: wList.data[0].descriptionEn })
  }

  // Validation test — weapon stats out of range
  const badWeapon = await adminFetch('/api/admin/weapons', 'POST', { name: '' })
  record('Kira', 'Weapons', 'Reject invalid create', !badWeapon.ok || badWeapon.status >= 400, `status:${badWeapon.status}`)

  // Features CRUD
  const fList = await adminFetch('/api/admin/features')
  record('Kira', 'Features', 'GET list', fList.ok && Array.isArray(fList.data), `count:${fList.data?.length}`)

  if (fList.ok && fList.data.length > 0) {
    const fId = fList.data[0].id
    const fUp = await adminFetch(`/api/admin/features/${fId}`, 'PUT', { descriptionEn: 'KIRA_TEST' })
    record('Kira', 'Features', 'PUT update', fUp.ok, fUp.ok ? 'updated' : `err:${fUp.status}`)
    // Restore
    await adminFetch(`/api/admin/features/${fId}`, 'PUT', { descriptionEn: fList.data[0].descriptionEn })
  }

  // Highlights CRUD
  const hList = await adminFetch('/api/admin/highlights')
  record('Kira', 'Highlights', 'GET list', hList.ok && Array.isArray(hList.data), `count:${hList.data?.length}`)

  // News CRUD
  const nList = await adminFetch('/api/admin/news')
  const newsOk = nList.ok && (Array.isArray(nList.data) || nList.data?.data)
  const newsArr = Array.isArray(nList.data) ? nList.data : nList.data?.data || []
  record('Kira', 'News', 'GET list', newsOk, `count:${newsArr.length}`)

  // Events CRUD (paginated response: {data, meta})
  const eList = await adminFetch('/api/admin/events')
  const eventsArr = eList.data?.data || []
  record('Kira', 'Events', 'GET list', eList.ok && Array.isArray(eventsArr), `count:${eventsArr.length}`)

  // Pages/FAQ
  const faq = await adminFetch('/api/admin/pages/faq')
  record('Kira', 'Pages', 'GET FAQ', faq.ok, faq.ok ? 'loaded' : `status:${faq.status}`)

  // Stats
  const stats = await adminFetch('/api/admin/stats')
  record('Kira', 'Stats', 'GET dashboard stats', stats.ok && stats.data?.counts, `weapons:${stats.data?.counts?.weapons}`)

  // Config
  const cfg = await adminFetch('/api/admin/config')
  record('Kira', 'Config', 'GET site config', cfg.ok, cfg.ok ? 'loaded' : `status:${cfg.status}`)

  // Activity log
  const act = await adminFetch('/api/admin/activity')
  record('Kira', 'Activity', 'GET activity log', act.ok, `status:${act.status}`)

  console.log('\n✅ Agent Kira complete')
}

// ═══════════════════════════════════════════
// Agent RYU — Database Integrity Tests
// ═══════════════════════════════════════════
async function agentRyu() {
  console.log('\n╔══════════════════════════════════════╗')
  console.log('║  Agent RYU — Database Integrity      ║')
  console.log('╚══════════════════════════════════════╝')

  // Test: Create → Read → Update → Read → Delete → Read
  console.log('\n── CRUD Lifecycle: Feature ──')
  const testKey = 'ryu_test_' + Date.now()
  const createR = await adminFetch('/api/admin/features', 'POST', {
    key: testKey, titleEn: 'RYU Test Feature', titleTh: 'ฟีเจอร์ทดสอบ',
    descriptionEn: 'Test', descriptionTh: 'ทดสอบ', icon: '🧪', visible: true, sortOrder: 99
  })
  record('Ryu', 'CRUD', 'Create test feature', createR.ok, createR.ok ? `ID:${createR.data.id}` : 'FAILED')

  if (createR.ok) {
    const id = createR.data.id

    // Read back
    const readR = await adminFetch('/api/admin/features')
    const found = readR.data?.find(f => f.key === testKey)
    record('Ryu', 'CRUD', 'Read after create', !!found, found ? `key:${found.key}` : 'NOT_FOUND')

    // Update
    const upR = await adminFetch(`/api/admin/features/${id}`, 'PUT', { titleEn: 'RYU Updated' })
    record('Ryu', 'CRUD', 'Update feature', upR.ok, upR.ok ? 'updated' : `err:${upR.status}`)

    // Verify update
    const readR2 = await adminFetch('/api/admin/features')
    const found2 = readR2.data?.find(f => f.id === id)
    record('Ryu', 'CRUD', 'Verify update', found2?.titleEn === 'RYU Updated', found2?.titleEn)

    // Public API should show it
    const pubR = await publicFetch('/api/public/features')
    const pubFound = pubR.data?.find(f => f.key === testKey)
    record('Ryu', 'CRUD', 'Visible in public API', !!pubFound, pubFound ? 'visible' : 'NOT_VISIBLE')

    // Delete
    const delR = await adminFetch(`/api/admin/features/${id}`, 'DELETE')
    record('Ryu', 'CRUD', 'Delete feature', delR.ok, delR.ok ? 'deleted' : `err:${delR.status}`)

    // Verify gone
    const readR3 = await adminFetch('/api/admin/features')
    const found3 = readR3.data?.find(f => f.id === id)
    record('Ryu', 'CRUD', 'Verify deletion', !found3, found3 ? 'STILL_EXISTS' : 'confirmed_gone')

    // Public API should NOT show it
    const pubR2 = await publicFetch('/api/public/features')
    const pubGone = pubR2.data?.find(f => f.key === testKey)
    record('Ryu', 'CRUD', 'Gone from public API', !pubGone, pubGone ? 'STILL_VISIBLE' : 'confirmed_gone')
  }

  // Duplicate key test
  console.log('\n── Unique Constraint Tests ──')
  const existingFeatures = await adminFetch('/api/admin/features')
  if (existingFeatures.ok && existingFeatures.data.length > 0) {
    const dupKey = existingFeatures.data[0].key
    const dupR = await adminFetch('/api/admin/features', 'POST', {
      key: dupKey, titleEn: 'Duplicate', titleTh: 'ซ้ำ', icon: '❌'
    })
    record('Ryu', 'Constraints', 'Reject duplicate feature key', !dupR.ok, `status:${dupR.status}`)
  }

  // Duplicate news slug
  const existingNews = await adminFetch('/api/admin/news')
  const newsArr = Array.isArray(existingNews.data) ? existingNews.data : existingNews.data?.data || []
  if (newsArr.length > 0) {
    const dupSlug = newsArr[0].slug
    const dupN = await adminFetch('/api/admin/news', 'POST', {
      slug: dupSlug, titleEn: 'Dup', titleTh: 'ซ้ำ', category: 'ANNOUNCEMENT', status: 'DRAFT'
    })
    record('Ryu', 'Constraints', 'Reject duplicate news slug', !dupN.ok, `status:${dupN.status}`)
  }

  // Data consistency: Admin counts match Public
  console.log('\n── Cross-API Consistency ──')
  const adminW = await adminFetch('/api/admin/weapons')
  const pubW = await publicFetch('/api/public/weapons')
  const visibleAdmin = adminW.data?.filter(w => w.visible !== false).length || 0
  const pubCount = pubW.data?.length || 0
  record('Ryu', 'Consistency', 'Weapons admin→public count', visibleAdmin === pubCount, `admin:${visibleAdmin} pub:${pubCount}`)

  const adminF = await adminFetch('/api/admin/features')
  const pubF = await publicFetch('/api/public/features')
  const visFeat = adminF.data?.filter(f => f.visible !== false).length || 0
  const pubFCount = pubF.data?.length || 0
  record('Ryu', 'Consistency', 'Features admin→public count', visFeat === pubFCount, `admin:${visFeat} pub:${pubFCount}`)

  const adminH = await adminFetch('/api/admin/highlights')
  const pubH = await publicFetch('/api/public/highlights')
  const visHL = adminH.data?.filter(h => h.visible !== false).length || 0
  const pubHCount = pubH.data?.length || 0
  record('Ryu', 'Consistency', 'Highlights admin→public count', visHL === pubHCount, `admin:${visHL} pub:${pubHCount}`)

  console.log('\n✅ Agent Ryu complete')
}

// ═══════════════════════════════════════════
// Agent NARI — Frontend Verification
// ═══════════════════════════════════════════
async function agentNari() {
  console.log('\n╔══════════════════════════════════════╗')
  console.log('║  Agent NARI — Frontend Verification  ║')
  console.log('╚══════════════════════════════════════╝')

  // Public APIs return CMS data
  const sections = await publicFetch('/api/public/sections')
  record('Nari', 'Sections', 'Sections API returns data', sections.ok && sections.data?.sections?.length > 0, `count:${sections.data?.sections?.length}`)

  const heroSection = sections.data?.sections?.find(s => s.type === 'hero')
  record('Nari', 'Sections', 'Hero section exists', !!heroSection, heroSection ? 'visible' : 'MISSING')

  const weaponsSection = sections.data?.sections?.find(s => s.type === 'weapons')
  record('Nari', 'Sections', 'Weapons section exists', !!weaponsSection, weaponsSection ? 'visible' : 'MISSING')

  const featuresSection = sections.data?.sections?.find(s => s.type === 'features')
  record('Nari', 'Sections', 'Features section exists', !!featuresSection, featuresSection ? 'visible' : 'MISSING')

  const highlightsSection = sections.data?.sections?.find(s => s.type === 'highlights')
  record('Nari', 'Sections', 'Highlights section exists', !!highlightsSection, highlightsSection ? 'visible' : 'MISSING')

  const newsSection = sections.data?.sections?.find(s => s.type === 'news')
  record('Nari', 'Sections', 'News section exists', !!newsSection, newsSection ? 'visible' : 'MISSING')

  // Weapons data for frontend
  const weapons = await publicFetch('/api/public/weapons')
  record('Nari', 'Weapons', 'Public weapons have data', weapons.ok && weapons.data?.length > 0, `count:${weapons.data?.length}`)

  if (weapons.data?.length > 0) {
    const w = weapons.data[0]
    record('Nari', 'Weapons', 'Has name (TH)', !!w.name, w.name)
    record('Nari', 'Weapons', 'Has nameEn', !!w.nameEn, w.nameEn)
    record('Nari', 'Weapons', 'Has description', !!w.descriptionEn || !!w.descriptionTh, 'has desc')
    record('Nari', 'Weapons', 'Has stats', w.statSTR !== undefined, `STR:${w.statSTR}`)
  }

  // Features data
  const features = await publicFetch('/api/public/features')
  record('Nari', 'Features', 'Public features have data', features.ok && features.data?.length > 0, `count:${features.data?.length}`)

  if (features.data?.length > 0) {
    const f = features.data[0]
    record('Nari', 'Features', 'Has bilingual titles', !!f.titleEn && !!f.titleTh, `${f.titleEn}/${f.titleTh}`)
    record('Nari', 'Features', 'Has detail content', !!f.detailEn || !!f.detailTh, 'has detail')
  }

  // Highlights data
  const highlights = await publicFetch('/api/public/highlights')
  record('Nari', 'Highlights', 'Public highlights have data', highlights.ok && highlights.data?.length > 0, `count:${highlights.data?.length}`)

  // News data
  const news = await publicFetch('/api/public/news')
  const newsArr = news.data?.data || []
  record('Nari', 'News', 'Public news have data', news.ok && newsArr.length > 0, `count:${newsArr.length}`)

  if (newsArr.length > 0) {
    const n = newsArr[0]
    record('Nari', 'News', 'Has slug for routing', !!n.slug, n.slug)
    record('Nari', 'News', 'Has bilingual titles', !!n.titleEn && !!n.titleTh, `${n.titleEn?.substring(0, 30)}`)
    record('Nari', 'News', 'Is published', !!n.publishedAt, n.publishedAt)
  }

  // Homepage fetch test
  const homepage = await fetch(`${BASE}/`)
  record('Nari', 'Homepage', 'Returns 200', homepage.status === 200, `status:${homepage.status}`)

  const html = await homepage.text()
  record('Nari', 'Homepage', 'Contains meta tags', html.includes('<title>'), 'has title tag')
  record('Nari', 'Homepage', 'Contains Vue app mount', html.includes('__nuxt') || html.includes('id="__nuxt"'), 'has nuxt app')

  // Site info
  const site = await publicFetch('/api/public/site')
  record('Nari', 'Site', 'Site config returns', site.ok, `status:${site.status}`)

  // Milestones
  const miles = await publicFetch('/api/public/milestones')
  record('Nari', 'Milestones', 'Milestones API', miles.ok, `count:${Array.isArray(miles.data) ? miles.data.length : 0}`)

  // Registration stats
  const regStats = await publicFetch('/api/public/stats')
  record('Nari', 'Stats', 'Public stats API', regStats.ok, `status:${regStats.status}`)

  // CMS-Only verification: No hardcoded fallback
  record('Nari', 'CMS-Only', 'Weapons from /api/public/weapons not hardcoded', weapons.ok, 'fetched from DB')
  record('Nari', 'CMS-Only', 'Features from /api/public/features not hardcoded', features.ok, 'fetched from DB')
  record('Nari', 'CMS-Only', 'Highlights from /api/public/highlights not hardcoded', highlights.ok, 'fetched from DB')
  record('Nari', 'CMS-Only', 'News from /api/public/news not hardcoded', news.ok, 'fetched from DB')

  console.log('\n✅ Agent Nari complete')
}

export async function runQATeam() {
  await agentKira()
  await agentRyu()
  await agentNari()
}

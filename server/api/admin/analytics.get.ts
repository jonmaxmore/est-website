/** Analytics dashboard stats */
export default defineEventHandler(async () => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [totalViews, todayViews, totalRegs, preRegisterSuccess, downloadClicks, socialClicks, newsClicks] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.preRegistration.count(),
    prisma.conversionEvent.count({ where: { eventName: 'pre_register_success' } }),
    prisma.conversionEvent.count({ where: { eventName: 'download_click' } }),
    prisma.conversionEvent.count({ where: { eventName: 'social_click' } }),
    prisma.conversionEvent.count({ where: { eventName: 'news_click' } }),
  ])

  // Unique visitors
  let uniqueVisitors = 0
  try {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(DISTINCT "visitorId") as count FROM page_views`
    uniqueVisitors = Number(result[0]?.count || 0)
  } catch (err) { console.warn('[Analytics] uniqueVisitors query failed:', (err as Error).message); uniqueVisitors = 0 }

  // Daily views (last 30 days)
  let dailyViews: { date: string; views: number }[] = []
  try {
    const rawDaily = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`SELECT DATE("createdAt") as date, COUNT(*) as count FROM page_views WHERE "createdAt" >= ${thirtyDaysAgo} GROUP BY DATE("createdAt") ORDER BY date`
    // Fill in missing days
    const dailyMap = new Map<string, number>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dailyMap.set(d.toISOString().slice(0, 10), 0)
    }
    rawDaily.forEach((r) => {
      dailyMap.set(String(r.date).slice(0, 10), Number(r.count))
    })
    dailyViews = [...dailyMap.entries()].sort().map(([date, views]) => ({ date, views }))
  } catch (err) { console.warn('[Analytics] dailyViews query failed:', (err as Error).message); dailyViews = [] }

  // Top pages
  let topPages: { path: string; views: number }[] = []
  try {
    const rawPages = await prisma.pageView.groupBy({
      by: ['path'],
      _count: { _all: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    })
    topPages = rawPages.map((p) => ({ path: p.path, views: p._count._all }))
  } catch (err) { console.warn('[Analytics] topPages query failed:', (err as Error).message); topPages = [] }

  // Conversions
  let conversions: { name: string; count: number }[] = []
  try {
    const rawConv = await prisma.conversionEvent.groupBy({
      by: ['eventName'],
      _count: { _all: true },
    })
    conversions = rawConv.map((c) => ({ name: c.eventName, count: c._count._all }))
  } catch (err) { console.warn('[Analytics] conversions query failed:', (err as Error).message); conversions = [] }

  const conversionRate = totalViews > 0 ? (totalRegs / totalViews) * 100 : 0

  let registrationsByPlatform: { platform: string; count: number }[] = []
  try {
    const rawPlatforms = await prisma.preRegistration.groupBy({
      by: ['platform'],
      _count: { _all: true },
      orderBy: { _count: { platform: 'desc' } },
    })
    registrationsByPlatform = rawPlatforms.map((row) => ({ platform: row.platform, count: row._count._all }))
  } catch (err) { console.warn('[Analytics] registrationsByPlatform query failed:', (err as Error).message); registrationsByPlatform = [] }

  return {
    totalViews,
    todayViews,
    uniqueVisitors,
    totalRegistrations: totalRegs,
    preRegisterSuccess,
    downloadClicks,
    socialClicks,
    newsClicks,
    conversionRate,
    dailyViews,
    topPages,
    conversions,
    registrationsByPlatform,
  }
})

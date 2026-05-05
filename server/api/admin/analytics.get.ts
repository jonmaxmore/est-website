/**
 * ═══ Analytics Dashboard API ═══
 * GET /api/admin/analytics
 *
 * รวบรวมสถิติการใช้งานเว็บไซต์ใน 30 วันล่าสุด:
 * - Total/Today page views, unique visitors (capped to 30-day window)
 * - กราฟรายวัน (30 วัน) พร้อมเติมวันที่ไม่มีข้อมูล = 0
 * - Top 10 หน้าที่เข้าชมมากที่สุด (in window)
 * - Conversion events: download, social, news
 *
 * ⚠️ ทุก query bound ที่ 30 วันเพื่อกัน table-scan, มี try/catch + structured
 *    log → คืน 0 แทน crash ถ้า table ขัดข้อง
 */
import { logger } from '../../utils/logger'

const log = logger.child({ scope: 'admin.analytics' })

async function safeAggregate<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    log.warn(`${label}.failed`, { reason: (err as Error).message })
    return fallback
  }
}

export default defineEventHandler(async () => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const windowFilter = { createdAt: { gte: thirtyDaysAgo } }
  const [totalViews, todayViews, downloadClicks, socialClicks, newsClicks] = await Promise.all([
    prisma.pageView.count({ where: windowFilter }),
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.conversionEvent.count({ where: { eventName: 'download_click', ...windowFilter } }),
    prisma.conversionEvent.count({ where: { eventName: 'social_click', ...windowFilter } }),
    prisma.conversionEvent.count({ where: { eventName: 'news_click', ...windowFilter } }),
  ])

  const uniqueVisitors = await safeAggregate('uniqueVisitors', 0, async () => {
    const result = await prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(DISTINCT "visitorId") as count FROM page_views WHERE "createdAt" >= ${thirtyDaysAgo}`
    return Number(result[0]?.count || 0)
  })

  const dailyViews = await safeAggregate<{ date: string; views: number }[]>('dailyViews', [], async () => {
    const rawDaily = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`SELECT DATE("createdAt") as date, COUNT(*) as count FROM page_views WHERE "createdAt" >= ${thirtyDaysAgo} GROUP BY DATE("createdAt") ORDER BY date`
    const dailyMap = new Map<string, number>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dailyMap.set(d.toISOString().slice(0, 10), 0)
    }
    rawDaily.forEach((r) => {
      dailyMap.set(String(r.date).slice(0, 10), Number(r.count))
    })
    return [...dailyMap.entries()].sort().map(([date, views]) => ({ date, views }))
  })

  const topPages = await safeAggregate<{ path: string; views: number }[]>('topPages', [], async () => {
    const rawPages = await prisma.pageView.groupBy({
      by: ['path'],
      where: windowFilter,
      _count: { _all: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    })
    return rawPages.map((p) => ({ path: p.path, views: p._count._all }))
  })

  const conversions = await safeAggregate<{ name: string; count: number }[]>('conversions', [], async () => {
    const rawConv = await prisma.conversionEvent.groupBy({
      by: ['eventName'],
      where: windowFilter,
      _count: { _all: true },
    })
    return rawConv.map((c) => ({ name: c.eventName, count: c._count._all }))
  })

  return {
    totalViews,
    todayViews,
    uniqueVisitors,
    downloadClicks,
    socialClicks,
    newsClicks,
    dailyViews,
    topPages,
    conversions,
  }
})

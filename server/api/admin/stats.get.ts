/**
 * ═══ Admin Dashboard Stats API ═══
 * GET /api/admin/stats
 *
 * รวบรวมสถิติทั้งหมดสำหรับหน้า Dashboard ในครั้งเดียว:
 * - นับข่าว, อาวุธ, ลงทะเบียน, สื่อ, highlight
 * - กราฟลงทะเบียนรายวัน (14 วัน)
 * - แบ่งตาม platform + region
 * - activity log + page views วันนี้
 *
 * ⚠️ บาง table (activityLog, pageView) เป็น optional
 *    ถ้า DB ยังไม่มี → คืน 0 แทนการ crash
 */
import { buildWebzineDashboardSummary } from '../../../app/shared/cms/admin-dashboard'

export default defineEventHandler(async () => {
  // ── ดึงข้อมูล 11 อย่างพร้อมกัน (เร็วกว่าทำทีละอย่าง) ──
  const [
    newsCount,
    publishedNewsCount,
    weaponCount,
    registrationCount,
    featureCount,
    highlightCount,
    mediaCount,
    recentRegistrations,
    recentNews,
    banners,
    articleAudit,
  ] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.weapon.count(),
    prisma.preRegistration.count(),
    prisma.feature.count(),
    prisma.highlight.count(),
    prisma.mediaAsset.count(),
    prisma.preRegistration.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, platform: true, region: true, createdAt: true },
    }),
    prisma.newsArticle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, titleEn: true, status: true, category: true, createdAt: true },
    }),
    prisma.marketingBanner.findMany({ select: { status: true, placement: true } }),
    prisma.newsArticle.findMany({ select: { status: true, primaryTopicKey: true, featuredImage: true } }),
  ])

  const platformStats = await prisma.preRegistration.groupBy({
    by: ['platform'],
    _count: { id: true },
  })

  const regionStats = await prisma.preRegistration.groupBy({
    by: ['region'],
    _count: { id: true },
  })

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // ── กราฟลงทะเบียนรายวัน 14 วันย้อนหลัง (raw SQL เพื่อ GROUP BY DATE) ──
  const dailyRegistrations = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`SELECT DATE("createdAt") as date, COUNT(*) as count FROM pre_registrations WHERE "createdAt" >= ${fourteenDaysAgo} GROUP BY DATE("createdAt") ORDER BY date`

  let recentActivity: Array<{ action: string; resource: string; userName: string; createdAt: Date }> = []
  try {
    recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { action: true, resource: true, userName: true, createdAt: true },
    })
  } catch (err) {
    // Some development databases may not have the optional audit table yet.
    console.warn('[Stats] activityLog query failed:', (err as Error).message)
  }

  let todayPageViews = 0
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    todayPageViews = await prisma.pageView.count({ where: { createdAt: { gte: todayStart } } })
  } catch (err) {
    // Analytics tables are optional during early CMS setup.
    console.warn('[Stats] pageView query failed:', (err as Error).message)
  }

  return {
    counts: {
      news: newsCount,
      publishedNews: publishedNewsCount,
      weapons: weaponCount,
      registrations: registrationCount,
      features: featureCount,
      highlights: highlightCount,
      media: mediaCount,
      todayPageViews,
    },
    platformStats: platformStats.map((s) => ({ platform: s.platform, count: s._count.id })),
    regionStats: regionStats.map((s) => ({ region: s.region, count: s._count.id })),
    dailyRegistrations: dailyRegistrations.map((d) => ({
      date: String(d.date),
      count: Number(d.count),
    })),
    recentRegistrations,
    recentNews,
    recentActivity,
    webzineSummary: buildWebzineDashboardSummary({ banners, articles: articleAudit }),
  }
})

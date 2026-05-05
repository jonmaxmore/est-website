/**
 * ═══ Admin Dashboard Stats API ═══
 * GET /api/admin/stats
 *
 * รวบรวมสถิติทั้งหมดสำหรับหน้า Dashboard ในครั้งเดียว:
 * - นับข่าว, อาวุธ, สื่อ, highlight
 * - activity log + page views วันนี้
 *
 * ⚠️ บาง table (activityLog, pageView) เป็น optional
 *    ถ้า DB ยังไม่มี → คืน 0 แทนการ crash
 */
import { buildWebzineDashboardSummary } from '../../../app/shared/cms/admin-dashboard'

export default defineEventHandler(async () => {
  const [
    newsCount,
    publishedNewsCount,
    weaponCount,
    featureCount,
    highlightCount,
    mediaCount,
    recentNews,
    banners,
    articleAudit,
  ] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.weapon.count(),
    prisma.feature.count(),
    prisma.highlight.count(),
    prisma.mediaAsset.count(),
    prisma.newsArticle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, titleEn: true, status: true, category: true, createdAt: true },
    }),
    prisma.marketingBanner.findMany({ select: { status: true, placement: true } }),
    prisma.newsArticle.findMany({ select: { status: true, primaryTopicKey: true, featuredImage: true } }),
  ])

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
      features: featureCount,
      highlights: highlightCount,
      media: mediaCount,
      todayPageViews,
    },
    recentNews,
    recentActivity,
    webzineSummary: buildWebzineDashboardSummary({ banners, articles: articleAudit }),
  }
})

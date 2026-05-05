/**
 * ═══ Admin Dashboard Stats API ═══
 * GET /api/admin/stats
 *
 * รวบรวมสถิติทั้งหมดสำหรับหน้า Dashboard ในครั้งเดียว — ใช้ aggregate counts
 * แทน findMany ทั้ง table เพื่อกัน table-scan เมื่อ content โต
 *
 * ⚠️ บาง table (activityLog, pageView) เป็น optional ถ้ายังไม่มี → คืน 0
 */
import { logger } from '../../utils/logger'

const log = logger.child({ scope: 'admin.stats' })

export default defineEventHandler(async () => {
  const [
    newsCount,
    publishedNewsCount,
    draftNewsCount,
    articlesMissingTopic,
    articlesMissingFeaturedImage,
    weaponCount,
    featureCount,
    highlightCount,
    mediaCount,
    recentNews,
    liveBanners,
    scheduledBanners,
  ] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.newsArticle.count({ where: { status: 'DRAFT' } }),
    prisma.newsArticle.count({ where: { primaryTopicKey: null } }),
    prisma.newsArticle.count({ where: { featuredImage: null } }),
    prisma.weapon.count(),
    prisma.feature.count(),
    prisma.highlight.count(),
    prisma.mediaAsset.count(),
    prisma.newsArticle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, titleEn: true, status: true, category: true, createdAt: true },
    }),
    prisma.marketingBanner.count({ where: { status: 'LIVE' } }),
    prisma.marketingBanner.count({ where: { status: 'SCHEDULED' } }),
  ])

  let recentActivity: Array<{ action: string; resource: string; userName: string; createdAt: Date }> = []
  try {
    recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { action: true, resource: true, userName: true, createdAt: true },
    })
  } catch (err) {
    log.warn('activityLog.failed', { reason: (err as Error).message })
  }

  let todayPageViews = 0
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    todayPageViews = await prisma.pageView.count({ where: { createdAt: { gte: todayStart } } })
  } catch (err) {
    log.warn('pageView.failed', { reason: (err as Error).message })
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
    webzineSummary: {
      liveBanners,
      scheduledBanners,
      draftArticles: draftNewsCount,
      articlesMissingTopic,
      articlesMissingFeaturedImage,
    },
  }
})

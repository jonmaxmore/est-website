import { buildWebzineDashboardSummary } from '../../../app/shared/cms/admin-dashboard'

/** Dashboard stats: aggregated counts, recent activity, and CMS queues. */
export default defineEventHandler(async () => {
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

  const dailyRegistrations = await prisma.$queryRawUnsafe<Array<{ date: string; count: bigint }>>(
    `SELECT DATE("createdAt") as date, COUNT(*) as count FROM pre_registrations WHERE "createdAt" >= $1 GROUP BY DATE("createdAt") ORDER BY date`,
    fourteenDaysAgo,
  )

  let recentActivity: Array<{ action: string; resource: string; userName: string; createdAt: Date }> = []
  try {
    recentActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { action: true, resource: true, userName: true, createdAt: true },
    })
  } catch {
    // Some development databases may not have the optional audit table yet.
  }

  let todayPageViews = 0
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    todayPageViews = await prisma.pageView.count({ where: { createdAt: { gte: todayStart } } })
  } catch {
    // Analytics tables are optional during early CMS setup.
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

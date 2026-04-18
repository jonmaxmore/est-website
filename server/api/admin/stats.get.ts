/** Dashboard stats — aggregated counts + recent activity */
export default defineEventHandler(async () => {
  const [
    newsCount,
    publishedNewsCount,
    weaponCount,
    registrationCount,
    recentRegistrations,
    recentNews,
  ] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.weapon.count(),
    prisma.preRegistration.count(),
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
  ])

  // Registration stats by platform
  const platformStats = await prisma.preRegistration.groupBy({
    by: ['platform'],
    _count: { id: true },
  })

  // Registration stats by region
  const regionStats = await prisma.preRegistration.groupBy({
    by: ['region'],
    _count: { id: true },
  })

  // Registrations per day (last 14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const dailyRegistrations = await prisma.$queryRawUnsafe<Array<{ date: string; count: bigint }>>(
    `SELECT DATE(\"createdAt\") as date, COUNT(*) as count FROM pre_registrations WHERE "createdAt" >= $1 GROUP BY DATE("createdAt") ORDER BY date`,
    fourteenDaysAgo,
  )

  return {
    counts: {
      news: newsCount,
      publishedNews: publishedNewsCount,
      weapons: weaponCount,
      registrations: registrationCount,
    },
    platformStats: platformStats.map((s) => ({ platform: s.platform, count: s._count.id })),
    regionStats: regionStats.map((s) => ({ region: s.region, count: s._count.id })),
    dailyRegistrations: dailyRegistrations.map((d) => ({
      date: String(d.date),
      count: Number(d.count),
    })),
    recentRegistrations,
    recentNews,
  }
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 12, 50)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTh: true,
        excerptEn: true,
        excerptTh: true,
        category: true,
        featuredImage: true,
        publishedAt: true,
        externalUrl: true,
        openInNewTab: true,
        featureOnHome: true,
        homePriority: true,
      },
    }),
    prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
  ])

  return {
    data: articles,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
})

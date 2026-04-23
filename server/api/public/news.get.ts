export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 12, 50)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit
  const contentType = (query.contentType as string) || ''
  const topicKey = (query.topicKey as string) || ''

  const where: Record<string, unknown> = {
    status: 'PUBLISHED',
    OR: [
      { publishedAt: { lte: new Date() } },
      { publishedAt: null },
    ],
  }
  if (contentType) where.contentType = contentType
  if (topicKey) where.primaryTopicKey = topicKey

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
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
        contentType: true,
        primaryTopicKey: true,
        featuredImage: true,
        publishedAt: true,
        readingTimeMinutes: true,
        externalUrl: true,
        openInNewTab: true,
        featureOnHome: true,
        homePriority: true,
      },
    }),
    prisma.newsArticle.count({ where }),
  ])

  return {
    data: articles,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
})

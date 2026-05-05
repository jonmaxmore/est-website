export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const article = await prisma.newsArticle.findFirst({
    where: { slug, status: 'PUBLISHED' },
  })

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300')

  const relatedFilters = [
    article.campaignCode ? { campaignCode: article.campaignCode } : null,
    article.primaryTopicKey ? { primaryTopicKey: article.primaryTopicKey } : null,
    { contentType: article.contentType },
  ].filter(Boolean) as Array<Record<string, unknown>>

  const related = await prisma.newsArticle.findMany({
    where: {
      id: { not: article.id },
      status: 'PUBLISHED',
      OR: [{ publishedAt: { lte: new Date() } }, { publishedAt: null }],
      AND: [{ OR: relatedFilters }],
    },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 4,
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
    },
  })

  return { article, related }
})

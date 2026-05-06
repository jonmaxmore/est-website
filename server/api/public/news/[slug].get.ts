export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  // Public select — only fields the public webzine actually renders. Internal
  // status flags, audit columns, draft-only fields stay server-side.
  const PUBLIC_ARTICLE_SELECT = {
    id: true,
    slug: true,
    titleEn: true,
    titleTh: true,
    excerptEn: true,
    excerptTh: true,
    contentEn: true,
    contentTh: true,
    category: true,
    contentType: true,
    primaryTopicKey: true,
    featuredImage: true,
    ogImage: true,
    seoTitle: true,
    seoTitleTh: true,
    seoDesc: true,
    seoDescTh: true,
    publishedAt: true,
    readingTimeMinutes: true,
    pinned: true,
    // Internal-but-needed-for-related-query (campaignCode, contentType already in
    // selection). campaignCode used to derive related; not exposed on render.
    campaignCode: true,
  } as const

  const article = await prisma.newsArticle.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: PUBLIC_ARTICLE_SELECT,
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

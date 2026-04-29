import { paginated, parsePagination } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, limit, skip, take } = parsePagination(query, { defaultLimit: 12, maxLimit: 50 })
  const contentType = (query.contentType as string) || ''
  const topicKey = (query.topicKey as string) || ''

  // Note: รับเฉพาะ articles ที่ publishedAt <= now หรือ publishedAt = null
  // โดยตั้งใจ — null = ตั้งเวลาแบบเปิดตลอด
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
      take,
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

  // ── HTTP cache: 60s shared cache (CDN/nginx) ──
  setResponseHeader(event, 'Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=300')

  return paginated(articles, { total, page, limit })
})

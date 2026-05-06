import { paginated, parsePagination } from '../../../utils/response'

/** Admin: List all news (including drafts) with search + filter */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, limit, skip, take } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 })
  const search = (query.search as string) || ''
  const status = (query.status as string) || ''
  const category = (query.category as string) || ''
  const contentType = (query.contentType as string) || ''
  const primaryTopicKey = (query.primaryTopicKey as string) || ''
  const campaignCode = (query.campaignCode as string) || ''

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (category) where.category = category
  if (contentType) where.contentType = contentType
  if (primaryTopicKey) where.primaryTopicKey = primaryTopicKey
  if (campaignCode) where.campaignCode = campaignCode
  if (search) {
    where.OR = [
      { titleEn: { contains: search, mode: 'insensitive' } },
      { titleTh: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [articles, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take,
      skip,
    }),
    prisma.newsArticle.count({ where }),
  ])

  return paginated(articles, { total, page, limit })
})

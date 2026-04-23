import { resolveMarketingBanners, type BannerRouteType } from '../../utils/banner-resolver'

const routeTypes = new Set<BannerRouteType>(['homepage', 'news_index', 'article_detail', 'topic_page', 'event_page'])

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const requestedRouteType = String(query.routeType || 'news_index') as BannerRouteType
  const routeType = routeTypes.has(requestedRouteType) ? requestedRouteType : 'news_index'
  const articleId = query.articleId ? Number(query.articleId) : null
  const topicKey = query.topicKey ? String(query.topicKey) : null

  const banners = await prisma.marketingBanner.findMany({
    where: { isActive: true },
    include: {
      article: { select: { id: true, slug: true, titleEn: true, titleTh: true } },
      page: { select: { key: true, slug: true, titleEn: true, titleTh: true } },
      event: { select: { id: true, titleEn: true, titleTh: true, startsAt: true, endsAt: true } },
    },
    orderBy: [{ placement: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
  })

  return resolveMarketingBanners({
    now: new Date(),
    routeType,
    articleId,
    topicKey,
    banners,
  })
})

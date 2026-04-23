/** Admin: List marketing banners with placement, status, scope, and campaign filters. */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const where: Record<string, unknown> = {}

  if (query.placement) where.placement = query.placement
  if (query.status) where.status = query.status
  if (query.scope) where.scope = query.scope
  if (query.campaignCode) where.campaignCode = query.campaignCode

  return prisma.marketingBanner.findMany({
    where,
    include: {
      article: { select: { id: true, slug: true, titleEn: true, titleTh: true } },
      page: { select: { key: true, slug: true, titleEn: true, titleTh: true } },
      event: { select: { id: true, titleEn: true, titleTh: true, startsAt: true, endsAt: true } },
    },
    orderBy: [{ placement: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
  })
})

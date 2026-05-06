/**
 * GET /api/admin/campaigns/[id]/performance — per-campaign rollup
 *
 * Joins ConversionEvent.utmCampaign + PageView.utmCampaign to the campaign's
 * slug. Window: campaign's [startsAt, endsAt] when both are set, otherwise
 * last 30 days. Closes audit-2 finding C-5 #28 (no campaign perf dashboard).
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  const campaign = await prisma.campaign.findUnique({ where: { id } })
  if (!campaign) {
    throw createError({ statusCode: 404, message: 'Campaign not found' })
  }

  const now = new Date()
  const windowStart = campaign.startsAt ?? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const windowEnd = campaign.endsAt ?? now

  const where = {
    utmCampaign: campaign.slug,
    createdAt: { gte: windowStart, lte: windowEnd },
  }

  const [pageViews, conversions, conversionsByEvent, articleCount, bannerCount] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.conversionEvent.count({ where }),
    prisma.conversionEvent.groupBy({
      by: ['eventName'],
      where,
      _count: { _all: true },
    }),
    prisma.newsArticle.count({ where: { campaignId: id } }),
    prisma.marketingBanner.count({ where: { campaignId: id } }),
  ])

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      status: campaign.status,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
      kpis: campaign.kpis,
    },
    window: { from: windowStart.toISOString(), to: windowEnd.toISOString() },
    metrics: {
      pageViews,
      conversions,
      attachedArticles: articleCount,
      attachedBanners: bannerCount,
      eventBreakdown: conversionsByEvent.map((row) => ({
        event: row.eventName,
        count: row._count._all,
      })),
    },
  }
})

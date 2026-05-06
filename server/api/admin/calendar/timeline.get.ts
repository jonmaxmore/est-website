/**
 * GET /api/admin/calendar/timeline?from=ISO&to=ISO — banners + articles
 * + campaigns active in the given window. Powers the editorial calendar
 * view (audit-2 C-5 #27).
 *
 * Default window: the calendar month containing today.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const fromQ = typeof query.from === 'string' ? Date.parse(query.from) : NaN
  const toQ = typeof query.to === 'string' ? Date.parse(query.to) : NaN

  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const from = Number.isFinite(fromQ) ? new Date(fromQ) : defaultFrom
  const to = Number.isFinite(toQ) ? new Date(toQ) : defaultTo

  if (to <= from) {
    throw createError({ statusCode: 422, message: '`to` must be after `from`' })
  }
  // Cap window at 90 days to prevent expensive scans.
  const MAX_WINDOW_MS = 90 * 24 * 60 * 60 * 1000
  if (to.getTime() - from.getTime() > MAX_WINDOW_MS) {
    throw createError({ statusCode: 422, message: 'Window too large (max 90 days)' })
  }

  const [banners, articles, campaigns] = await Promise.all([
    prisma.marketingBanner.findMany({
      where: {
        OR: [
          { startsAt: { gte: from, lte: to } },
          { endsAt: { gte: from, lte: to } },
          { AND: [{ startsAt: { lte: from } }, { OR: [{ endsAt: null }, { endsAt: { gte: to } }] }] },
        ],
      },
      select: {
        id: true,
        titleEn: true,
        titleTh: true,
        placement: true,
        status: true,
        startsAt: true,
        endsAt: true,
        campaignId: true,
      },
      orderBy: { startsAt: 'asc' },
    }),
    prisma.newsArticle.findMany({
      where: {
        OR: [
          { publishedAt: { gte: from, lte: to } },
          { AND: [{ status: 'SCHEDULED' }, { publishedAt: { gte: from, lte: to } }] },
        ],
      },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTh: true,
        status: true,
        publishedAt: true,
        contentType: true,
        campaignId: true,
      },
      orderBy: { publishedAt: 'asc' },
    }),
    prisma.campaign.findMany({
      where: {
        OR: [
          { startsAt: { gte: from, lte: to } },
          { endsAt: { gte: from, lte: to } },
          { AND: [{ startsAt: { lte: from } }, { OR: [{ endsAt: null }, { endsAt: { gte: to } }] }] },
        ],
      },
      select: { id: true, name: true, slug: true, status: true, startsAt: true, endsAt: true },
      orderBy: { startsAt: 'asc' },
    }),
  ])

  return {
    window: { from: from.toISOString(), to: to.toISOString() },
    banners,
    articles,
    campaigns,
  }
})

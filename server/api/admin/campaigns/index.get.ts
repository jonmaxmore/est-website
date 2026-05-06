/**
 * GET /api/admin/campaigns — paginated list of campaigns
 */
import { paginated, parsePagination } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, limit, skip, take } = parsePagination(query, { defaultLimit: 20, maxLimit: 100 })
  const status = typeof query.status === 'string' ? query.status : null

  const where: Record<string, unknown> = {}
  if (status && ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].includes(status)) {
    where.status = status
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
      take,
      skip,
    }),
    prisma.campaign.count({ where }),
  ])

  return paginated(campaigns, { total, page, limit })
})

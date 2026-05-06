import { paginated, parsePagination } from '../../utils/response'

/** Activity log — returns admin actions with pagination and filtering */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page, limit, skip, take } = parsePagination(query, { defaultLimit: 50, maxLimit: 200 })
  const action = (query.action as string) || ''
  const resource = (query.resource as string) || ''

  const where: Record<string, unknown> = {}
  if (action) where.action = action
  if (resource) where.resource = resource

  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.activityLog.count({ where }),
  ])

  return paginated(rows, { total, page, limit })
})

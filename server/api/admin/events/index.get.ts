/** List game events with pagination and filtering */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 25, 100)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit
  const type = (query.type as string) || ''
  const status = (query.status as string) || ''

  const where: Record<string, unknown> = {}
  if (type) where.type = type
  if (status) where.status = status

  const [rows, total] = await Promise.all([
    prisma.gameEvent.findMany({
      where,
      orderBy: { startsAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.gameEvent.count({ where }),
  ])

  return {
    data: rows,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
})

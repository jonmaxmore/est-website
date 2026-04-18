/** Admin: List pre-registrations with search, filter, pagination */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 25, 100)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit
  const search = (query.search as string) || ''
  const platform = (query.platform as string) || ''
  const region = (query.region as string) || ''

  const where: Record<string, unknown> = {}
  if (platform) where.platform = platform
  if (region) where.region = region
  if (search) where.email = { contains: search, mode: 'insensitive' }

  const [rows, total] = await Promise.all([
    prisma.preRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.preRegistration.count({ where }),
  ])

  return { data: rows, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
})

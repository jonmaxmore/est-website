export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')
  return prisma.milestone.findMany({
    orderBy: { sortOrder: 'asc' },
  })
})

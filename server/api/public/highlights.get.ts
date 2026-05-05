/** Public endpoint — returns visible highlights sorted by order */
export default defineEventHandler(async (event) => {
  const highlights = await prisma.highlight.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')

  return highlights
})

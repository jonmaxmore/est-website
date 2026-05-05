/** Public endpoint — returns visible features sorted by order */
export default defineEventHandler(async (event) => {
  const features = await prisma.feature.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')

  return features
})

export default defineEventHandler(async (event) => {
  const weapons = await prisma.weapon.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })

  // Public, slow-changing reference data. CDN/nginx caches for 2 min;
  // browsers re-validate after 1 min; stale serve up to 10 min while
  // background refresh runs.
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')

  return weapons
})

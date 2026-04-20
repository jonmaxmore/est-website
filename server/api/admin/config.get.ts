/** Get site config — optionally filter by key query param */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const key = query.key as string | undefined

  if (key) {
    const config = await prisma.siteConfig.findUnique({ where: { key } })
    return config?.value || null
  }

  return prisma.siteConfig.findMany()
})

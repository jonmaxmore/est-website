/** Public endpoint — returns visible highlights sorted by order */
export default defineEventHandler(async () => {
  return prisma.highlight.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })
})

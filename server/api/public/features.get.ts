/** Public endpoint — returns visible features sorted by order */
export default defineEventHandler(async () => {
  return prisma.feature.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })
})

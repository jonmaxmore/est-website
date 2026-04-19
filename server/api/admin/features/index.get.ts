/** Admin — list all features */
export default defineEventHandler(async () => {
  return prisma.feature.findMany({
    orderBy: { sortOrder: 'asc' },
  })
})

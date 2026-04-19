/** Admin — list all highlights */
export default defineEventHandler(async () => {
  return prisma.highlight.findMany({
    orderBy: { sortOrder: 'asc' },
  })
})

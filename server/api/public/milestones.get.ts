export default defineEventHandler(async () => {
  return prisma.milestone.findMany({
    orderBy: { sortOrder: 'asc' },
  })
})

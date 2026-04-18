export default defineEventHandler(async () => {
  return prisma.weapon.findMany({ orderBy: { sortOrder: 'asc' } })
})

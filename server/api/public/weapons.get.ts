export default defineEventHandler(async () => {
  return prisma.weapon.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
  })
})

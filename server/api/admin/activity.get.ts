/** Activity log — returns recent admin actions */
export default defineEventHandler(async () => {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
})

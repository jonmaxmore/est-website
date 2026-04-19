/** Admin — list all media assets */
export default defineEventHandler(async () => {
  return prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
  })
})

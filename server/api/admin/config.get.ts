/** Get all site config entries */
export default defineEventHandler(async () => {
  return prisma.siteConfig.findMany()
})

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')!
  const config = await prisma.siteConfig.findUnique({ where: { key: `page_${key}` } })
  return config?.value || { seoTitle: '', seoDesc: '', content: '' }
})

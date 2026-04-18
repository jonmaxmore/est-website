export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const article = await prisma.newsArticle.findFirst({
    where: { slug, status: 'PUBLISHED' },
  })

  if (!article) {
    throw createError({ statusCode: 404, message: 'Article not found' })
  }

  return article
})

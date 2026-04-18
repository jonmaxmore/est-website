export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  await prisma.newsArticle.delete({ where: { id } })
  return { success: true }
})

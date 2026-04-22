export default defineEventHandler(async (event) => {
  const slugParam = getRouterParam(event, 'slug')
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : String(slugParam || '')

  const page = await prisma.pageContent.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
  })

  if (!page) {
    throw createError({ statusCode: 404, message: 'Page not found' })
  }

  return page
})

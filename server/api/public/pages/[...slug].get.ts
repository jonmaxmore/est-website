export default defineEventHandler(async (event) => {
  const slugParam = getRouterParam(event, 'slug')
  const slug = Array.isArray(slugParam) ? slugParam.join('/') : String(slugParam || '')

  const page = await prisma.pageContent.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    // Public select — exclude internal flags / audit columns
    select: {
      key: true,
      slug: true,
      titleEn: true,
      titleTh: true,
      description: true,
      template: true,
      seoTitle: true,
      seoTitleTh: true,
      seoDesc: true,
      seoDescTh: true,
      contentEn: true,
      contentTh: true,
      icon: true,
      isSystemPage: true,
      updatedAt: true,
    },
  })

  if (!page) {
    throw createError({ statusCode: 404, message: 'Page not found' })
  }

  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')
  return page
})

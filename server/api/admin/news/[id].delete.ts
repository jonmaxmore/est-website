import { cacheInvalidate } from '../../../utils/redis'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  let deleted: { titleEn: string; slug: string } | null = null
  try {
    deleted = await prisma.newsArticle.delete({
      where: { id },
      select: { titleEn: true, slug: true },
    })
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      throw createError({ statusCode: 404, message: 'News article not found' })
    }
    throw err
  }

  await logActivity(
    event,
    'DELETE',
    'news',
    `Deleted article: ${deleted.titleEn} (${deleted.slug})`,
    String(id),
  )

  await cacheInvalidate('cache:sitemap-xml')
  await cacheInvalidate('news:*')

  return { success: true }
})

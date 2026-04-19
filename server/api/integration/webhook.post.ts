export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, action, data } = body

  // Webhook handler for WordPress/Wix/External services
  if (type === 'news' || type === 'post') {
    if (action === 'create' || action === 'update') {
      await prisma.newsArticle.upsert({
        where: { slug: data.slug || `imported-${Date.now()}` },
        update: {
          titleEn: data.title || data.titleEn,
          titleTh: data.titleTh || data.title,
          excerptEn: data.excerpt || data.excerptEn,
          excerptTh: data.excerptTh || data.excerpt,
          contentEn: data.content || data.contentEn,
          contentTh: data.contentTh || data.content,
          status: 'PUBLISHED',
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        },
        create: {
          slug: data.slug || `imported-${Date.now()}`,
          titleEn: data.title || data.titleEn || 'Untitled',
          titleTh: data.titleTh || data.title || 'ไม่มีชื่อ',
          category: 'ANNOUNCEMENT',
          status: 'PUBLISHED',
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        },
      })
      return { success: true, message: 'News synced' }
    }
    if (action === 'delete' && data.slug) {
      await prisma.newsArticle.deleteMany({ where: { slug: data.slug } })
      return { success: true, message: 'News deleted' }
    }
  }

  return { success: true, message: 'Webhook received' }
})

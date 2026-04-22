import { timingSafeEqual } from 'node:crypto'

import { normalizeIntegrationsConfig } from '../../utils/admin-config'

function isMutationRequest(type: unknown, action: unknown) {
  return (type === 'news' || type === 'post') && (action === 'create' || action === 'update' || action === 'delete')
}

function secretsMatch(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)

  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, action, data } = body

  if (isMutationRequest(type, action)) {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'integrations' } })
    const integrations = normalizeIntegrationsConfig(config?.value ?? null)
    const configuredSecret = integrations.webhookSecret || integrations.wix.webhookSecret
    const providedSecret = getHeader(event, 'x-webhook-secret') || ''

    if (!configuredSecret || !providedSecret || !secretsMatch(configuredSecret, providedSecret)) {
      throw createError({ statusCode: 401, message: 'Invalid webhook secret' })
    }
  }

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
          titleTh: data.titleTh || data.title || 'à¹„à¸¡à¹ˆà¸¡à¸µà¸Šà¸·à¹ˆà¸­',
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

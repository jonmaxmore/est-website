import { estimateReadingTimeMinutes } from '../../../../app/shared/cms/webzine'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'
import { cacheInvalidate } from '../../../utils/redis'
import { recordNewsRevision } from '../../../utils/news-revisions'
import { sanitizeRichTextOptional } from '../../../utils/sanitize'
import { newsUpdateSchema } from '../../../utils/schemas-news'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  const body = await readBody(event)
  const parsed = newsUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  const data = parsed.data

  // Sanitize content (only when explicitly provided)
  const sanitizedContentEn =
    data.contentEn !== undefined ? sanitizeRichTextOptional(data.contentEn) : undefined
  const sanitizedContentTh =
    data.contentTh !== undefined ? sanitizeRichTextOptional(data.contentTh) : undefined
  const shouldUpdateReadingTime = data.contentEn !== undefined || data.contentTh !== undefined

  // Translation-completeness gate: when status flips to PUBLISHED, the COMBINED
  // (existing + body) state must have all four bilingual fields. Audit-2 (M-4)
  // schema-level superRefine only sees the body; this DB-aware check closes
  // the bypass where `PUT { status: 'PUBLISHED' }` would publish an article
  // with contentTh=null in storage.
  let existingForGate: { publishedAt: Date | null; titleEn: string; titleTh: string; contentEn: string | null; contentTh: string | null } | null = null
  if (data.status === 'PUBLISHED' || data.publishedAt !== undefined) {
    existingForGate = await prisma.newsArticle.findUnique({
      where: { id },
      select: { publishedAt: true, titleEn: true, titleTh: true, contentEn: true, contentTh: true },
    })
  }

  if (data.status === 'PUBLISHED' && existingForGate) {
    const finalTitleEn = data.titleEn !== undefined ? data.titleEn : existingForGate.titleEn
    const finalTitleTh = data.titleTh !== undefined ? data.titleTh : existingForGate.titleTh
    const finalContentEn = sanitizedContentEn !== undefined ? sanitizedContentEn : existingForGate.contentEn
    const finalContentTh = sanitizedContentTh !== undefined ? sanitizedContentTh : existingForGate.contentTh

    const missing: string[] = []
    if (!finalTitleEn?.trim()) missing.push('titleEn')
    if (!finalTitleTh?.trim()) missing.push('titleTh')
    if (!finalContentEn?.trim()) missing.push('contentEn')
    if (!finalContentTh?.trim()) missing.push('contentTh')
    if (missing.length > 0) {
      throw createError({
        statusCode: 422,
        message: `Cannot publish: missing required bilingual fields — ${missing.join(', ')}`,
        data: { missing },
      })
    }
  }

  // Auto-set publishedAt when status flips to PUBLISHED for the first time
  let publishedAtUpdate: Date | null | undefined = undefined
  if (data.publishedAt !== undefined) {
    publishedAtUpdate = data.publishedAt ? new Date(data.publishedAt) : null
  } else if (data.status === 'PUBLISHED' && !existingForGate?.publishedAt) {
    publishedAtUpdate = new Date()
  }

  try {
    const article = await prisma.newsArticle.update({
      where: { id },
      data: {
        ...data,
        ...(sanitizedContentEn !== undefined ? { contentEn: sanitizedContentEn } : {}),
        ...(sanitizedContentTh !== undefined ? { contentTh: sanitizedContentTh } : {}),
        readingTimeMinutes: shouldUpdateReadingTime
          ? estimateReadingTimeMinutes(
              (sanitizedContentEn ?? data.contentEn ?? '') ||
                (sanitizedContentTh ?? data.contentTh ?? ''),
            )
          : undefined,
        publishedAt: publishedAtUpdate,
      },
    })

    await logActivity(
      event,
      'UPDATE',
      'news',
      `Updated article: ${article.titleEn} (${article.slug})`,
      String(id),
    )

    // Snapshot post-update state into the revision history
    recordNewsRevision(event, article)

    await cacheInvalidate('cache:sitemap-xml')
    await cacheInvalidate('news:*')

    return article
  } catch (error) {
    throw (
      toDuplicateConflictError(error as { code?: string; meta?: { target?: string[] | string } }, {
        resource: 'News article',
      }) ?? error
    )
  }
})

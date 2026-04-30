import { estimateReadingTimeMinutes } from '../../../../app/shared/cms/webzine'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'
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

  // Auto-set publishedAt when status flips to PUBLISHED for the first time
  let publishedAtUpdate: Date | null | undefined = undefined
  if (data.publishedAt !== undefined) {
    publishedAtUpdate = data.publishedAt ? new Date(data.publishedAt) : null
  } else if (data.status === 'PUBLISHED') {
    const existing = await prisma.newsArticle.findUnique({
      where: { id },
      select: { publishedAt: true },
    })
    if (!existing?.publishedAt) {
      publishedAtUpdate = new Date()
    }
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

    return article
  } catch (error) {
    throw (
      toDuplicateConflictError(error as { code?: string; meta?: { target?: string[] | string } }, {
        resource: 'News article',
      }) ?? error
    )
  }
})

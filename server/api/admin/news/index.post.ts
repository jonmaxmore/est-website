import { estimateReadingTimeMinutes } from '../../../../app/shared/cms/webzine'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'
import { sanitizeRichTextOptional } from '../../../utils/sanitize'
import { newsCreateSchema } from '../../../utils/schemas-news'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = newsCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Validation error', data: parsed.error.flatten() })
  }

  const data = parsed.data
  // Sanitize rich-text content before writing to DB (defense-in-depth XSS)
  const safeContentEn = sanitizeRichTextOptional(data.contentEn ?? null)
  const safeContentTh = sanitizeRichTextOptional(data.contentTh ?? null)

  try {
    const article = await prisma.newsArticle.create({
      data: {
        ...data,
        contentEn: safeContentEn,
        contentTh: safeContentTh,
        readingTimeMinutes: estimateReadingTimeMinutes(safeContentEn || safeContentTh || ''),
        publishedAt: data.publishedAt
          ? new Date(data.publishedAt)
          : data.status === 'PUBLISHED'
            ? new Date()
            : null,
      },
    })

    await logActivity(
      event,
      'CREATE',
      'news',
      `Created article: ${article.titleEn} (${article.slug})`,
      String(article.id),
    )

    return article
  } catch (error) {
    throw toDuplicateConflictError(error as { code?: string; meta?: { target?: string[] | string } }, { resource: 'News article' }) ?? error
  }
})

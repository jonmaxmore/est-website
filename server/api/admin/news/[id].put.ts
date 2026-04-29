import { z } from 'zod'

import { WEBZINE_CONTENT_TYPES, estimateReadingTimeMinutes } from '../../../../app/shared/cms/webzine'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'
import { sanitizeRichTextOptional } from '../../../utils/sanitize'

const emptyToNull = (value: unknown) => (value === '' ? null : value)
const nullableStringSchema = z.preprocess(emptyToNull, z.string().optional().nullable())

const updateSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleTh: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerptEn: nullableStringSchema,
  excerptTh: nullableStringSchema,
  contentEn: nullableStringSchema,
  contentTh: nullableStringSchema,
  category: z.enum(['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']).optional(),
  contentType: z.enum(WEBZINE_CONTENT_TYPES).optional(),
  primaryTopicKey: nullableStringSchema,
  campaignCode: nullableStringSchema,
  linkedEventId: nullableStringSchema,
  pinned: z.boolean().optional(),
  isEvergreen: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featuredImage: nullableStringSchema,
  publishedAt: nullableStringSchema,
  featureOnHome: z.boolean().optional(),
  homePriority: z.number().optional(),
  externalUrl: nullableStringSchema,
  openInNewTab: z.boolean().optional(),
  seoTitle: nullableStringSchema,
  seoDesc: nullableStringSchema,
  ogImage: nullableStringSchema,
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  const body = await readBody(event)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  const data = parsed.data

  // ── Sanitize content (only when explicitly provided) ──
  const sanitizedContentEn =
    data.contentEn !== undefined ? sanitizeRichTextOptional(data.contentEn) : undefined
  const sanitizedContentTh =
    data.contentTh !== undefined ? sanitizeRichTextOptional(data.contentTh) : undefined
  const shouldUpdateReadingTime = data.contentEn !== undefined || data.contentTh !== undefined

  // ── Auto-set publishedAt เมื่อเปลี่ยนสถานะเป็น PUBLISHED ครั้งแรก ──
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

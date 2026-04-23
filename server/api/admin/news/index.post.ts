import { z } from 'zod'

import { WEBZINE_CONTENT_TYPES, estimateReadingTimeMinutes } from '../../../../app/shared/cms/webzine'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'

const emptyToNull = (value: unknown) => (value === '' ? null : value)
const nullableStringSchema = z.preprocess(emptyToNull, z.string().optional().nullable())

const newsSchema = z.object({
  titleEn: z.string().min(1),
  titleTh: z.string().min(1),
  slug: z.string().min(1),
  excerptEn: nullableStringSchema,
  excerptTh: nullableStringSchema,
  contentEn: nullableStringSchema,
  contentTh: nullableStringSchema,
  category: z.enum(['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']),
  contentType: z.enum(WEBZINE_CONTENT_TYPES).default('ANNOUNCEMENT'),
  primaryTopicKey: nullableStringSchema,
  campaignCode: nullableStringSchema,
  linkedEventId: nullableStringSchema,
  pinned: z.boolean().default(false),
  isEvergreen: z.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featuredImage: nullableStringSchema,
  publishedAt: nullableStringSchema,
  featureOnHome: z.boolean().default(false),
  homePriority: z.number().default(0),
  externalUrl: nullableStringSchema,
  openInNewTab: z.boolean().default(false),
  seoTitle: nullableStringSchema,
  seoDesc: nullableStringSchema,
  ogImage: nullableStringSchema,
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = newsSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Validation error', data: parsed.error.flatten() })
  }

  const data = parsed.data
  try {
    const article = await prisma.newsArticle.create({
      data: {
        ...data,
        readingTimeMinutes: estimateReadingTimeMinutes(data.contentEn || data.contentTh || ''),
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    })

    return article
  } catch (error) {
    throw toDuplicateConflictError(error as { code?: string; meta?: { target?: string[] | string } }, { resource: 'News article' }) ?? error
  }
})

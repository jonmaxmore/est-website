import { z } from 'zod'

import { WEBZINE_CONTENT_TYPES, estimateReadingTimeMinutes } from '../../../../app/shared/cms/webzine'

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
    throw createError({ statusCode: 400, message: 'Validation error', data: parsed.error.flatten() })
  }

  const data = parsed.data
  const shouldUpdateReadingTime = data.contentEn !== undefined || data.contentTh !== undefined
  const article = await prisma.newsArticle.update({
    where: { id },
    data: {
      ...data,
      readingTimeMinutes: shouldUpdateReadingTime
        ? estimateReadingTimeMinutes(data.contentEn || data.contentTh || '')
        : undefined,
      publishedAt: data.publishedAt !== undefined ? (data.publishedAt ? new Date(data.publishedAt) : null) : undefined,
    },
  })

  return article
})

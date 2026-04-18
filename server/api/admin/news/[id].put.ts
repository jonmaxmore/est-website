import { z } from 'zod'

const updateSchema = z.object({
  titleEn: z.string().min(1).optional(),
  titleTh: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerptEn: z.string().optional().nullable(),
  excerptTh: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  contentTh: z.string().optional().nullable(),
  category: z.enum(['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  featuredImage: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  featureOnHome: z.boolean().optional(),
  homePriority: z.number().optional(),
  externalUrl: z.string().optional().nullable(),
  openInNewTab: z.boolean().optional(),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
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
  const article = await prisma.newsArticle.update({
    where: { id },
    data: {
      ...data,
      publishedAt: data.publishedAt !== undefined ? (data.publishedAt ? new Date(data.publishedAt) : null) : undefined,
    },
  })

  return article
})

import { z } from 'zod'

const newsSchema = z.object({
  titleEn: z.string().min(1),
  titleTh: z.string().min(1),
  slug: z.string().min(1),
  excerptEn: z.string().optional().nullable(),
  excerptTh: z.string().optional().nullable(),
  contentEn: z.string().optional().nullable(),
  contentTh: z.string().optional().nullable(),
  category: z.enum(['ANNOUNCEMENT', 'EVENT', 'UPDATE', 'MEDIA', 'MAINTENANCE']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featuredImage: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  featureOnHome: z.boolean().default(false),
  homePriority: z.number().default(0),
  externalUrl: z.string().optional().nullable(),
  openInNewTab: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = newsSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Validation error', data: parsed.error.flatten() })
  }

  const data = parsed.data
  const article = await prisma.newsArticle.create({
    data: {
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    },
  })

  return article
})

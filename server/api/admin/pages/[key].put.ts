import { z } from 'zod'

import { SYSTEM_CMS_PAGES, isReservedCmsSlug, normalizeCmsSlug } from '../../../../app/shared/cms/pages'
import { sanitizeRichText } from '../../../utils/sanitize'

const pageWriteSchema = z.object({
  titleEn: z.string().trim().optional(),
  titleTh: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  description: z.string().trim().nullable().optional(),
  template: z.string().trim().optional(),
  seoTitle: z.string().trim().nullable().optional(),
  seoTitleTh: z.string().trim().nullable().optional(),
  seoDesc: z.string().trim().nullable().optional(),
  seoDescTh: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  contentEn: z.string().nullable().optional(),
  contentTh: z.string().nullable().optional(),
  icon: z.string().trim().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  showInHeader: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
  headerOrder: z.coerce.number().int().optional(),
  footerOrder: z.coerce.number().int().optional(),
  isSystemPage: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, message: 'Invalid page key' })
  }

  const parsedBody = pageWriteSchema.safeParse(await readBody(event))
  if (!parsedBody.success) {
    throw createError({ statusCode: 400, message: 'Invalid page payload' })
  }

  const existingPage = await prisma.pageContent.findUnique({ where: { key } })
  const systemPage = SYSTEM_CMS_PAGES.find((entry) => entry.key === key)
  const slug = normalizeCmsSlug(parsedBody.data.slug || existingPage?.slug || key)

  if (!slug) {
    throw createError({ statusCode: 400, message: 'Page slug is required' })
  }

  if (slug !== (existingPage?.slug || key) && isReservedCmsSlug(slug)) {
    throw createError({ statusCode: 400, message: `Slug "${slug}" is reserved` })
  }

  const conflictingPage = await prisma.pageContent.findFirst({
    where: {
      key: { not: key },
      slug,
    },
  })

  if (conflictingPage) {
    throw createError({ statusCode: 409, message: `Slug "${slug}" is already in use` })
  }

  const body = parsedBody.data

  // ── Sanitize rich-text content (defense-in-depth XSS) ──
  const safeContentEn = sanitizeRichText(body.contentEn ?? body.content ?? existingPage?.contentEn ?? '')
  const safeContentTh = sanitizeRichText(body.contentTh ?? existingPage?.contentTh ?? '')

  const page = await prisma.pageContent.upsert({
    where: { key },
    update: {
      slug,
      titleEn: body.titleEn ?? existingPage?.titleEn ?? systemPage?.titleEn ?? '',
      titleTh: body.titleTh ?? existingPage?.titleTh ?? systemPage?.titleTh ?? '',
      description: body.description ?? existingPage?.description ?? systemPage?.description ?? null,
      template: body.template ?? existingPage?.template ?? 'default',
      seoTitle: body.seoTitle ?? existingPage?.seoTitle ?? null,
      seoTitleTh: body.seoTitleTh ?? existingPage?.seoTitleTh ?? null,
      seoDesc: body.seoDesc ?? existingPage?.seoDesc ?? null,
      seoDescTh: body.seoDescTh ?? existingPage?.seoDescTh ?? null,
      contentEn: safeContentEn,
      contentTh: safeContentTh,
      icon: body.icon ?? existingPage?.icon ?? systemPage?.icon ?? null,
      status: body.status ?? existingPage?.status ?? 'PUBLISHED',
      showInHeader: body.showInHeader ?? existingPage?.showInHeader ?? false,
      showInFooter: body.showInFooter ?? existingPage?.showInFooter ?? false,
      headerOrder: body.headerOrder ?? existingPage?.headerOrder ?? 0,
      footerOrder: body.footerOrder ?? existingPage?.footerOrder ?? 0,
      isSystemPage: body.isSystemPage ?? existingPage?.isSystemPage ?? Boolean(systemPage),
    },
    create: {
      key,
      slug,
      titleEn: body.titleEn ?? systemPage?.titleEn ?? '',
      titleTh: body.titleTh ?? systemPage?.titleTh ?? '',
      description: body.description ?? systemPage?.description ?? null,
      template: body.template ?? 'default',
      seoTitle: body.seoTitle ?? null,
      seoTitleTh: body.seoTitleTh ?? null,
      seoDesc: body.seoDesc ?? null,
      seoDescTh: body.seoDescTh ?? null,
      contentEn: safeContentEn,
      contentTh: safeContentTh,
      icon: body.icon ?? systemPage?.icon ?? null,
      status: body.status ?? 'PUBLISHED',
      showInHeader: body.showInHeader ?? false,
      showInFooter: body.showInFooter ?? false,
      headerOrder: body.headerOrder ?? 0,
      footerOrder: body.footerOrder ?? 0,
      isSystemPage: body.isSystemPage ?? Boolean(systemPage),
    },
  })

  await logActivity(event, 'UPDATE', 'pages', `Updated page: ${key}`, key)
  return page
})

import { z } from 'zod'

import { buildPagePath, isReservedCmsSlug, normalizePageCreateInput } from '../../../../app/shared/cms/pages'

const createPageSchema = z.object({
  titleEn: z.string().trim().min(1),
  titleTh: z.string().trim().min(1),
  slug: z.string().trim().min(1),
})

export default defineEventHandler(async (event) => {
  const parsedBody = createPageSchema.safeParse(await readBody(event))
  if (!parsedBody.success) {
    throw createError({ statusCode: 400, message: 'Invalid page payload' })
  }

  const pageInput = normalizePageCreateInput(parsedBody.data)
  if (!pageInput.slug) {
    throw createError({ statusCode: 400, message: 'Page slug is required' })
  }

  if (isReservedCmsSlug(pageInput.slug)) {
    throw createError({ statusCode: 400, message: `Slug "${pageInput.slug}" is reserved` })
  }

  const existingPage = await prisma.pageContent.findFirst({
    where: {
      OR: [{ key: pageInput.key }, { slug: pageInput.slug }],
    },
  })

  if (existingPage) {
    throw createError({ statusCode: 409, message: `Page "${pageInput.slug}" already exists` })
  }

  const page = await prisma.pageContent.create({ data: pageInput })

  await logActivity(event, 'CREATE', 'pages', `Created page: ${page.key}`, page.key)
  return {
    ...page,
    route: buildPagePath(page),
  }
})

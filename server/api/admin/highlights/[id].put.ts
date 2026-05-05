import { z } from 'zod'
import { parseIdParam } from '../../../utils/response'
import { toNotFoundError } from '../../../utils/prisma-errors'

const updateSchema = z.object({
  key: z.string().min(1).optional(),
  titleEn: z.string().min(1).optional(),
  titleTh: z.string().min(1).optional(),
  descriptionEn: z.string().optional(),
  descriptionTh: z.string().optional(),
  detailEn: z.string().optional(),
  detailTh: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().optional(),
  visible: z.boolean().optional(),
})

/** Admin — update a highlight */
export default defineEventHandler(async (event) => {
  const id = parseIdParam(event, 'id')

  const body = await readBody(event)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  try {
    const highlight = await prisma.highlight.update({ where: { id }, data: parsed.data })
    await logActivity(event, 'UPDATE', 'highlights', `Updated highlight: ${highlight.titleEn}`, String(id))
    return highlight
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Highlight' })
    if (notFound) throw notFound
    throw err
  }
})

import { z } from 'zod'

import { toDuplicateConflictError } from '../../../utils/prisma-errors'

const featureSchema = z.object({
  key: z.string().min(1),
  titleEn: z.string().min(1),
  titleTh: z.string().min(1),
  descriptionEn: z.string().optional().default(''),
  descriptionTh: z.string().optional().default(''),
  detailEn: z.string().optional().default(''),
  detailTh: z.string().optional().default(''),
  icon: z.string().optional().default('⭐'),
  image: z.string().optional().default(''),
  sortOrder: z.number().optional().default(0),
  visible: z.boolean().optional().default(true),
})

/** Admin — create a new feature */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = featureSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  try {
    const feature = await prisma.feature.create({ data: parsed.data })
    await logActivity(event, 'CREATE', 'features', `Created feature: ${parsed.data.titleEn}`, String(feature.id))
    return feature
  } catch (error) {
    throw toDuplicateConflictError(error as { code?: string; meta?: { target?: string[] | string } }, { resource: 'Feature' }) ?? error
  }
})

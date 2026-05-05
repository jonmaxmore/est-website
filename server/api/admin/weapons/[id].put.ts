import { z } from 'zod'

import { toDuplicateConflictError, toNotFoundError } from '../../../utils/prisma-errors'
import { parseIdParam } from '../../../utils/response'

const weaponSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionTh: z.string().optional().nullable(),
  portrait: z.string().optional().nullable(),
  infoImage: z.string().optional().nullable(),
  backgroundImage: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  videoType: z.enum(['NONE', 'YOUTUBE', 'UPLOAD']).optional(),
  videoUrl: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  visible: z.boolean().optional(),
  statSTR: z.number().min(0).max(100).optional(),
  statINT: z.number().min(0).max(100).optional(),
  statAGI: z.number().min(0).max(100).optional(),
  statDEX: z.number().min(0).max(100).optional(),
  statHP: z.number().min(0).max(100).optional(),
})

export default defineEventHandler(async (event) => {
  const id = parseIdParam(event, 'id')

  const body = await readBody(event)
  const parsed = weaponSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  try {
    const weapon = await prisma.weapon.update({ where: { id }, data: parsed.data })

    await logActivity(
      event,
      'UPDATE',
      'weapons',
      `Updated weapon: ${weapon.name}`,
      String(id),
    )

    return weapon
  } catch (err) {
    const typed = err as { code?: string; meta?: { target?: string[] | string } }
    const notFound = toNotFoundError(typed, { resource: 'Weapon' })
    if (notFound) throw notFound
    const conflict = toDuplicateConflictError(typed, { resource: 'Weapon' })
    if (conflict) throw conflict
    throw err
  }
})

import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { logActivity } from '~~/server/utils/activity'

const createWeaponSchema = z.object({
  name: z.string().min(1, 'Weapon name is required'),
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
  const body = await readBody(event)
  const parsed = createWeaponSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Validation error', data: parsed.error.flatten() })
  }

  const weapon = await prisma.weapon.create({ data: parsed.data })
  await logActivity(event, 'CREATE', 'weapon', `Created weapon: ${weapon.name}`)
  return weapon
})

import { z } from 'zod'

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
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  const body = await readBody(event)
  const parsed = weaponSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Validation error', data: parsed.error.flatten() })
  }

  return prisma.weapon.update({ where: { id }, data: parsed.data })
})

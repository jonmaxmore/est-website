import { z } from 'zod'

const milestoneSchema = z.object({
  tier: z.number().int().positive(),
  targetCount: z.number().int().positive(),
  rewardEn: z.string().min(1),
  rewardTh: z.string().min(1),
  icon: z.string().optional().default(''),
  reached: z.boolean().optional().default(false),
  sortOrder: z.number().int().nonnegative().optional().default(0),
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'Invalid milestone id' })
  }

  const parsed = milestoneSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid milestone data', data: parsed.error.flatten() })
  }

  const milestone = await prisma.milestone.update({
    where: { id },
    data: {
      ...parsed.data,
      icon: parsed.data.icon || null,
    },
  })

  await logActivity(event, 'UPDATE', 'milestones', `Updated milestone: ${milestone.targetCount}`, String(milestone.id))
  return milestone
})

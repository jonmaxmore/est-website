import { z } from 'zod'
import { parseIdParam } from '../../../utils/response'
import { toNotFoundError } from '../../../utils/prisma-errors'

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
  const id = parseIdParam(event, 'id')

  const parsed = milestoneSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Invalid milestone data', data: parsed.error.flatten() })
  }

  try {
    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...parsed.data,
        icon: parsed.data.icon || null,
      },
    })
    await logActivity(event, 'UPDATE', 'milestones', `Updated milestone: ${milestone.targetCount}`, String(milestone.id))
    return milestone
  } catch (err) {
    const notFound = toNotFoundError(err as { code?: string }, { resource: 'Milestone' })
    if (notFound) throw notFound
    throw err
  }
})

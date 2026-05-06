/**
 * PUT /api/admin/campaigns/[id] — partial update of a campaign
 */
import { campaignUpdateSchema } from '../../../utils/schemas-campaign'
import { toDuplicateConflictError, toNotFoundError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id' })

  const parsed = campaignUpdateSchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  try {
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...parsed.data,
        startsAt:
          parsed.data.startsAt === undefined
            ? undefined
            : parsed.data.startsAt
              ? new Date(parsed.data.startsAt)
              : null,
        endsAt:
          parsed.data.endsAt === undefined
            ? undefined
            : parsed.data.endsAt
              ? new Date(parsed.data.endsAt)
              : null,
      },
    })
    logActivity(event, 'UPDATE', 'campaigns', `Updated campaign: ${campaign.name}`, campaign.id)
    return campaign
  } catch (err) {
    const typed = err as { code?: string; meta?: { target?: string[] | string } }
    const notFound = toNotFoundError(typed, { resource: 'Campaign' })
    if (notFound) throw notFound
    const conflict = toDuplicateConflictError(typed, { resource: 'Campaign' })
    if (conflict) throw conflict
    throw err
  }
})

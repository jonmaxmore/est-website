/**
 * POST /api/admin/campaigns — create a new campaign
 */
import { campaignCreateSchema } from '../../../utils/schemas-campaign'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const parsed = campaignCreateSchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Validation error', data: parsed.error.flatten() })
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        ...parsed.data,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      },
    })
    logActivity(event, 'CREATE', 'campaigns', `Created campaign: ${campaign.name} (${campaign.slug})`, campaign.id)
    return campaign
  } catch (err) {
    const conflict = toDuplicateConflictError(
      err as { code?: string; meta?: { target?: string[] | string } },
      { resource: 'Campaign' },
    )
    if (conflict) throw conflict
    throw err
  }
})

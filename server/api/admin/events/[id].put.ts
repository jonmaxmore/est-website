/**
 * PUT /api/admin/events/[id] — partial update of a game event
 *
 * - linkedArticleId is validated inside the update transaction (avoids
 *   FK error / orphan link to a deleted article).
 * - end time must be after start time when both are provided.
 */
import { toDuplicateConflictError } from '../../../utils/prisma-errors'
import { eventUpdateSchema } from '../../../utils/schemas-events'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing event id' })
  }

  const parsed = eventUpdateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: 'Validation error',
      data: parsed.error.flatten(),
    })
  }
  const body = parsed.data

  if (body.startsAt && body.endsAt && new Date(body.endsAt) <= new Date(body.startsAt)) {
    throw createError({ statusCode: 400, message: 'End time must be after start time.' })
  }

  // Build only the fields the admin actually sent (Prisma update ignores undefined).
  const data: Record<string, unknown> = {}
  if (body.titleEn !== undefined) data.titleEn = body.titleEn
  if (body.titleTh !== undefined) data.titleTh = body.titleTh
  if (body.descriptionEn !== undefined) data.descriptionEn = body.descriptionEn
  if (body.descriptionTh !== undefined) data.descriptionTh = body.descriptionTh
  if (body.type !== undefined) data.type = body.type
  if (body.status !== undefined) data.status = body.status
  if (body.startsAt !== undefined) data.startsAt = new Date(body.startsAt)
  if (body.endsAt !== undefined) data.endsAt = new Date(body.endsAt)
  if (body.timezone !== undefined) data.timezone = body.timezone
  if (body.multiplier !== undefined) data.multiplier = body.multiplier
  if (body.bonusType !== undefined) data.bonusType = body.bonusType
  if (body.bannerImage !== undefined) data.bannerImage = body.bannerImage
  if (body.icon !== undefined) data.icon = body.icon
  if (body.color !== undefined) data.color = body.color
  if (body.visible !== undefined) data.visible = body.visible
  if (body.campaignCode !== undefined) data.campaignCode = body.campaignCode

  try {
    const gameEvent = await prisma.$transaction(async (tx) => {
      if (body.linkedArticleId !== undefined) {
        if (body.linkedArticleId !== null) {
          const exists = await tx.newsArticle.findUnique({
            where: { id: body.linkedArticleId },
            select: { id: true },
          })
          if (!exists) {
            throw createError({
              statusCode: 422,
              message: `linkedArticleId ${body.linkedArticleId} does not exist`,
            })
          }
        }
        data.linkedArticleId = body.linkedArticleId
      }

      return tx.gameEvent.update({ where: { id }, data })
    })

    await logActivity(
      event,
      'UPDATE',
      'events',
      `Updated event: ${gameEvent.titleEn || gameEvent.titleTh}`,
      id,
    )

    return gameEvent
  } catch (err) {
    const conflict = toDuplicateConflictError(err as never, { resource: 'GameEvent' })
    if (conflict) throw conflict
    throw err
  }
})

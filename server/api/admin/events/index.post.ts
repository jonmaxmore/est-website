/**
 * POST /api/admin/events — create a new game event
 * Validates linkedArticleId inside the create transaction so an admin
 * can't link to a deleted article (FK error / orphan link).
 */
import { toDuplicateConflictError } from '../../../utils/prisma-errors'
import { eventCreateSchema } from '../../../utils/schemas-events'

export default defineEventHandler(async (event) => {
  const parsed = eventCreateSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: 'Validation error',
      data: parsed.error.flatten(),
    })
  }
  const body = parsed.data

  if (new Date(body.endsAt) <= new Date(body.startsAt)) {
    throw createError({ statusCode: 400, message: 'End time must be after start time.' })
  }

  try {
    const gameEvent = await prisma.$transaction(async (tx) => {
      if (body.linkedArticleId) {
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

      return tx.gameEvent.create({
        data: {
          titleEn: body.titleEn,
          titleTh: body.titleTh,
          descriptionEn: body.descriptionEn ?? null,
          descriptionTh: body.descriptionTh ?? null,
          type: body.type,
          status: body.status,
          startsAt: new Date(body.startsAt),
          endsAt: new Date(body.endsAt),
          timezone: body.timezone,
          multiplier: body.type === 'HOT_TIME' ? body.multiplier ?? null : null,
          bonusType: body.type === 'HOT_TIME' ? body.bonusType ?? null : null,
          bannerImage: body.bannerImage ?? null,
          icon: body.icon ?? null,
          color: body.color ?? null,
          visible: body.visible,
          campaignCode: body.campaignCode ?? null,
          linkedArticleId: body.linkedArticleId ?? null,
        },
      })
    })

    await logActivity(
      event,
      'CREATE',
      'events',
      `Created event: ${gameEvent.titleEn || gameEvent.titleTh}`,
      gameEvent.id,
    )

    return gameEvent
  } catch (err) {
    const conflict = toDuplicateConflictError(err as never, { resource: 'GameEvent' })
    if (conflict) throw conflict
    throw err
  }
})

/** Update a game event */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)

  // Validate date order if both provided
  if (body.startsAt && body.endsAt && new Date(body.endsAt) <= new Date(body.startsAt)) {
    throw createError({ statusCode: 400, message: 'End time must be after start time.' })
  }

  const data: Record<string, unknown> = {}
  if (body.titleEn !== undefined) data.titleEn = body.titleEn
  if (body.titleTh !== undefined) data.titleTh = body.titleTh
  if (body.descriptionEn !== undefined) data.descriptionEn = body.descriptionEn || null
  if (body.descriptionTh !== undefined) data.descriptionTh = body.descriptionTh || null
  if (body.type !== undefined) data.type = body.type
  if (body.status !== undefined) data.status = body.status
  if (body.startsAt !== undefined) data.startsAt = new Date(body.startsAt)
  if (body.endsAt !== undefined) data.endsAt = new Date(body.endsAt)
  if (body.timezone !== undefined) data.timezone = body.timezone
  if (body.multiplier !== undefined) data.multiplier = body.multiplier
  if (body.bonusType !== undefined) data.bonusType = body.bonusType
  if (body.bannerImage !== undefined) data.bannerImage = body.bannerImage || null
  if (body.icon !== undefined) data.icon = body.icon
  if (body.color !== undefined) data.color = body.color
  if (body.visible !== undefined) data.visible = body.visible
  if (body.campaignCode !== undefined) data.campaignCode = body.campaignCode || null
  if (body.linkedArticleId !== undefined) data.linkedArticleId = body.linkedArticleId ? Number(body.linkedArticleId) : null

  const gameEvent = await prisma.gameEvent.update({ where: { id }, data })

  await logActivity(event, 'UPDATE', 'events', `Updated event: ${gameEvent.titleEn || gameEvent.titleTh}`, id)

  return gameEvent
})

/** Create a new game event */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Server-side validation
  if (!body.titleEn && !body.titleTh) {
    throw createError({ statusCode: 400, message: 'At least one title (EN or TH) is required.' })
  }
  if (!body.startsAt || !body.endsAt) {
    throw createError({ statusCode: 400, message: 'Start and end times are required.' })
  }
  if (new Date(body.endsAt) <= new Date(body.startsAt)) {
    throw createError({ statusCode: 400, message: 'End time must be after start time.' })
  }
  if (!body.type) {
    throw createError({ statusCode: 400, message: 'Event type is required.' })
  }

  const gameEvent = await prisma.gameEvent.create({
    data: {
      titleEn: body.titleEn || '',
      titleTh: body.titleTh || '',
      descriptionEn: body.descriptionEn || null,
      descriptionTh: body.descriptionTh || null,
      type: body.type,
      status: body.status || 'SCHEDULED',
      startsAt: new Date(body.startsAt),
      endsAt: new Date(body.endsAt),
      timezone: body.timezone || 'Asia/Bangkok',
      multiplier: body.type === 'HOT_TIME' ? (body.multiplier || null) : null,
      bonusType: body.type === 'HOT_TIME' ? (body.bonusType || null) : null,
      bannerImage: body.bannerImage || null,
      icon: body.icon || null,
      color: body.color || null,
      visible: body.visible !== false,
    },
  })

  await logActivity(event, 'CREATE', 'events', `Created event: ${gameEvent.titleEn || gameEvent.titleTh}`, gameEvent.id)

  return gameEvent
})

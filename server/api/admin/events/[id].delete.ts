/** Delete a game event */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const gameEvent = await prisma.gameEvent.findUnique({
    where: { id },
    select: { titleEn: true, titleTh: true },
  })

  await prisma.gameEvent.delete({ where: { id } })

  await logActivity(event, 'DELETE', 'events', `Deleted event: ${gameEvent?.titleEn || gameEvent?.titleTh || id}`, id)

  return { success: true }
})

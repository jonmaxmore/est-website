export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, message: 'Invalid milestone id' })
  }

  await prisma.milestone.delete({ where: { id } })
  await logActivity(event, 'DELETE', 'milestones', `Deleted milestone: ${id}`, String(id))

  return { success: true }
})

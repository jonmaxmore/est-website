/** Admin — delete a feature */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  await prisma.feature.delete({ where: { id } })
  await logActivity(event, 'DELETE', 'features', `Deleted feature #${id}`, String(id))
  return { success: true }
})

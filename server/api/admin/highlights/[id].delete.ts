/** Admin — delete a highlight */
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid ID' })

  await prisma.highlight.delete({ where: { id } })
  await logActivity(event, 'DELETE', 'highlights', `Deleted highlight #${id}`, String(id))
  return { success: true }
})

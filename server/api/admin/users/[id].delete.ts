export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  await prisma.adminUser.delete({ where: { id } })
  return { success: true }
})

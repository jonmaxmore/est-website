export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  // Get user info before deleting for the activity log
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: { displayName: true, email: true },
  })

  await prisma.adminUser.delete({ where: { id } })

  await logActivity(event, 'DELETE', 'users', `Deleted user: ${user?.displayName || id} (${user?.email || 'unknown'})`, id)

  return { success: true }
})

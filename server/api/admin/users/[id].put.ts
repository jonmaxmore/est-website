

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const data: Record<string, unknown> = {}

  if (body.displayName) data.displayName = body.displayName
  if (body.email) data.email = body.email
  if (body.role) data.role = body.role
  if (body.password) data.passwordHash = await hashAdminPassword(body.password)

  const user = await prisma.adminUser.update({
    where: { id },
    data,
    select: { id: true, email: true, displayName: true, role: true },
  })

  await logActivity(event, 'UPDATE', 'users', `Updated user: ${user.displayName} (${user.email})`, id)

  return user
})

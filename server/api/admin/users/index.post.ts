

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { displayName, email, password, role } = body

  if (!displayName || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const passwordHash = await hashAdminPassword(password)
  const user = await prisma.adminUser.create({
    data: { displayName, email, passwordHash, role: role || 'EDITOR' },
    select: { id: true, email: true, displayName: true, role: true },
  })
  return user
})

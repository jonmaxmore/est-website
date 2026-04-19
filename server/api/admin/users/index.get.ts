export default defineEventHandler(async () => {
  const users = await prisma.adminUser.findMany({
    select: { id: true, email: true, displayName: true, role: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return users
})

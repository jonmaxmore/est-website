/**
 * DELETE /api/admin/users/[id] — ลบ admin user
 * เฉพาะ SUPER_ADMIN (บังคับใน middleware)
 *
 * Invariants:
 * - ห้ามลบตัวเอง (ป้องกัน lockout โดยไม่ตั้งใจ)
 * - ห้ามลบ SUPER_ADMIN คนสุดท้าย
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
  }

  const session = await getUserSession(event)
  const currentUser = session?.user as { id: string } | undefined

  if (currentUser?.id === id) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: 'Cannot delete your own account',
    })
  }

  const target = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, role: true, email: true, displayName: true },
  })
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (target.role === 'SUPER_ADMIN') {
    const superAdminCount = await prisma.adminUser.count({ where: { role: 'SUPER_ADMIN' } })
    if (superAdminCount <= 1) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'Cannot delete the last SUPER_ADMIN',
      })
    }
  }

  await prisma.adminUser.delete({ where: { id } })

  await logActivity(
    event,
    'DELETE',
    'users',
    `Deleted user: ${target.displayName} (${target.email})`,
    id,
  )

  return { success: true }
})

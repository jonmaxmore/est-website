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

  // ── Atomic last-SUPER_ADMIN guard ──
  // Concurrent deletes could each see count > 1 and both delete, dropping the
  // last admin. Hold a transactional advisory lock so only one quorum-affecting
  // delete proceeds at a time across the whole DB.
  const target = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(74115001)`

    const row = await tx.adminUser.findUnique({
      where: { id },
      select: { id: true, role: true, email: true, displayName: true },
    })
    if (!row) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    if (row.role === 'SUPER_ADMIN') {
      const superAdminCount = await tx.adminUser.count({ where: { role: 'SUPER_ADMIN' } })
      if (superAdminCount <= 1) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          message: 'Cannot delete the last SUPER_ADMIN',
        })
      }
    }

    await tx.adminUser.delete({ where: { id } })
    return row
  })

  logActivity(
    event,
    'DELETE',
    'users',
    `Deleted user: ${target.displayName} (${target.email})`,
    id,
  )

  return { success: true }
})

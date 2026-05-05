/**
 * PUT /api/admin/users/[id] — แก้ไข admin user
 * เฉพาะ SUPER_ADMIN (บังคับใน middleware)
 *
 * Invariants:
 * - ห้ามลด SUPER_ADMIN คนสุดท้ายเป็น EDITOR (ระบบจะไม่มีคนจัดการ)
 * - ตรวจ enum role ผ่าน zod (กัน privilege escalation ผ่าน body injection)
 */
import { z } from 'zod'
import { rethrowAsInternalError, toDuplicateConflictError } from '../../../utils/prisma-errors'

const updateUserSchema = z
  .object({
    displayName: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().toLowerCase().email().max(255).optional(),
    password: z.string().min(8).max(200).optional(),
    role: z.enum(['SUPER_ADMIN', 'EDITOR']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
  }

  const body = await readBody(event)
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten(),
    })
  }

  // Demotion check + update share an advisory lock with the delete handler so
  // concurrent demote+delete can't drop the last SUPER_ADMIN between them.
  const data: Record<string, unknown> = {}
  if (parsed.data.displayName !== undefined) data.displayName = parsed.data.displayName
  if (parsed.data.email !== undefined) data.email = parsed.data.email
  if (parsed.data.role !== undefined) data.role = parsed.data.role
  if (parsed.data.password !== undefined) {
    data.passwordHash = await hashAdminPassword(parsed.data.password)
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(74115001)`

      const target = await tx.adminUser.findUnique({
        where: { id },
        select: { id: true, role: true, email: true, displayName: true },
      })
      if (!target) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
      }

      if (parsed.data.role === 'EDITOR' && target.role === 'SUPER_ADMIN') {
        const superAdminCount = await tx.adminUser.count({ where: { role: 'SUPER_ADMIN' } })
        if (superAdminCount <= 1) {
          throw createError({
            statusCode: 409,
            statusMessage: 'Conflict',
            message: 'Cannot demote the last SUPER_ADMIN — promote another user first',
          })
        }
      }

      return tx.adminUser.update({
        where: { id },
        data,
        select: { id: true, email: true, displayName: true, role: true },
      })
    })

    logActivity(
      event,
      'UPDATE',
      'users',
      `Updated user: ${user.displayName} (${user.email})`,
      id,
    )

    return user
  } catch (err) {
    const conflict = toDuplicateConflictError(err as never, { resource: 'AdminUser' })
    if (conflict) throw conflict
    rethrowAsInternalError(err, 'Admin Users PUT')
  }
})

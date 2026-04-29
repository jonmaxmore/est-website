/**
 * POST /api/admin/users — สร้าง admin user ใหม่
 * เฉพาะ SUPER_ADMIN เท่านั้น (บังคับใน middleware/admin-auth.ts)
 */
import { z } from 'zod'
import { toDuplicateConflictError } from '../../../utils/prisma-errors'

const createUserSchema = z.object({
  displayName: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200),
  role: z.enum(['SUPER_ADMIN', 'EDITOR']).default('EDITOR'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = createUserSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: parsed.error.flatten(),
    })
  }

  const { displayName, email, password, role } = parsed.data
  const passwordHash = await hashAdminPassword(password)

  try {
    const user = await prisma.adminUser.create({
      data: { displayName, email, passwordHash, role },
      select: { id: true, email: true, displayName: true, role: true },
    })

    await logActivity(
      event,
      'CREATE',
      'users',
      `Created user: ${displayName} (${email}) role=${role}`,
      user.id,
    )

    return user
  } catch (err) {
    const conflict = toDuplicateConflictError(err as never, { resource: 'AdminUser' })
    if (conflict) throw conflict
    throw err
  }
})

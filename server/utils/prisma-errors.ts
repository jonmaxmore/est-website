/**
 * ═══ Prisma Error Handler ═══
 * แปลง error จาก Prisma ORM ให้เป็น HTTP error ที่เข้าใจง่าย
 *
 * ตัวอย่าง: email ซ้ำ → 409 Conflict "AdminUser already exists (duplicate email)"
 */
import { createError } from 'h3'

type PrismaLikeError = {
  code?: string
  meta?: {
    target?: string[] | string
  }
}

/** ดึงชื่อ field ที่ซ้ำจาก Prisma error metadata */
function getDuplicateFields(error: PrismaLikeError) {
  const target = error.meta?.target
  if (Array.isArray(target)) return target.filter(Boolean)
  if (typeof target === 'string' && target.length > 0) return [target]
  return []
}

/**
 * แปลง Prisma P2002 (unique constraint violation) → HTTP 409 Conflict
 * ถ้าไม่ใช่ P2002 → คืน null (ให้ caller จัดการเอง)
 */
export function toDuplicateConflictError(
  error: PrismaLikeError,
  options: { resource: string },
) {
  if (error?.code !== 'P2002') return null

  const fields = getDuplicateFields(error)
  const duplicateSuffix = fields.length > 0 ? ` (duplicate ${fields.join(', ')})` : ''

  return createError({
    statusCode: 409,
    statusMessage: 'Conflict',
    message: `${options.resource} already exists${duplicateSuffix}`,
    data: fields.length > 0 ? { fields } : undefined,
  })
}

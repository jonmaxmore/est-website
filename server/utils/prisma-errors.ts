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

/**
 * แปลง Prisma P2025 (record not found on update/delete) → HTTP 404
 * ถ้าไม่ใช่ P2025 → คืน null
 */
export function toNotFoundError(error: PrismaLikeError, options: { resource: string }) {
  if (error?.code !== 'P2025') return null
  return createError({ statusCode: 404, message: `${options.resource} not found` })
}

/**
 * เปลี่ยน Prisma error ที่ไม่รู้จักให้เป็น generic 500 — ป้องกัน schema/path
 * leak ออกไปทาง response.message (P1001 connection string, P2003 column name
 * ฯลฯ). คงสำหรับ caller log ไว้เอง.
 *
 * Usage: ใน catch block ของ admin endpoints หลังตรวจ P2002/P2025 แล้วยังไม่
 * เจอที่ตรง → throw rethrowAsInternalError(err, 'Resource X')
 */
export function rethrowAsInternalError(error: unknown, scope: string): never {
  // Already an H3-shaped error (createError) — surface as-is, the framework
  // will use its own statusCode/message.
  const e = error as { statusCode?: number }
  if (typeof e?.statusCode === 'number') {
    throw error
  }
  console.error(`[${scope}] unexpected error:`, error)
  throw createError({ statusCode: 500, message: 'Internal server error' })
}

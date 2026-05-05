/**
 * ═══ Response Shape Helpers ═══
 * Standardize API response shapes ทั้งโปรเจค
 *
 * List endpoints คืน:  { data: T[], meta: { total, page, limit, totalPages } }
 * Single resource:     T (object ตรงๆ)
 *
 * ใช้:
 *   const { data, meta } = await fetchWithPagination(...)
 *   return paginated(items, { total, page, limit })
 */
import { createError, getRouterParam, type H3Event } from 'h3'

export type PaginationMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

/** สร้าง response ที่มี pagination metadata */
export function paginated<T>(
  data: T[],
  opts: { total: number; page: number; limit: number },
): PaginatedResponse<T> {
  const totalPages = opts.limit > 0 ? Math.ceil(opts.total / opts.limit) : 0
  return {
    data,
    meta: {
      total: opts.total,
      page: opts.page,
      limit: opts.limit,
      totalPages,
    },
  }
}

/**
 * Parse pagination params จาก query string + clamp ค่าให้อยู่ในช่วง
 * @example
 *   const { page, limit, skip, take } = parsePagination(getQuery(event))
 */
export function parsePagination(query: Record<string, unknown>, opts?: { defaultLimit?: number; maxLimit?: number }) {
  const defaultLimit = opts?.defaultLimit ?? 20
  const maxLimit = opts?.maxLimit ?? 100

  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit))

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  }
}

/**
 * Standard success envelope for write operations (POST/PUT/DELETE).
 * All admin write handlers should return this shape so frontend can rely on
 * `result.success` and optional `result.data` consistently.
 */
export function ok<T = undefined>(data?: T) {
  return data === undefined ? { success: true as const } : { success: true as const, data }
}

/**
 * Parse a positive integer route param (id), throwing 400 on invalid input.
 * Use as: const id = parseIdParam(event, 'id')
 */
export function parseIdParam(event: H3Event, name: string) {
  const raw = getRouterParam(event, name)
  const num = Number(raw)
  if (!Number.isInteger(num) || num <= 0) {
    throw createError({ statusCode: 400, message: `Invalid ${name}` })
  }
  return num
}

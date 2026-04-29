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

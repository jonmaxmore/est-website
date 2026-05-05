/**
 * GET /api/integration/export/news — JSON export of PUBLISHED news for external integrations
 *
 * Auth: requires `Authorization: Bearer <token>` matching env INTEGRATION_EXPORT_TOKEN
 * (constant-time compared). Returning 401 on mismatch and 503 if the token isn't
 * configured in the environment, so a missing-config doesn't accidentally leak.
 *
 * Rate limit: 30 req/min/IP — enough for paginated polling, not for scraping.
 *
 * Pagination: `?limit=N&cursor=ID` returns up to 200 rows (default 50). The
 * cursor is the last article id from the previous page.
 */
import { timingSafeEqual } from 'node:crypto'
import { checkRateLimit } from '../../../utils/redis'

export default defineEventHandler(async (event) => {
  // ── Auth ──
  const expectedToken = process.env.INTEGRATION_EXPORT_TOKEN
  if (!expectedToken) {
    throw createError({ statusCode: 503, message: 'Integration export not configured' })
  }
  const auth = getRequestHeader(event, 'authorization') || ''
  const provided = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
  if (!provided || !safeEqual(provided, expectedToken)) {
    throw createError({ statusCode: 401, message: 'Invalid or missing integration token' })
  }

  // ── Rate limit (per-IP because the token is shared across consumers) ──
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const rate = await checkRateLimit(`integration:export:${ip}`, 30, 60)
  if (!rate.allowed) {
    throw createError({ statusCode: 429, message: 'Rate limit exceeded' })
  }

  // ── Query (bounded + cursor-paginated) ──
  const query = getQuery(event)
  const limit = Math.min(200, Math.max(1, Number(query.limit) || 50))
  const cursor = Number(query.cursor)
  const news = await prisma.newsArticle.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { id: 'desc' },
    take: limit,
    ...(Number.isInteger(cursor) && cursor > 0 ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, slug: true, titleEn: true, titleTh: true, excerptEn: true, excerptTh: true, category: true, publishedAt: true },
  })

  const nextCursor = news.length === limit ? news[news.length - 1].id : null
  return { data: news, meta: { count: news.length, nextCursor } }
})

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

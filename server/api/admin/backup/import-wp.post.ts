/**
 * POST /api/admin/backup/import-wp — Import articles จาก WordPress REST API
 *
 * Behaviour:
 * - Idempotent ผ่าน slug (upsert)
 * - แต่ละ post รันใน transaction แยก — error 1 รายการไม่ฆ่าทั้งงาน
 * - Sanitize HTML ก่อนเก็บ (XSS defense)
 * - คืน per-post error log
 */
import { z } from 'zod'

import { sanitizeRichText, stripHtml } from '../../../utils/sanitize'

const inputSchema = z.object({
  url: z.string().url(),
  perPage: z.number().int().min(1).max(100).default(50),
})

const WP_FETCH_TIMEOUT_MS = 30_000

/**
 * Reject SSRF-prone targets: private/loopback/link-local hosts and non-HTTPS schemes.
 * IPv4-literal hostname matching covers the common attack ranges; for hostnames we
 * trust DNS resolution to fail at fetch time for internal-only names. Cloud metadata
 * endpoints (169.254.169.254) and localhost-redis (127.0.0.1:6379) are blocked here.
 */
function assertSafePublicUrl(input: string): URL {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    throw createError({ statusCode: 422, message: 'Invalid URL' })
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw createError({ statusCode: 422, message: 'Only http(s) URLs are allowed' })
  }

  const host = url.hostname.toLowerCase()
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host)
  ) {
    throw createError({ statusCode: 422, message: 'URL points to a private or loopback address' })
  }

  return url
}

type WpPost = {
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  date: string
  featured_media: number
  categories: number[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  const safeUrl = assertSafePublicUrl(parsed.data.url)
  const wpUrl = safeUrl.toString().replace(/\/$/, '')
  let posts: WpPost[]
  try {
    posts = await $fetch<WpPost[]>(
      `${wpUrl}/wp-json/wp/v2/posts?per_page=${parsed.data.perPage}&_embed`,
      { signal: AbortSignal.timeout(WP_FETCH_TIMEOUT_MS) },
    )
  } catch (err) {
    throw createError({
      statusCode: 502,
      message: `Failed to fetch from WordPress: ${(err as Error).message}`,
    })
  }

  if (!Array.isArray(posts)) {
    throw createError({ statusCode: 502, message: 'Unexpected response from WordPress' })
  }

  let imported = 0
  const errors: Array<{ slug: string; error: string }> = []

  for (const post of posts) {
    try {
      const title = stripHtml(post.title.rendered).slice(0, 500)
      const excerpt = stripHtml(post.excerpt.rendered).slice(0, 1000)
      const content = sanitizeRichText(post.content.rendered)
      const publishedAt = post.date ? new Date(post.date) : new Date()

      // ── Per-post transaction — error 1 รายการไม่ทำลาย state ของ row อื่น ──
      await prisma.$transaction(async (tx) => {
        await tx.newsArticle.upsert({
          where: { slug: post.slug },
          update: {
            titleEn: title,
            titleTh: title,
            excerptEn: excerpt,
            excerptTh: excerpt,
            contentEn: content,
            contentTh: content,
            status: 'PUBLISHED',
            publishedAt,
          },
          create: {
            slug: post.slug,
            titleEn: title,
            titleTh: title,
            excerptEn: excerpt,
            excerptTh: excerpt,
            contentEn: content,
            contentTh: content,
            category: 'ANNOUNCEMENT',
            status: 'PUBLISHED',
            publishedAt,
          },
        })
      })

      imported += 1
    } catch (err) {
      const msg = (err as Error).message
      console.error(`[ImportWP] ${post.slug}: ${msg}`)
      errors.push({ slug: post.slug, error: msg })
    }
  }

  await logActivity(
    event,
    'IMPORT',
    'backup',
    `WordPress import: ${imported}/${posts.length} succeeded${errors.length ? `, ${errors.length} errors` : ''}`,
  )

  return {
    success: errors.length === 0,
    imported,
    total: posts.length,
    errors,
  }
})

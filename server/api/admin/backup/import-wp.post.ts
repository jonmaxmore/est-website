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

  const wpUrl = parsed.data.url.replace(/\/$/, '')
  let posts: WpPost[]
  try {
    posts = await $fetch<WpPost[]>(
      `${wpUrl}/wp-json/wp/v2/posts?per_page=${parsed.data.perPage}&_embed`,
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

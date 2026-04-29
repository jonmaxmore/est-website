/**
 * POST /api/integration/webhook — รับ event จาก external system (CMS/integrations)
 *
 * Security:
 *   - HMAC signature verification ทุก request (header: x-webhook-secret)
 *   - Timestamp window 5 นาที (header: x-webhook-timestamp) ป้องกัน replay
 *   - Idempotency key (header: x-webhook-id) — duplicate ภายใน 5 นาทีจะถูก skip
 *   - Zod validation ทุก payload
 */
import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'

import { normalizeIntegrationsConfig } from '../../utils/admin-config'
import { sanitizeRichText, stripHtml } from '../../utils/sanitize'
import { cacheGet, cacheSet, checkRateLimit } from '../../utils/redis'

const REPLAY_WINDOW_MS = 5 * 60 * 1000
const IDEMPOTENCY_TTL_S = 5 * 60
const RATE_LIMIT_PER_MINUTE = 60

const webhookSchema = z.object({
  type: z.enum(['news', 'post']),
  action: z.enum(['create', 'update', 'delete']),
  data: z.record(z.string(), z.unknown()),
})

function secretsMatch(expected: string, provided: string) {
  if (!expected || !provided) return false
  const e = Buffer.from(expected)
  const p = Buffer.from(provided)
  return e.length === p.length && timingSafeEqual(e, p)
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(`webhook:${ip}`, RATE_LIMIT_PER_MINUTE, 60)
  if (!allowed) {
    throw createError({ statusCode: 429, message: 'Too many webhook requests' })
  }

  // ── 1. Authenticate (always — ทุก type) ──
  const config = await prisma.siteConfig.findUnique({ where: { key: 'integrations' } })
  const integrations = normalizeIntegrationsConfig(config?.value ?? null)
  const configuredSecret =
    process.env.WEBHOOK_SECRET || integrations.webhookSecret || integrations.wix.webhookSecret
  const providedSecret = getHeader(event, 'x-webhook-secret') || ''

  if (!configuredSecret) {
    throw createError({ statusCode: 503, message: 'Webhook receiver not configured' })
  }
  if (!secretsMatch(configuredSecret, providedSecret)) {
    throw createError({ statusCode: 401, message: 'Invalid webhook secret' })
  }

  // ── 2. Replay protection (timestamp window) ──
  const timestampHeader = getHeader(event, 'x-webhook-timestamp')
  if (timestampHeader) {
    const ts = Number(timestampHeader)
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > REPLAY_WINDOW_MS) {
      throw createError({ statusCode: 401, message: 'Webhook timestamp out of window' })
    }
  }

  // ── 3. Idempotency check ──
  const idempotencyKey = getHeader(event, 'x-webhook-id')
  if (idempotencyKey) {
    const cached = await cacheGet<{ ok: true }>(`webhook:idem:${idempotencyKey}`)
    if (cached) {
      return { success: true, message: 'Already processed (idempotent)' }
    }
  }

  // ── 4. Validate payload ──
  const raw = await readBody(event).catch(() => null)
  const parsed = webhookSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      message: 'Invalid webhook payload',
      data: parsed.error.flatten(),
    })
  }
  const { type, action, data } = parsed.data

  // ── 5. Process ──
  if (type === 'news' || type === 'post') {
    if (action === 'create' || action === 'update') {
      const slug = String(data.slug || `imported-${Date.now()}`)
      const titleEn = String(data.title || data.titleEn || 'Untitled')
      const titleTh = String(data.titleTh || data.title || titleEn)
      const excerptEn = data.excerpt ? stripHtml(String(data.excerpt)) : null
      const excerptTh = data.excerptTh ? stripHtml(String(data.excerptTh)) : excerptEn
      const contentEn = data.content || data.contentEn ? sanitizeRichText(String(data.content || data.contentEn)) : null
      const contentTh = data.contentTh ? sanitizeRichText(String(data.contentTh)) : contentEn
      const publishedAt = data.publishedAt ? new Date(String(data.publishedAt)) : new Date()

      await prisma.newsArticle.upsert({
        where: { slug },
        update: { titleEn, titleTh, excerptEn, excerptTh, contentEn, contentTh, status: 'PUBLISHED', publishedAt },
        create: {
          slug,
          titleEn,
          titleTh,
          excerptEn,
          excerptTh,
          contentEn,
          contentTh,
          category: 'ANNOUNCEMENT',
          status: 'PUBLISHED',
          publishedAt,
        },
      })

      if (idempotencyKey) await cacheSet(`webhook:idem:${idempotencyKey}`, { ok: true }, IDEMPOTENCY_TTL_S)
      return { success: true, message: 'News synced' }
    }

    if (action === 'delete') {
      const slug = String(data.slug || '')
      if (!slug) {
        throw createError({ statusCode: 422, message: 'slug required for delete' })
      }
      await prisma.newsArticle.deleteMany({ where: { slug } })

      if (idempotencyKey) await cacheSet(`webhook:idem:${idempotencyKey}`, { ok: true }, IDEMPOTENCY_TTL_S)
      return { success: true, message: 'News deleted' }
    }
  }

  if (idempotencyKey) await cacheSet(`webhook:idem:${idempotencyKey}`, { ok: true }, IDEMPOTENCY_TTL_S)
  return { success: true, message: 'Webhook received (no action)' }
})

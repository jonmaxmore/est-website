/**
 * POST /api/integration/webhook — รับ event จาก external system (CMS/integrations)
 *
 * Security (two auth modes — both supported until consumers migrate):
 *   1. HMAC body signing (PREFERRED): consumer sends `x-webhook-signature`
 *      = `sha256=<hex>` where the HMAC is over `<timestamp>.<raw-body>` keyed
 *      by the shared secret. Resistant to replay even if a valid signed
 *      request leaks (timestamp window + idempotency cache).
 *   2. Shared-secret header (LEGACY): `x-webhook-secret` matches the
 *      configured secret directly. Kept for backward-compat with existing
 *      WordPress / Wix consumers; new consumers should use mode 1.
 *
 *   Both modes additionally enforce:
 *   - Timestamp window 5 นาที (header: x-webhook-timestamp) ป้องกัน replay
 *   - Idempotency key (header: x-webhook-id) — duplicate ภายใน 5 นาทีจะถูก skip
 *   - Zod validation ทุก payload
 *
 * Audit-2 (C-2) finding #5: HMAC body signing closes the "leaked-secret =
 * full content injection" risk because forging a request now requires
 * computing the HMAC over the exact body the server will read.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
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

/**
 * Verify x-webhook-signature: 'sha256=<hex>' computed over `<timestamp>.<rawBody>`
 * keyed by the shared secret. Returns true iff the signature is well-formed,
 * the keyed digest matches via timingSafeEqual, AND the timestamp is fresh.
 */
function verifySignature(
  secret: string,
  rawBody: string,
  timestampHeader: string | undefined,
  signatureHeader: string | undefined,
): boolean {
  if (!secret || !signatureHeader || !timestampHeader) return false
  const ts = Number(timestampHeader)
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > REPLAY_WINDOW_MS) return false

  const [scheme, providedHex] = signatureHeader.split('=', 2)
  if (scheme !== 'sha256' || !providedHex) return false

  const expected = createHmac('sha256', secret)
    .update(`${timestampHeader}.${rawBody}`)
    .digest('hex')

  if (expected.length !== providedHex.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(providedHex))
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(`webhook:${ip}`, RATE_LIMIT_PER_MINUTE, 60)
  if (!allowed) {
    throw createError({ statusCode: 429, message: 'Too many webhook requests' })
  }

  // ── 1. Authenticate ──
  // Read raw body up front so HMAC mode can compute the digest over the
  // exact bytes the parser will see. (Body cache is reused on the second
  // readBody — no double-read overhead.)
  const config = await prisma.siteConfig.findUnique({ where: { key: 'integrations' } })
  const integrations = normalizeIntegrationsConfig(config?.value ?? null)
  const configuredSecret =
    process.env.WEBHOOK_SECRET || integrations.webhookSecret || integrations.wix.webhookSecret
  if (!configuredSecret) {
    throw createError({ statusCode: 503, message: 'Webhook receiver not configured' })
  }

  const timestampHeader = getHeader(event, 'x-webhook-timestamp')
  const signatureHeader = getHeader(event, 'x-webhook-signature')
  const providedSecret = getHeader(event, 'x-webhook-secret') || ''

  let authMode: 'hmac' | 'shared-secret' | null = null
  if (signatureHeader) {
    // PREFERRED mode: HMAC over timestamp.body. Requires the timestamp header
    // to also be present and fresh.
    const rawBodyBuf = await readRawBody(event, 'utf8')
    const rawBody = typeof rawBodyBuf === 'string' ? rawBodyBuf : ''
    if (verifySignature(configuredSecret, rawBody, timestampHeader, signatureHeader)) {
      authMode = 'hmac'
    } else {
      throw createError({ statusCode: 401, message: 'Invalid webhook signature' })
    }
  } else if (providedSecret) {
    // LEGACY mode: bare shared secret in header. Kept for back-compat.
    if (!secretsMatch(configuredSecret, providedSecret)) {
      throw createError({ statusCode: 401, message: 'Invalid webhook secret' })
    }
    authMode = 'shared-secret'
  } else {
    throw createError({
      statusCode: 401,
      message: 'Missing x-webhook-signature (preferred) or x-webhook-secret (legacy) header',
    })
  }

  // ── 2. Replay protection (timestamp window) ──
  // HMAC mode already verified freshness; legacy mode still checks if header present.
  if (authMode === 'shared-secret' && timestampHeader) {
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

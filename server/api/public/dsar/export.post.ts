/**
 * POST /api/public/dsar/export — Data Subject Access Request (export all data)
 *
 * GDPR Art. 15 / PDPA s.30: a user can request a copy of all personal data
 * the site holds about them. We have very little PII in scope:
 *  - Subscriber row (email, locale, status, UTM at signup)
 *  - PageView / ConversionEvent rows are NOT exportable per-user because
 *    visitorId rotates daily by design — there's no stable join from email
 *    back to those rows. We disclose this in the response.
 *
 * Authentication: email + emailToken sent in the user's previous newsletter
 * confirmation email. Without an account system, this is the strongest
 * proof-of-ownership we can offer without re-implementing OTP.
 *
 * Rate limit: 3 / hour / IP — these requests are expensive and rarely repeated.
 *
 * Audit-2 (M-1) finding #7 close.
 */
import { z } from 'zod'
import { timingSafeEqual } from 'node:crypto'

const exportSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  // Either the unsubscribeToken or the confirmToken (whichever the user has)
  token: z.string().min(32).max(128),
})

const RATE_LIMIT_PER_HOUR = 3

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(`dsar:export:${ip}`, RATE_LIMIT_PER_HOUR, 3600)
  if (!allowed) {
    throw createError({ statusCode: 429, message: 'Too many requests. Please try again in an hour.' })
  }

  const parsed = exportSchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Invalid request', data: parsed.error.flatten() })
  }

  const { email, token } = parsed.data
  const subscriber = await prisma.subscriber.findUnique({ where: { email } })
  if (!subscriber) {
    // Generic 200 to prevent email-existence enumeration; no data attached.
    return { email, generated_at: new Date().toISOString(), data: null, note: 'no record found or token invalid' }
  }

  const validToken =
    (subscriber.unsubscribeToken && safeEqualToken(token, subscriber.unsubscribeToken)) ||
    (subscriber.confirmToken && safeEqualToken(token, subscriber.confirmToken))

  if (!validToken) {
    return { email, generated_at: new Date().toISOString(), data: null, note: 'no record found or token invalid' }
  }

  return {
    email,
    generated_at: new Date().toISOString(),
    data: {
      subscriber: {
        email: subscriber.email,
        locale: subscriber.locale,
        status: subscriber.status,
        confirmed_at: subscriber.confirmedAt,
        unsubscribed_at: subscriber.unsubscribedAt,
        utm_source: subscriber.utmSource,
        utm_medium: subscriber.utmMedium,
        utm_campaign: subscriber.utmCampaign,
        created_at: subscriber.createdAt,
        updated_at: subscriber.updatedAt,
      },
    },
    notes: [
      'Page-view and conversion-event analytics are not exportable per-email because visitor IDs rotate daily by design (PDPA-aligned pseudonymization). No stable join exists.',
      'IP addresses, where stored at all (admin activity log only), are hashed with a rotating salt and cannot be reversed.',
    ],
  }
})

function safeEqualToken(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

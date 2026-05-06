/**
 * POST /api/public/dsar/delete — Right to erasure (GDPR Art. 17 / PDPA s.34)
 *
 * Authenticated by the same email + token model as /dsar/export. On success
 * the Subscriber row is hard-deleted (not just status=UNSUBSCRIBED — that's
 * what /unsubscribe is for). Returns 200 even when the record doesn't exist
 * to prevent email-enumeration probes.
 *
 * Out of scope (and disclosed in the response): page_views and
 * conversion_events. Those are pseudonymized at write time — the visitorId
 * rotates daily and is not derivable from email. There is no per-email
 * deletion path because there is no per-email link.
 *
 * Audit-2 (M-1) finding #7 close.
 */
import { z } from 'zod'
import { timingSafeEqual } from 'node:crypto'

const deleteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  token: z.string().min(32).max(128),
})

const RATE_LIMIT_PER_HOUR = 3

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(`dsar:delete:${ip}`, RATE_LIMIT_PER_HOUR, 3600)
  if (!allowed) {
    throw createError({ statusCode: 429, message: 'Too many requests. Please try again in an hour.' })
  }

  const parsed = deleteSchema.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Invalid request', data: parsed.error.flatten() })
  }

  const { email, token } = parsed.data
  const subscriber = await prisma.subscriber.findUnique({ where: { email } })
  if (!subscriber) {
    return { success: true, note: 'request acknowledged' }
  }

  // Confirm token must be unexpired (audit-3 FullStack-5 finding).
  const confirmStillValid =
    !!subscriber.confirmToken &&
    !!subscriber.confirmTokenExp &&
    subscriber.confirmTokenExp > new Date()
  const validToken =
    (subscriber.unsubscribeToken && safeEqualToken(token, subscriber.unsubscribeToken)) ||
    (confirmStillValid && safeEqualToken(token, subscriber.confirmToken!))

  if (!validToken) {
    return { success: true, note: 'request acknowledged' }
  }

  await prisma.subscriber.delete({ where: { id: subscriber.id } })

  return {
    success: true,
    deleted: { subscriber: true },
    notes: [
      'Page-view and conversion-event analytics are pseudonymized at write time (rotating daily visitor-ID hash); no per-email deletion path exists because no per-email link exists.',
      'Admin activity log entries (if any reference this email) retain a hashed IP only — they are not in scope for DSAR per the PDPA exemption for legitimate legal record-keeping.',
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

/**
 * POST /api/public/newsletter/subscribe — Double-opt-in newsletter signup.
 *
 * Flow:
 *  1. POST { email, locale, utm? } from the footer form (or any other capture).
 *  2. Server creates/refreshes a Subscriber row (status=PENDING) with a
 *     fresh 24h confirmToken.
 *  3. Server emails the user a confirm link → /api/public/newsletter/confirm?token=...
 *  4. User clicks → status flips to CONFIRMED + unsubscribeToken issued.
 *
 * Idempotent: the same email can re-submit; we just regenerate the
 * confirm token (so a lost confirm email can be re-sent). UNSUBSCRIBED
 * subscribers can re-subscribe (status flips back to PENDING).
 *
 * Rate limit: 5 signups / hour / IP — generous for legit users, throttles
 * email-bombing abuse.
 */
import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import { hashIp } from '../../../utils/privacy'
import { sendEmail } from '../../../utils/email'

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  locale: z.enum(['th', 'en']).default('th'),
  utm: z
    .object({
      source: z.string().max(64).optional(),
      medium: z.string().max(64).optional(),
      campaign: z.string().max(64).optional(),
    })
    .optional(),
})

const SIGNUP_LIMIT_PER_HOUR = 5
const CONFIRM_TOKEN_TTL_HOURS = 24

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(`newsletter:signup:${ip}`, SIGNUP_LIMIT_PER_HOUR, 3600)
  if (!allowed) {
    throw createError({ statusCode: 429, message: 'Too many signups. Please try again in an hour.' })
  }

  const body = await readBody(event).catch(() => null)
  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 422, message: 'Invalid email', data: parsed.error.flatten() })
  }

  const { email, locale, utm } = parsed.data
  const confirmToken = randomBytes(32).toString('hex')
  const confirmTokenExp = new Date(Date.now() + CONFIRM_TOKEN_TTL_HOURS * 60 * 60 * 1000)
  const ipHash = hashIp(ip)

  await prisma.subscriber.upsert({
    where: { email },
    update: {
      // Re-subscription: regenerate the confirm flow regardless of prior status.
      // Also invalidate the prior unsubscribeToken so a leaked old link can't
      // silently undo the new subscription (audit-3 FullStack-1 M1).
      status: 'PENDING',
      confirmToken,
      confirmTokenExp,
      unsubscribeToken: null,
      utmSource: utm?.source ?? null,
      utmMedium: utm?.medium ?? null,
      utmCampaign: utm?.campaign ?? null,
      locale,
      ipHash,
      unsubscribedAt: null,
    },
    create: {
      email,
      locale,
      status: 'PENDING',
      confirmToken,
      confirmTokenExp,
      utmSource: utm?.source ?? null,
      utmMedium: utm?.medium ?? null,
      utmCampaign: utm?.campaign ?? null,
      ipHash,
    },
  })

  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || ''
  const confirmUrl = `${baseUrl}/api/public/newsletter/confirm?token=${confirmToken}`
  const subject =
    locale === 'th'
      ? 'ยืนยันการสมัครรับข่าวสาร Eternal Tower Saga'
      : 'Confirm your Eternal Tower Saga newsletter signup'

  // Best-effort send. We don't fail the request if email send fails — the
  // operator can re-run a confirm-resend job. The Subscriber row already
  // exists; the user can re-submit to regenerate the token.
  await sendEmail({
    to: email,
    subject,
    html: buildConfirmHtml(confirmUrl, locale),
    text: `Confirm: ${confirmUrl}`,
  }).catch(() => {})

  return { success: true, message: 'Confirmation email sent. Please check your inbox.' }
})

function buildConfirmHtml(confirmUrl: string, locale: 'th' | 'en'): string {
  if (locale === 'th') {
    return `<p>ขอบคุณที่สมัครรับข่าวสาร Eternal Tower Saga</p>
<p>กรุณายืนยันอีเมลของคุณภายใน 24 ชั่วโมง:</p>
<p><a href="${confirmUrl}">ยืนยันการสมัคร</a></p>
<p>ถ้าคุณไม่ได้สมัคร โปรดเพิกเฉยอีเมลนี้</p>`
  }
  return `<p>Thanks for subscribing to Eternal Tower Saga.</p>
<p>Please confirm your email within 24 hours:</p>
<p><a href="${confirmUrl}">Confirm subscription</a></p>
<p>If you didn't sign up, you can safely ignore this email.</p>`
}

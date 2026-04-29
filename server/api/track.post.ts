import { toStoredTrackingPayload } from '../../app/shared/tracking/events'
import { redactReferrer, truncateUserAgent } from '../utils/privacy'

const TRACKING_EVENT_LIMIT_PER_MINUTE = 120

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const { allowed } = await checkRateLimit(`track:${ip}`, TRACKING_EVENT_LIMIT_PER_MINUTE, 60)

  if (!allowed) {
    throw createError({ statusCode: 429, message: 'Too many tracking events.' })
  }

  let body: unknown
  try {
    body = await readBody(event)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid request body' })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, message: 'Request body must be a JSON object.' })
  }

  const input = body as { eventName?: unknown; eventData?: unknown }
  if (typeof input.eventName !== 'string') {
    throw createError({ statusCode: 400, message: 'eventName is required.' })
  }

  let payload: ReturnType<typeof toStoredTrackingPayload>
  try {
    payload = toStoredTrackingPayload(input.eventName, input.eventData ?? {})
  } catch (error) {
    throw createError({ statusCode: 400, message: (error as Error).message })
  }

  const sessionId = getCookie(event, '__ets_sid') || `s-${Date.now().toString(36)}`
  if (!getCookie(event, '__ets_sid')) {
    setCookie(event, '__ets_sid', sessionId, { maxAge: 1800, httpOnly: true, sameSite: 'lax' })
  }

  // ── PDPA: ตัด PII ก่อนเก็บลง DB ──
  const safeReferrer = redactReferrer(getRequestHeader(event, 'referer'))
  const safeUserAgent = truncateUserAgent(getRequestHeader(event, 'user-agent'))

  await prisma.conversionEvent.create({
    data: {
      eventName: payload.eventName,
      eventData: {
        ...payload.eventData,
        referrer: safeReferrer,
        userAgent: safeUserAgent,
      },
      sessionId,
      validated: true,
    },
  })

  return { success: true }
})

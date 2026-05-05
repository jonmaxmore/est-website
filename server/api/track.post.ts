import { toStoredTrackingPayload } from '../../app/shared/tracking/events'
import { redactReferrer, truncateUserAgent } from '../utils/privacy'
import { extractUtmFromUrl } from '../utils/utm'

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

  // ── UTM: prefer client-supplied (page URL parsed at dispatch time) ──
  // fall back to extracting from the Referer header so a beacon fired without
  // explicit UTM in the body still gets attributed to the originating page's
  // campaign tags.
  const clientUtm = extractUtmFromQueryShape(input)
  const referrerUtm = extractUtmFromUrl(getRequestHeader(event, 'referer') ?? '')
  const utm = {
    utmSource: clientUtm.utmSource ?? referrerUtm.utmSource,
    utmMedium: clientUtm.utmMedium ?? referrerUtm.utmMedium,
    utmCampaign: clientUtm.utmCampaign ?? referrerUtm.utmCampaign,
  }

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
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
    },
  })

  return { success: true }
})

/** Read utm_* keys from the loose body shape if the client included them. */
function extractUtmFromQueryShape(input: { utm?: unknown }): {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
} {
  const utm = (input.utm ?? null) as Record<string, unknown> | null
  if (!utm || typeof utm !== 'object') {
    return { utmSource: null, utmMedium: null, utmCampaign: null }
  }
  const clean = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 64) || null : null)
  return {
    utmSource: clean(utm.source),
    utmMedium: clean(utm.medium),
    utmCampaign: clean(utm.campaign),
  }
}

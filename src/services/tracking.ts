import type { Payload } from 'payload'

/**
 * Tracking Service — Server-side session & funnel logic
 * Extracted from api/track/route.ts for SRP compliance
 */

// ─── Funnel step definitions ───
export const FUNNEL_STEPS: Record<string, { step: string; stepOrder: number }> = {
  landing: { step: 'landing', stepOrder: 1 },
  engagement: { step: 'engagement', stepOrder: 2 },
  event_page: { step: 'event_page', stepOrder: 3 },
  form_interaction: { step: 'form_interaction', stepOrder: 4 },
  registration: { step: 'registration', stepOrder: 5 },
  store_click: { step: 'store_click', stepOrder: 6 },
  referral_share: { step: 'referral_share', stepOrder: 7 },
}

// ─── Auto funnel mapping from event names ───
export const EVENT_TO_FUNNEL: Record<string, string> = {
  cta_click: 'form_interaction',
  registration: 'registration',
  store_click: 'store_click',
  referral_copy: 'referral_share',
}

// ─── Excluded paths ───
const EXCLUDED_PATHS = ['/admin', '/api/', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml']

export function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATHS.some(p => path.startsWith(p))
}

// ─── Shared context for handlers ───
export interface TrackContext {
  payload: Payload
  ip: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browserName: string
  browserVersion: string
  osName: string
  osVersion: string
  channel: string
  body: Record<string, unknown>
}

// ─── Session upsert ───
export async function upsertSession(ctx: TrackContext) {
  const { payload, body, ip, deviceType, browserName, browserVersion, osName, osVersion, channel } = ctx
  const { sessionId, visitorId, path, referrer, language,
    utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
    screenWidth, screenHeight } = body as Record<string, string | number>

  if (!sessionId) return

  const existing = await payload.find({
    collection: 'analytics-sessions',
    where: { sessionId: { equals: sessionId } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    const session = existing.docs[0]
    await payload.update({
      collection: 'analytics-sessions',
      id: session.id,
      data: {
        pageCount: ((session.pageCount as number) || 1) + 1,
        exitPage: path as string,
        isBounce: false,
      },
    })
  } else {
    await payload.create({
      collection: 'analytics-sessions',
      data: {
        sessionId, visitorId: visitorId || '', landingPage: path,
        referrer: referrer || '', channel,
        utmSource: utmSource || '', utmMedium: utmMedium || '',
        utmCampaign: utmCampaign || '', utmTerm: utmTerm || '', utmContent: utmContent || '',
        device: deviceType, browser: browserName, browserVersion,
        os: osName, osVersion,
        screenWidth: screenWidth || 0, screenHeight: screenHeight || 0,
        country: '', language: language || '',
        pageCount: 1, eventCount: 0, duration: 0, maxScrollDepth: 0,
        exitPage: path, isBounce: true, isConverted: false, ip,
      },
    })
    await payload.create({
      collection: 'analytics-funnel-events',
      data: { sessionId, visitorId: visitorId || '', step: 'landing', stepOrder: 1, path: path as string },
    })
  }
}

// ─── Increment session event count ───
export async function incrementSessionEventCount(
  payload: Payload, sessionId: string, eventName: string,
) {
  const existing = await payload.find({
    collection: 'analytics-sessions',
    where: { sessionId: { equals: sessionId } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    const session = existing.docs[0]
    const updates: Record<string, unknown> = { eventCount: ((session.eventCount as number) || 0) + 1 }
    if (eventName === 'registration') updates.isConverted = true
    await payload.update({ collection: 'analytics-sessions', id: session.id, data: updates })
  }
}

// ─── Record funnel event ───
interface FunnelEventInput {
  sessionId: string
  visitorId: string
  stepName: string
  path: string
  metadata?: Record<string, unknown>
}

export async function recordFunnelEvent(payload: Payload, input: FunnelEventInput) {
  const stepDef = FUNNEL_STEPS[input.stepName]
  if (!stepDef) return

  await payload.create({
    collection: 'analytics-funnel-events',
    data: {
      sessionId: input.sessionId, visitorId: input.visitorId || '',
      step: stepDef.step, stepOrder: stepDef.stepOrder,
      path: input.path, metadata: input.metadata || {},
    },
  })
}

// ─── Update session heartbeat ───
export async function updateSessionHeartbeat(
  payload: Payload,
  sessionId: string,
  data: { duration?: number; maxScrollDepth?: number; exitPage?: string; pageCount?: number },
) {
  const existing = await payload.find({
    collection: 'analytics-sessions',
    where: { sessionId: { equals: sessionId } },
    limit: 1,
  })
  if (existing.docs.length === 0) return

  const session = existing.docs[0]
  const updates: Record<string, unknown> = {}
  if (data.duration !== undefined) updates.duration = data.duration
  if (data.maxScrollDepth !== undefined) {
    updates.maxScrollDepth = Math.max(data.maxScrollDepth, (session.maxScrollDepth as number) || 0)
  }
  if (data.exitPage) updates.exitPage = data.exitPage
  if (data.pageCount !== undefined) {
    updates.pageCount = data.pageCount
    updates.isBounce = data.pageCount <= 1
  }

  if (Object.keys(updates).length > 0) {
    await payload.update({ collection: 'analytics-sessions', id: session.id, data: updates })
  }
}

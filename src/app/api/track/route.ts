import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'
import { isBot } from '@/lib/bot-detection'
import { deriveChannel } from '@/lib/channel-detection'
import { UAParser } from 'ua-parser-js'
import type { Payload } from 'payload'

export const dynamic = 'force-dynamic'

// ─── Excluded paths (internal/admin) ───
const EXCLUDED_PATHS = ['/admin', '/api/', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml']

function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATHS.some(p => path.startsWith(p))
}

// ─── Funnel step mapping ───
const FUNNEL_STEPS: Record<string, { step: string; stepOrder: number }> = {
  landing: { step: 'landing', stepOrder: 1 },
  engagement: { step: 'engagement', stepOrder: 2 },
  event_page: { step: 'event_page', stepOrder: 3 },
  form_interaction: { step: 'form_interaction', stepOrder: 4 },
  registration: { step: 'registration', stepOrder: 5 },
  store_click: { step: 'store_click', stepOrder: 6 },
  referral_share: { step: 'referral_share', stepOrder: 7 },
}

// ─── Auto funnel mapping from event names ───
const EVENT_TO_FUNNEL: Record<string, string> = {
  cta_click: 'form_interaction',
  registration: 'registration',
  store_click: 'store_click',
  referral_copy: 'referral_share',
}

// ─── Parsed context shared across handlers ───
interface TrackContext {
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

// ─── Session upsert for pageview ───
async function upsertSession(ctx: TrackContext) {
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

// ─── Handle pageview ───
async function handlePageview(ctx: TrackContext) {
  const { payload, ip, deviceType, browserName, browserVersion, osName, osVersion, channel, body } = ctx
  const { path, referrer, sessionId, language, visitorId,
    screenWidth, screenHeight, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
  } = body as Record<string, string | number>

  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  await payload.create({
    collection: 'page-views',
    data: {
      path, ip, userAgent: '', referrer: referrer || '', sessionId: sessionId || '',
      language: language || '', deviceType, visitorId: visitorId || '',
      browser: browserName, browserVersion, os: osName, osVersion,
      screenWidth: screenWidth || 0, screenHeight: screenHeight || 0,
      country: '', channel,
      utmSource: utmSource || '', utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '', utmTerm: utmTerm || '', utmContent: utmContent || '',
    },
  })

  try { await upsertSession(ctx) } catch (e) { console.error('[/api/track] Session upsert error:', e) }

  return NextResponse.json({ ok: true }, { status: 201 })
}

// ─── Handle event ───
async function handleEvent(ctx: TrackContext) {
  const { payload, ip, body } = ctx
  const { eventName, eventData, path, sessionId, visitorId } = body as Record<string, string | Record<string, unknown>>

  if (!eventName) return NextResponse.json({ error: 'Missing eventName' }, { status: 400 })

  await payload.create({
    collection: 'page-events',
    data: { eventName, eventData: eventData || {}, path: path || '', ip, sessionId: sessionId || '' },
  })

  // Increment session event count
  if (sessionId) {
    try {
      const existing = await payload.find({ collection: 'analytics-sessions', where: { sessionId: { equals: sessionId } }, limit: 1 })
      if (existing.docs.length > 0) {
        const session = existing.docs[0]
        const updates: Record<string, unknown> = { eventCount: ((session.eventCount as number) || 0) + 1 }
        if (eventName === 'registration') updates.isConverted = true
        await payload.update({ collection: 'analytics-sessions', id: session.id, data: updates })
      }
    } catch { /* Non-critical */ }
  }

  // Auto-detect funnel events
  const autoStep = EVENT_TO_FUNNEL[eventName as string]
  if (autoStep && sessionId && FUNNEL_STEPS[autoStep]) {
    try {
      await payload.create({
        collection: 'analytics-funnel-events',
        data: {
          sessionId, visitorId: visitorId || '',
          step: FUNNEL_STEPS[autoStep].step, stepOrder: FUNNEL_STEPS[autoStep].stepOrder,
          path: (path || '') as string, metadata: eventData || {},
        },
      })
    } catch { /* Non-critical */ }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

// ─── Handle session heartbeat update ───
async function handleSessionUpdate(ctx: TrackContext) {
  const { payload, body } = ctx
  const { sessionId, duration, maxScrollDepth, exitPage, pageCount } = body as Record<string, string | number>

  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  try {
    const existing = await payload.find({ collection: 'analytics-sessions', where: { sessionId: { equals: sessionId } }, limit: 1 })
    if (existing.docs.length > 0) {
      const session = existing.docs[0]
      const updates: Record<string, unknown> = {}
      if (duration !== undefined) updates.duration = duration
      if (maxScrollDepth !== undefined) updates.maxScrollDepth = Math.max(maxScrollDepth as number, (session.maxScrollDepth as number) || 0)
      if (exitPage) updates.exitPage = exitPage
      if (pageCount !== undefined) { updates.pageCount = pageCount; updates.isBounce = (pageCount as number) <= 1 }
      if (Object.keys(updates).length > 0) await payload.update({ collection: 'analytics-sessions', id: session.id, data: updates })
    }
  } catch (err) { console.error('[/api/track] Session update error:', err) }

  return NextResponse.json({ ok: true }, { status: 200 })
}

// ─── Handle explicit funnel step ───
async function handleFunnel(ctx: TrackContext) {
  const { payload, body } = ctx
  const { funnelStep, sessionId, visitorId, path, funnelMetadata } = body as Record<string, string | Record<string, unknown>>

  if (!funnelStep || !sessionId || !FUNNEL_STEPS[funnelStep as string]) {
    return NextResponse.json({ error: 'Missing or invalid funnelStep/sessionId' }, { status: 400 })
  }

  await payload.create({
    collection: 'analytics-funnel-events',
    data: {
      sessionId, visitorId: visitorId || '',
      step: FUNNEL_STEPS[funnelStep as string].step,
      stepOrder: FUNNEL_STEPS[funnelStep as string].stepOrder,
      path: (path || '') as string, metadata: funnelMetadata || {},
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}

/**
 * POST /api/track — Enterprise tracking endpoint
 * Handles: pageview, event, session_update, funnel
 * Parses UA, derives channel, upserts sessions, records funnel events
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    if (isBot(userAgent)) return NextResponse.json({ ok: true, filtered: 'bot' }, { status: 200 })
    if (!checkRateLimit(ip, 120, 60000)) return NextResponse.json({ error: 'Rate limited' }, { status: 429 })

    const body = await request.json()
    if (!body.type) return NextResponse.json({ error: 'Missing type' }, { status: 400 })
    if (body.path && isExcludedPath(body.path)) return NextResponse.json({ ok: true, filtered: 'excluded_path' }, { status: 200 })

    const parser = new UAParser(userAgent)
    const uaBrowser = parser.getBrowser()
    const uaOS = parser.getOS()
    const uaDevice = parser.getDevice()

    const ctx: TrackContext = {
      payload: await getPayloadClient(),
      ip,
      deviceType: uaDevice.type === 'tablet' ? 'tablet' : uaDevice.type === 'mobile' ? 'mobile' : 'desktop',
      browserName: uaBrowser.name || '',
      browserVersion: uaBrowser.version || '',
      osName: uaOS.name || '',
      osVersion: uaOS.version || '',
      channel: deriveChannel(body.referrer || '', body.utmSource, body.utmMedium),
      body,
    }

    const handlers: Record<string, (c: TrackContext) => Promise<NextResponse>> = {
      pageview: handlePageview,
      event: handleEvent,
      session_update: handleSessionUpdate,
      funnel: handleFunnel,
    }

    const handler = handlers[body.type]
    if (!handler) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    return await handler(ctx)
  } catch (err) {
    console.error('[/api/track] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

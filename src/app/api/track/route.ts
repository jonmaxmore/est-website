import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'
import { isBot } from '@/lib/bot-detection'
import { deriveChannel } from '@/lib/channel-detection'
import { UAParser } from 'ua-parser-js'
import {
  isExcludedPath, upsertSession, incrementSessionEventCount,
  recordFunnelEvent, updateSessionHeartbeat,
  EVENT_TO_FUNNEL, FUNNEL_STEPS,
  type TrackContext,
} from '@/services/tracking'

export const dynamic = 'force-dynamic'

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

  if (sessionId) {
    try { await incrementSessionEventCount(payload, sessionId as string, eventName as string) } catch { /* Non-critical */ }
  }

  const autoStep = EVENT_TO_FUNNEL[eventName as string]
  if (autoStep && sessionId && FUNNEL_STEPS[autoStep]) {
    try {
      await recordFunnelEvent(payload, {
        sessionId: sessionId as string, visitorId: (visitorId || '') as string,
        stepName: autoStep, path: (path || '') as string, metadata: eventData as Record<string, unknown>,
      })
    } catch { /* Non-critical */ }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

// ─── Handle session heartbeat ───
async function handleSessionUpdate(ctx: TrackContext) {
  const { payload, body } = ctx
  const { sessionId, duration, maxScrollDepth, exitPage, pageCount } = body as Record<string, string | number>

  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  try {
    await updateSessionHeartbeat(payload, sessionId as string, {
      duration: duration as number | undefined,
      maxScrollDepth: maxScrollDepth as number | undefined,
      exitPage: exitPage as string | undefined,
      pageCount: pageCount as number | undefined,
    })
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

  await recordFunnelEvent(payload, {
    sessionId: sessionId as string, visitorId: (visitorId || '') as string,
    stepName: funnelStep as string, path: (path || '') as string, metadata: funnelMetadata as Record<string, unknown>,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}

// ─── Route handler map ───
const handlers: Record<string, (c: TrackContext) => Promise<NextResponse>> = {
  pageview: handlePageview,
  event: handleEvent,
  session_update: handleSessionUpdate,
  funnel: handleFunnel,
}

/**
 * POST /api/track — Tracking endpoint
 * Thin controller: parses request, delegates to handlers + service layer
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

    const handler = handlers[body.type]
    if (!handler) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    return await handler(ctx)
  } catch (err) {
    console.error('[/api/track] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

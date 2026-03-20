import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/track — Lightweight tracking endpoint
 * Accepts page views and events from frontend, stores in DB
 * Data source: Internal (our own DB, NOT Google/Adjust)
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limit: 120 requests per minute per IP
    if (!checkRateLimit(ip, 120, 60000)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const body = await request.json()
    const { type, path, eventName, eventData, sessionId, language, referrer } = body

    if (!type || !path) {
      return NextResponse.json({ error: 'Missing type or path' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const userAgent = request.headers.get('user-agent') || ''

    if (type === 'pageview') {
      await payload.create({
        collection: 'page-views',
        data: {
          path,
          ip,
          userAgent,
          referrer: referrer || '',
          sessionId: sessionId || '',
          language: language || '',
        },
      })
    } else if (type === 'event') {
      if (!eventName) {
        return NextResponse.json({ error: 'Missing eventName' }, { status: 400 })
      }
      await payload.create({
        collection: 'page-events',
        data: {
          eventName,
          eventData: eventData || {},
          path,
          ip,
          sessionId: sessionId || '',
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

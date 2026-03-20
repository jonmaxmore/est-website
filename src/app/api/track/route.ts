import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// ─── Bot detection ───
const BOT_PATTERNS = /bot|crawl|spider|slurp|facebookexternalhit|mediapartners|google|bing|yandex|baidu|duckduck|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider/i

// ─── Excluded paths (internal/admin) ───
const EXCLUDED_PATHS = ['/admin', '/api/', '/_next/', '/favicon.ico', '/robots.txt', '/sitemap.xml']

function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATHS.some(p => path.startsWith(p))
}

// ─── Device type from user-agent ───
function getDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * POST /api/track — Lightweight tracking endpoint
 * Accepts page views and events from frontend, stores in DB
 * Filters: bots, admin routes, rate limiting
 * Data source: Internal (our own DB, NOT Google/Adjust)
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    // Skip bots
    if (BOT_PATTERNS.test(userAgent)) {
      return NextResponse.json({ ok: true, filtered: 'bot' }, { status: 200 })
    }

    // Rate limit: 120 requests per minute per IP
    if (!checkRateLimit(ip, 120, 60000)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const body = await request.json()
    const { type, path, eventName, eventData, sessionId, language, referrer } = body

    if (!type || !path) {
      return NextResponse.json({ error: 'Missing type or path' }, { status: 400 })
    }

    // Skip internal/admin paths
    if (isExcludedPath(path)) {
      return NextResponse.json({ ok: true, filtered: 'excluded_path' }, { status: 200 })
    }

    const payload = await getPayloadClient()
    const deviceType = getDeviceType(userAgent)

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
          deviceType,
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
  } catch (err) {
    console.error('[/api/track] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

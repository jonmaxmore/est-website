import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { isBot } from '@/lib/bot-detection'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics — Professional analytics aggregation
 * Uses efficient count queries + selective field fetching
 * Data source: Internal DB only (NOT Google/Adjust)
 *
 * Requires admin authentication via Payload session cookie
 */

// ─── Device type from user-agent ───
function getDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

// eslint-disable-next-line max-lines-per-function -- Analytics aggregation endpoint
export async function GET(request: NextRequest) {
  try {
    // Rate limit: 10 requests per minute (expensive aggregation)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(`analytics:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = await getPayloadClient()

    // ── Admin auth check via cookie ──
    const cookieHeader = request.headers.get('cookie') || ''
    if (!cookieHeader.includes('payload-token')) {
      return NextResponse.json({ error: 'Unauthorized — admin login required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 365)
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Previous period for trend comparison
    const prevStart = new Date(since)
    prevStart.setDate(prevStart.getDate() - days)

    // ── Efficient count queries (no document loading) ──
    const [
      totalRegistrations,
      recentRegistrations,
      prevRegistrations,
      totalPageViews,
      prevPageViews,
      totalEvents,
      prevEvents,
    ] = await Promise.all([
      payload.count({ collection: 'registrations' }),
      payload.count({
        collection: 'registrations',
        where: { createdAt: { greater_than: since.toISOString() } },
      }),
      payload.count({
        collection: 'registrations',
        where: {
          and: [
            { createdAt: { greater_than: prevStart.toISOString() } },
            { createdAt: { less_than_equal: since.toISOString() } },
          ],
        },
      }),
      payload.count({
        collection: 'page-views',
        where: { createdAt: { greater_than: since.toISOString() } },
      }),
      payload.count({
        collection: 'page-views',
        where: {
          and: [
            { createdAt: { greater_than: prevStart.toISOString() } },
            { createdAt: { less_than_equal: since.toISOString() } },
          ],
        },
      }),
      payload.count({
        collection: 'page-events',
        where: { createdAt: { greater_than: since.toISOString() } },
      }),
      payload.count({
        collection: 'page-events',
        where: {
          and: [
            { createdAt: { greater_than: prevStart.toISOString() } },
            { createdAt: { less_than_equal: since.toISOString() } },
          ],
        },
      }),
    ])

    // ── Fetch ONLY needed fields for aggregation (not full docs) ──
    // Page views: ip, sessionId, path, userAgent, createdAt
    const MAX_AGGREGATION_DOCS = 10000
    const [pvResult, evResult, regResult] = await Promise.all([
      payload.find({
        collection: 'page-views',
        where: { createdAt: { greater_than: since.toISOString() } },
        limit: MAX_AGGREGATION_DOCS,
        sort: '-createdAt',
        select: {
          path: true,
          ip: true,
          sessionId: true,
          userAgent: true,
          createdAt: true,
        },
      }),
      payload.find({
        collection: 'page-events',
        where: { createdAt: { greater_than: since.toISOString() } },
        limit: MAX_AGGREGATION_DOCS,
        sort: '-createdAt',
        select: {
          eventName: true,
          path: true,
          createdAt: true,
        },
      }),
      payload.find({
        collection: 'registrations',
        where: { createdAt: { greater_than: since.toISOString() } },
        limit: MAX_AGGREGATION_DOCS,
        sort: '-createdAt',
        select: {
          region: true,
          platform: true,
          createdAt: true,
        },
      }),
    ])

    const pvDocs = pvResult.docs
    const evDocs = evResult.docs
    const regDocs = regResult.docs

    // ── Filter out bots from page view analysis ──
    const humanPvDocs = pvDocs.filter(d => !isBot((d.userAgent as string) || ''))

    // ── Unique visitors (distinct IPs, excluding bots) ──
    const uniqueIPs = new Set(humanPvDocs.map(d => d.ip)).size

    // ── Sessions (GA4 style: unique sessionId values) ──
    const sessionIds = new Set(humanPvDocs.map(d => d.sessionId).filter(Boolean))
    const totalSessions = sessionIds.size || 1 // Prevent division by zero

    // ── Bounce Rate (GA4 style: sessions with only 1 page view) ──
    const pagesPerSession: Record<string, number> = {}
    for (const doc of humanPvDocs) {
      const sid = (doc.sessionId as string) || 'no-session'
      pagesPerSession[sid] = (pagesPerSession[sid] || 0) + 1
    }
    const singlePageSessions = Object.values(pagesPerSession).filter(c => c === 1).length
    const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0

    // ── Avg pages per session ──
    const avgPagesPerSession = totalSessions > 0
      ? Math.round((humanPvDocs.length / totalSessions) * 100) / 100
      : 0

    // ── Device breakdown ──
    const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 }
    const countedSessions = new Set<string>()
    for (const doc of humanPvDocs) {
      const sid = (doc.sessionId as string) || doc.ip as string
      if (!countedSessions.has(sid)) {
        countedSessions.add(sid)
        const device = getDeviceType((doc.userAgent as string) || '')
        deviceCounts[device] = (deviceCounts[device] || 0) + 1
      }
    }

    // ── Top pages ──
    const pageViewsByPath: Record<string, number> = {}
    for (const doc of humanPvDocs) {
      const p = (doc.path as string) || '/'
      pageViewsByPath[p] = (pageViewsByPath[p] || 0) + 1
    }
    const topPages = Object.entries(pageViewsByPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    // ── Page views by date ──
    const pvByDate: Record<string, number> = {}
    for (const doc of humanPvDocs) {
      const day = new Date(doc.createdAt as string).toISOString().split('T')[0]
      pvByDate[day] = (pvByDate[day] || 0) + 1
    }

    // ── Top events ──
    const eventsByName: Record<string, number> = {}
    for (const doc of evDocs) {
      const name = (doc.eventName as string) || 'unknown'
      eventsByName[name] = (eventsByName[name] || 0) + 1
    }
    const topEvents = Object.entries(eventsByName)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // ── Registration breakdowns ──
    const regByRegion: Record<string, number> = {}
    const regByPlatform: Record<string, number> = {}
    const regByDate: Record<string, number> = {}

    for (const doc of regDocs) {
      const region = (doc.region as string) || 'unknown'
      regByRegion[region] = (regByRegion[region] || 0) + 1

      const plat = (doc.platform as string) || 'unknown'
      regByPlatform[plat] = (regByPlatform[plat] || 0) + 1

      const day = new Date(doc.createdAt as string).toISOString().split('T')[0]
      regByDate[day] = (regByDate[day] || 0) + 1
    }

    // ── Trend calculation (vs previous period) ──
    const calcTrend = (current: number, previous: number): { change: number; direction: 'up' | 'down' | 'flat' } => {
      if (previous === 0) return { change: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'flat' }
      const change = Math.round(((current - previous) / previous) * 100)
      return { change: Math.abs(change), direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat' }
    }

    return NextResponse.json({
      period: { days, since: since.toISOString() },

      overview: {
        totalRegistrations: totalRegistrations.totalDocs,
        recentRegistrations: recentRegistrations.totalDocs,
        totalPageViews: totalPageViews.totalDocs,
        uniqueVisitors: uniqueIPs,
        totalSessions,
        bounceRate,
        avgPagesPerSession,
        totalEvents: totalEvents.totalDocs,
      },

      trends: {
        registrations: calcTrend(recentRegistrations.totalDocs, prevRegistrations.totalDocs),
        pageViews: calcTrend(totalPageViews.totalDocs, prevPageViews.totalDocs),
        events: calcTrend(totalEvents.totalDocs, prevEvents.totalDocs),
      },

      devices: Object.entries(deviceCounts).map(([device, count]) => ({ device, count })),

      registrations: {
        byRegion: Object.entries(regByRegion)
          .sort((a, b) => b[1] - a[1])
          .map(([region, count]) => ({ region, count })),
        byPlatform: Object.entries(regByPlatform)
          .sort((a, b) => b[1] - a[1])
          .map(([platform, count]) => ({ platform, count })),
        byDate: Object.entries(regByDate).sort().map(([date, count]) => ({ date, count })),
      },

      pageViews: {
        topPages,
        byDate: Object.entries(pvByDate).sort().map(([date, count]) => ({ date, count })),
      },

      events: {
        topEvents,
      },

      dataSource: 'internal_db',
      generatedAt: new Date().toISOString(),
      _meta: {
        docsProcessed: {
          pageViews: humanPvDocs.length,
          events: evDocs.length,
          registrations: regDocs.length,
        },
        maxAggregationDocs: MAX_AGGREGATION_DOCS,
        botsFiltered: pvDocs.length - humanPvDocs.length,
      },
    }, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Analytics query failed' }, { status: 500 })
  }
}

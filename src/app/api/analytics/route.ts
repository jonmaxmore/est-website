import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics — Dashboard data aggregation
 * Returns comprehensive analytics from our internal DB
 * Data source: Internal Only (NOT Google/Adjust)
 */
// eslint-disable-next-line max-lines-per-function -- Analytics aggregation endpoint
export async function GET(request: NextRequest) {
  try {
    // Auth check — only admin users
    const payload = await getPayloadClient()

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    const since = new Date()
    since.setDate(since.getDate() - days)

    // ── Parallel queries ──
    const [
      totalRegistrations,
      pageViewsResult,
      pageEventsResult,
      registrationsByRegion,
    ] = await Promise.all([
      // Total registrations
      payload.count({ collection: 'registrations' }),

      // Page views in date range
      payload.find({
        collection: 'page-views',
        where: { createdAt: { greater_than: since.toISOString() } },
        limit: 0,
        pagination: false,
      }),

      // Page events in date range
      payload.find({
        collection: 'page-events',
        where: { createdAt: { greater_than: since.toISOString() } },
        limit: 0,
        pagination: false,
      }),

      // Registrations in date range
      payload.find({
        collection: 'registrations',
        where: { createdAt: { greater_than: since.toISOString() } },
        limit: 0,
        pagination: false,
      }),
    ])

    // ── Aggregate Page Views ──
    const pvDocs = pageViewsResult.docs
    const uniqueIPs = new Set(pvDocs.map((d) => d.ip)).size
    const totalPageViews = pvDocs.length

    // Page views by path
    const pageViewsByPath: Record<string, number> = {}
    for (const doc of pvDocs) {
      const p = (doc.path as string) || '/'
      pageViewsByPath[p] = (pageViewsByPath[p] || 0) + 1
    }
    const topPages = Object.entries(pageViewsByPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    // Page views by date
    const pvByDate: Record<string, number> = {}
    for (const doc of pvDocs) {
      const day = new Date(doc.createdAt as string).toISOString().split('T')[0]
      pvByDate[day] = (pvByDate[day] || 0) + 1
    }

    // ── Aggregate Page Events ──
    const evDocs = pageEventsResult.docs
    const totalEvents = evDocs.length

    // Events by name
    const eventsByName: Record<string, number> = {}
    for (const doc of evDocs) {
      const name = (doc.eventName as string) || 'unknown'
      eventsByName[name] = (eventsByName[name] || 0) + 1
    }
    const topEvents = Object.entries(eventsByName)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // ── Aggregate Registrations ──
    const regDocs = registrationsByRegion.docs
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

    return NextResponse.json({
      period: { days, since: since.toISOString() },

      // Overview
      overview: {
        totalRegistrations: totalRegistrations.totalDocs,
        recentRegistrations: regDocs.length,
        totalPageViews,
        uniqueVisitors: uniqueIPs,
        totalEvents,
      },

      // Registration breakdowns
      registrations: {
        byRegion: Object.entries(regByRegion).map(([region, count]) => ({ region, count })),
        byPlatform: Object.entries(regByPlatform).map(([platform, count]) => ({ platform, count })),
        byDate: Object.entries(regByDate).sort().map(([date, count]) => ({ date, count })),
      },

      // Page view breakdowns
      pageViews: {
        topPages,
        byDate: Object.entries(pvByDate).sort().map(([date, count]) => ({ date, count })),
      },

      // Event breakdowns
      events: {
        topEvents,
      },

      // Data source labels
      dataSource: 'internal_db',
      note: 'This data is from our own database. For Google Analytics data, access GA4 console. For Adjust data, access Adjust dashboard.',
    }, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Analytics query failed' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  buildDateRange, fetchCounts, fetchRawDocs,
  aggregatePageViews, aggregateEvents, aggregateRegistrations, calcTrend,
} from '@/services/analytics-aggregation'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics — Legacy analytics aggregation endpoint
 * Thin route handler — all logic delegated to analytics-aggregation service
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(`analytics:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const cookieHeader = request.headers.get('cookie') || ''
    if (!cookieHeader.includes('payload-token')) {
      return NextResponse.json({ error: 'Unauthorized — admin login required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 365)

    const payload = await getPayloadClient()
    const { since, prevStart } = buildDateRange(days)

    const [counts, rawDocs] = await Promise.all([
      fetchCounts(payload, since, prevStart),
      fetchRawDocs(payload, since),
    ])

    const pvMetrics = aggregatePageViews(rawDocs.pvDocs)
    const topEvents = aggregateEvents(rawDocs.evDocs)
    const registrations = aggregateRegistrations(rawDocs.regDocs)

    return NextResponse.json({
      period: { days, since: since.toISOString() },
      overview: {
        totalRegistrations: counts.totalRegistrations,
        recentRegistrations: counts.recentRegistrations,
        totalPageViews: counts.totalPageViews,
        uniqueVisitors: pvMetrics.uniqueVisitors,
        totalSessions: pvMetrics.totalSessions,
        bounceRate: pvMetrics.bounceRate,
        avgPagesPerSession: pvMetrics.avgPagesPerSession,
        totalEvents: counts.totalEvents,
      },
      trends: {
        registrations: calcTrend(counts.recentRegistrations, counts.prevRegistrations),
        pageViews: calcTrend(counts.totalPageViews, counts.prevPageViews),
        events: calcTrend(counts.totalEvents, counts.prevEvents),
      },
      devices: Object.entries(pvMetrics.deviceCounts).map(([device, count]) => ({ device, count })),
      registrations: registrations,
      pageViews: {
        topPages: pvMetrics.topPages,
        byDate: Object.entries(pvMetrics.pvByDate).sort().map(([date, count]) => ({ date, count })),
      },
      events: { topEvents },
      dataSource: 'internal_db',
      generatedAt: new Date().toISOString(),
      _meta: {
        docsProcessed: {
          pageViews: pvMetrics.humanCount,
          events: rawDocs.evDocs.length,
          registrations: rawDocs.regDocs.length,
        },
        maxAggregationDocs: rawDocs.maxAggregationDocs,
        botsFiltered: pvMetrics.botsFiltered,
      },
    }, {
      headers: { 'Cache-Control': 'private, max-age=60' },
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Analytics query failed' }, { status: 500 })
  }
}

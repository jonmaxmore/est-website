import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getReferrerDomain } from '@/lib/channel-detection'
import type { Payload } from 'payload'

export const dynamic = 'force-dynamic'

function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// ─── Rollup bucket type ───
type RollupBucket = {
  pageviews: number; sessions: number; uniqueVisitors: Set<string>
  bounces: number; conversions: number; totalEvents: number
  totalDuration: number; scrollDepthSum: number
}

function createBucket(): RollupBucket {
  return { pageviews: 0, sessions: 0, uniqueVisitors: new Set(), bounces: 0, conversions: 0, totalEvents: 0, totalDuration: 0, scrollDepthSum: 0 }
}

// ─── Fetch all sessions for a date range (paginated) ───
async function fetchSessions(payload: Payload, dateStart: Date, dateEnd: Date) {
  const PAGE_SIZE = 500
  let page = 1
  let hasMore = true
  const all: Record<string, unknown>[] = []

  while (hasMore) {
    const result = await payload.find({
      collection: 'analytics-sessions',
      where: { createdAt: { greater_than_equal: dateStart.toISOString(), less_than_equal: dateEnd.toISOString() } },
      limit: PAGE_SIZE, page, sort: 'createdAt',
      overrideAccess: true,
    })
    all.push(...(result.docs as Record<string, unknown>[]))
    hasMore = result.hasNextPage
    page++
  }
  return all
}

// ─── Aggregate sessions into dimension buckets ───
function aggregateSessions(sessions: Record<string, unknown>[], targetDate: string) {
  const buckets = new Map<string, RollupBucket>()

  function add(dimension: string, value: string, session: Record<string, unknown>) {
    const key = `${targetDate}|${dimension}|${value}`
    let bucket = buckets.get(key)
    if (!bucket) { bucket = createBucket(); buckets.set(key, bucket) }
    bucket.sessions++
    bucket.pageviews += (session.pageCount as number) || 1
    if (session.visitorId) bucket.uniqueVisitors.add(session.visitorId as string)
    if (session.isBounce) bucket.bounces++
    if (session.isConverted) bucket.conversions++
    bucket.totalEvents += (session.eventCount as number) || 0
    bucket.totalDuration += (session.duration as number) || 0
    bucket.scrollDepthSum += (session.maxScrollDepth as number) || 0
  }

  const dimensionFields: [string, string][] = [
    ['path', 'landingPage'], ['channel', 'channel'], ['device', 'device'],
    ['browser', 'browser'], ['os', 'os'], ['country', 'country'],
    ['utm_source', 'utmSource'], ['utm_campaign', 'utmCampaign'],
  ]

  for (const session of sessions) {
    add('overall', 'all', session)
    for (const [dim, field] of dimensionFields) {
      if (session[field]) add(dim, session[field] as string, session)
    }
    if (session.referrer) {
      const domain = getReferrerDomain(session.referrer as string)
      if (domain !== '(direct)') add('referrer_domain', domain, session)
    }
  }

  return buckets
}

// ─── Upsert rollup rows to DB ───
async function upsertRollups(payload: Payload, buckets: Map<string, RollupBucket>) {
  let count = 0
  for (const [key, bucket] of buckets.entries()) {
    const [date, dimension, dimensionValue] = key.split('|')
    const data = {
      date, dimension, dimensionValue, rollupKey: key,
      pageviews: bucket.pageviews, sessions: bucket.sessions,
      uniqueVisitors: bucket.uniqueVisitors.size,
      bounces: bucket.bounces, conversions: bucket.conversions,
      totalEvents: bucket.totalEvents, totalDuration: bucket.totalDuration,
      avgScrollDepth: bucket.sessions > 0 ? Math.round(bucket.scrollDepthSum / bucket.sessions) : 0,
    }
    try {
      const existing = await payload.find({ collection: 'analytics-daily-rollups', where: { rollupKey: { equals: key } }, limit: 1, overrideAccess: true })
      if (existing.docs.length > 0) {
        await payload.update({ collection: 'analytics-daily-rollups', id: existing.docs[0].id, data, overrideAccess: true })
      } else {
        await payload.create({ collection: 'analytics-daily-rollups', data, overrideAccess: true })
      }
      count++
    } catch (err) { console.error(`[rollup] Error upserting ${key}:`, err) }
  }
  return count
}

/**
 * POST /api/analytics/rollup — Daily aggregation job
 * Reads analytics-sessions for a given date and upserts rollup rows by dimension.
 * Body: { date?: "YYYY-MM-DD", secret?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${cronSecret}` && body.secret !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const targetDate = body.date || getYesterday()
    const dateStart = new Date(`${targetDate}T00:00:00.000Z`)
    const dateEnd = new Date(`${targetDate}T23:59:59.999Z`)
    const payload = await getPayloadClient()

    const sessions = await fetchSessions(payload, dateStart, dateEnd)
    if (sessions.length === 0) {
      return NextResponse.json({ ok: true, date: targetDate, sessionsProcessed: 0, rollupsCreated: 0 })
    }

    const buckets = aggregateSessions(sessions, targetDate)
    const rollupsCreated = await upsertRollups(payload, buckets)

    return NextResponse.json({ ok: true, date: targetDate, sessionsProcessed: sessions.length, rollupsCreated, dimensions: buckets.size })
  } catch (err) {
    console.error('[/api/analytics/rollup] Error:', err)
    return NextResponse.json({ ok: false, error: 'Rollup failed' }, { status: 500 })
  }
}

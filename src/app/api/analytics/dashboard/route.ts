import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit } from '@/lib/rate-limit'
import { requireAdmin } from '@/lib/require-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/analytics/dashboard — Enterprise dashboard data
 * Reads from pre-aggregated rollups + live session/funnel data
 * Tabs: overview, acquisition, technology, behavior
 */

// ─── Auth check ───
// ─── Fetch rollups for a date range by dimension ───
async function fetchRollups(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  startDate: string,
  endDate: string,
  dimension?: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = [
    { date: { greater_than_equal: startDate } },
    { date: { less_than_equal: endDate } },
  ]
  if (dimension) {
    conditions.push({ dimension: { equals: dimension } })
  }

  const result = await payload.find({
    collection: 'analytics-daily-rollups',
    where: { and: conditions },
    limit: 5000,
    sort: 'date',
    overrideAccess: true,
  })
  return result.docs as Record<string, unknown>[]
}

// ─── Aggregate rollup docs into totals ───
function sumRollups(docs: Record<string, unknown>[]) {
  let pageviews = 0, sessions = 0, uniqueVisitors = 0, bounces = 0
  let conversions = 0, totalEvents = 0, totalDuration = 0, scrollSum = 0

  for (const d of docs) {
    pageviews += (d.pageviews as number) || 0
    sessions += (d.sessions as number) || 0
    uniqueVisitors += (d.uniqueVisitors as number) || 0
    bounces += (d.bounces as number) || 0
    conversions += (d.conversions as number) || 0
    totalEvents += (d.totalEvents as number) || 0
    totalDuration += (d.totalDuration as number) || 0
    scrollSum += ((d.avgScrollDepth as number) || 0) * ((d.sessions as number) || 0)
  }

  return {
    pageviews, sessions, uniqueVisitors, bounces, conversions, totalEvents, totalDuration,
    bounceRate: sessions > 0 ? Math.round((bounces / sessions) * 100) : 0,
    avgDuration: sessions > 0 ? Math.round(totalDuration / sessions) : 0,
    avgScrollDepth: sessions > 0 ? Math.round(scrollSum / sessions) : 0,
    pagesPerSession: sessions > 0 ? Math.round((pageviews / sessions) * 100) / 100 : 0,
    conversionRate: sessions > 0 ? Math.round((conversions / sessions) * 10000) / 100 : 0,
  }
}

// ─── Group rollup docs by dimensionValue ───
function groupByValue(docs: Record<string, unknown>[]) {
  const groups: Record<string, Record<string, unknown>[]> = {}
  for (const d of docs) {
    const val = (d.dimensionValue as string) || 'unknown'
    if (!groups[val]) groups[val] = []
    groups[val].push(d)
  }
  return Object.entries(groups)
    .map(([value, items]) => ({ value, ...sumRollups(items) }))
    .sort((a, b) => b.sessions - a.sessions)
}

// ─── Get date range strings ───
function getDateRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

function getPrevDateRange(days: number) {
  const end = new Date()
  end.setDate(end.getDate() - days)
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

function calcTrend(current: number, previous: number) {
  if (previous === 0) return { change: current > 0 ? 100 : 0, direction: current > 0 ? 'up' as const : 'flat' as const }
  const change = Math.round(((current - previous) / previous) * 100)
  return { change: Math.abs(change), direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'flat' as const }
}

type PayloadClient = Awaited<ReturnType<typeof getPayloadClient>>

const CACHE_HEADERS = { 'Cache-Control': 'private, max-age=60' }

// ─── Build base response (KPIs, trends, daily trend) ───
async function buildBase(payload: PayloadClient, days: number, startDate: string, endDate: string) {
  const prev = getPrevDateRange(days)
  const [overallDocs, prevOverallDocs] = await Promise.all([
    fetchRollups(payload, startDate, endDate, 'overall'),
    fetchRollups(payload, prev.startDate, prev.endDate, 'overall'),
  ])
  const current = sumRollups(overallDocs)
  const previous = sumRollups(prevOverallDocs)

  const dailyTrend = overallDocs.map(d => ({
    date: d.date as string, pageviews: (d.pageviews as number) || 0,
    sessions: (d.sessions as number) || 0, uniqueVisitors: (d.uniqueVisitors as number) || 0,
    bounces: (d.bounces as number) || 0,
  }))

  const [totalRegCount, recentRegCount, prevRegCount] = await Promise.all([
    payload.count({ collection: 'registrations', overrideAccess: true }),
    payload.count({ collection: 'registrations', where: { createdAt: { greater_than: new Date(startDate).toISOString() } }, overrideAccess: true }),
    payload.count({ collection: 'registrations', where: { and: [{ createdAt: { greater_than: new Date(prev.startDate).toISOString() } }, { createdAt: { less_than_equal: new Date(prev.endDate).toISOString() } }] }, overrideAccess: true }),
  ])

  return {
    period: { days, startDate, endDate },
    kpi: {
      pageviews: current.pageviews, sessions: current.sessions, uniqueVisitors: current.uniqueVisitors,
      bounceRate: current.bounceRate, avgDuration: current.avgDuration, pagesPerSession: current.pagesPerSession,
      totalEvents: current.totalEvents, conversions: current.conversions, conversionRate: current.conversionRate,
      totalRegistrations: totalRegCount.totalDocs, recentRegistrations: recentRegCount.totalDocs,
    },
    trends: {
      pageviews: calcTrend(current.pageviews, previous.pageviews), sessions: calcTrend(current.sessions, previous.sessions),
      uniqueVisitors: calcTrend(current.uniqueVisitors, previous.uniqueVisitors), bounceRate: calcTrend(current.bounceRate, previous.bounceRate),
      registrations: calcTrend(recentRegCount.totalDocs, prevRegCount.totalDocs), events: calcTrend(current.totalEvents, previous.totalEvents),
    },
    dailyTrend,
    generatedAt: new Date().toISOString(),
  }
}

// ─── Tab handlers ───
async function tabAcquisition(payload: PayloadClient, base: Record<string, unknown>, s: string, e: string) {
  const [ch, utm, camp, ref] = await Promise.all([
    fetchRollups(payload, s, e, 'channel'), fetchRollups(payload, s, e, 'utm_source'),
    fetchRollups(payload, s, e, 'utm_campaign'), fetchRollups(payload, s, e, 'referrer_domain'),
  ])
  return NextResponse.json({ ...base, tab: 'acquisition', channels: groupByValue(ch).slice(0, 10),
    utmSources: groupByValue(utm).slice(0, 15), utmCampaigns: groupByValue(camp).slice(0, 15),
    referrers: groupByValue(ref).slice(0, 15) }, { headers: CACHE_HEADERS })
}

async function tabTechnology(payload: PayloadClient, base: Record<string, unknown>, s: string, e: string) {
  const [dev, br, os] = await Promise.all([
    fetchRollups(payload, s, e, 'device'), fetchRollups(payload, s, e, 'browser'), fetchRollups(payload, s, e, 'os'),
  ])
  return NextResponse.json({ ...base, tab: 'technology', devices: groupByValue(dev),
    browsers: groupByValue(br).slice(0, 10), operatingSystems: groupByValue(os).slice(0, 10) }, { headers: CACHE_HEADERS })
}

async function tabBehavior(payload: PayloadClient, base: Record<string, unknown>, s: string, e: string) {
  const pathDocs = await fetchRollups(payload, s, e, 'path')
  const funnelResult = await payload.find({
    collection: 'analytics-funnel-events',
    where: { createdAt: { greater_than: new Date(s).toISOString() } },
    limit: 10000, select: { step: true, stepOrder: true, sessionId: true },
    overrideAccess: true,
  })
  const funnelSteps: Record<string, Set<string>> = {}
  for (const doc of funnelResult.docs) {
    const step = doc.step as string; const sid = doc.sessionId as string
    if (!funnelSteps[step]) funnelSteps[step] = new Set()
    funnelSteps[step].add(sid)
  }
  const order = ['landing', 'engagement', 'weapon_click', 'event_page', 'form_interaction', 'registration', 'store_click', 'referral_share']
  const labels: Record<string, string> = { landing: 'Landing', engagement: 'Engagement (50%+ scroll)', weapon_click: 'Weapon Clicks', event_page: 'Event Page Visit',
    form_interaction: 'Form Interaction', registration: 'Registration', store_click: 'Store Links Clicked', referral_share: 'Referral Share' }
  const funnel = order.map(step => ({ step, label: labels[step] || step, count: funnelSteps[step]?.size || 0 }))
  return NextResponse.json({ ...base, tab: 'behavior', topPages: groupByValue(pathDocs).slice(0, 20), funnel }, { headers: CACHE_HEADERS })
}

async function tabOverview(payload: PayloadClient, base: Record<string, unknown>, s: string, e: string) {
  const [ch, dev, path] = await Promise.all([
    fetchRollups(payload, s, e, 'channel'), fetchRollups(payload, s, e, 'device'), fetchRollups(payload, s, e, 'path'),
  ])
  return NextResponse.json({ ...base, tab: 'overview', channels: groupByValue(ch).slice(0, 5),
    devices: groupByValue(dev), topPages: groupByValue(path).slice(0, 10) }, { headers: CACHE_HEADERS })
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(`dashboard:${ip}`, 15, 60000)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    const auth = await requireAdmin(request)
    if ('error' in auth) return auth.error

    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    const days = Math.min(parseInt(searchParams.get('days') || '30', 10), 365)
    const tab = searchParams.get('tab') || 'overview'
    const { startDate, endDate } = getDateRange(days)

    const base = await buildBase(payload, days, startDate, endDate)
    const handlers: Record<string, () => Promise<NextResponse>> = {
      acquisition: () => tabAcquisition(payload, base, startDate, endDate),
      technology: () => tabTechnology(payload, base, startDate, endDate),
      behavior: () => tabBehavior(payload, base, startDate, endDate),
    }

    return await (handlers[tab] || (() => tabOverview(payload, base, startDate, endDate)))()
  } catch (error) {
    console.error('[/api/analytics/dashboard] Error:', error)
    return NextResponse.json({ error: 'Dashboard query failed' }, { status: 500 })
  }
}

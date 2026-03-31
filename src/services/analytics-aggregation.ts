import type { Payload } from 'payload'
import { isBot } from '@/lib/bot-detection'

/**
 * Analytics Aggregation Service
 * Extracted from api/analytics/route.ts for SRP compliance
 * Handles all data aggregation logic separate from HTTP concerns
 */

// ─── Device detection ───
export function getDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

// ─── Trend calculation ───
export function calcTrend(current: number, previous: number): { change: number; direction: 'up' | 'down' | 'flat' } {
  if (previous === 0) return { change: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'flat' }
  const change = Math.round(((current - previous) / previous) * 100)
  return { change: Math.abs(change), direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat' }
}

// ─── Date range helpers ───
export function buildDateRange(days: number) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const prevStart = new Date(since)
  prevStart.setDate(prevStart.getDate() - days)
  return { since, prevStart }
}

// ─── Count queries (efficient, no doc loading) ───
export async function fetchCounts(payload: Payload, since: Date, prevStart: Date) {
  const [
    totalRegistrations, recentRegistrations, prevRegistrations,
    totalPageViews, prevPageViews,
    totalEvents, prevEvents,
  ] = await Promise.all([
    payload.count({ collection: 'registrations', overrideAccess: true }),
    payload.count({ collection: 'registrations', where: { createdAt: { greater_than: since.toISOString() } }, overrideAccess: true }),
    payload.count({ collection: 'registrations', where: { and: [
      { createdAt: { greater_than: prevStart.toISOString() } },
      { createdAt: { less_than_equal: since.toISOString() } },
    ] }, overrideAccess: true }),
    payload.count({ collection: 'page-views', where: { createdAt: { greater_than: since.toISOString() } }, overrideAccess: true }),
    payload.count({ collection: 'page-views', where: { and: [
      { createdAt: { greater_than: prevStart.toISOString() } },
      { createdAt: { less_than_equal: since.toISOString() } },
    ] }, overrideAccess: true }),
    payload.count({ collection: 'page-events', where: { createdAt: { greater_than: since.toISOString() } }, overrideAccess: true }),
    payload.count({ collection: 'page-events', where: { and: [
      { createdAt: { greater_than: prevStart.toISOString() } },
      { createdAt: { less_than_equal: since.toISOString() } },
    ] }, overrideAccess: true }),
  ])

  return {
    totalRegistrations: totalRegistrations.totalDocs,
    recentRegistrations: recentRegistrations.totalDocs,
    prevRegistrations: prevRegistrations.totalDocs,
    totalPageViews: totalPageViews.totalDocs,
    prevPageViews: prevPageViews.totalDocs,
    totalEvents: totalEvents.totalDocs,
    prevEvents: prevEvents.totalDocs,
  }
}

// ─── Fetch raw docs for aggregation ───
const MAX_AGGREGATION_DOCS = 10000

export async function fetchRawDocs(payload: Payload, since: Date) {
  const [pvResult, evResult, regResult] = await Promise.all([
    payload.find({
      collection: 'page-views',
      where: { createdAt: { greater_than: since.toISOString() } },
      limit: MAX_AGGREGATION_DOCS, sort: '-createdAt',
      select: { path: true, ip: true, sessionId: true, userAgent: true, createdAt: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'page-events',
      where: { createdAt: { greater_than: since.toISOString() } },
      limit: MAX_AGGREGATION_DOCS, sort: '-createdAt',
      select: { eventName: true, path: true, createdAt: true },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'registrations',
      where: { createdAt: { greater_than: since.toISOString() } },
      limit: MAX_AGGREGATION_DOCS, sort: '-createdAt',
      select: { region: true, platform: true, createdAt: true },
      overrideAccess: true,
    }),
  ])

  return {
    pvDocs: pvResult.docs,
    evDocs: evResult.docs,
    regDocs: regResult.docs,
    maxAggregationDocs: MAX_AGGREGATION_DOCS,
  }
}

// ─── Aggregate page view metrics ───
export function aggregatePageViews(pvDocs: Record<string, unknown>[]) {
  const humanPvDocs = pvDocs.filter(d => !isBot((d.userAgent as string) || ''))
  const uniqueIPs = new Set(humanPvDocs.map(d => d.ip)).size

  // Sessions
  const sessionIds = new Set(humanPvDocs.map(d => d.sessionId).filter(Boolean))
  const totalSessions = sessionIds.size || 1

  // Bounce rate
  const pagesPerSession: Record<string, number> = {}
  for (const doc of humanPvDocs) {
    const sid = (doc.sessionId as string) || 'no-session'
    pagesPerSession[sid] = (pagesPerSession[sid] || 0) + 1
  }
  const singlePageSessions = Object.values(pagesPerSession).filter(c => c === 1).length
  const bounceRate = totalSessions > 0 ? Math.round((singlePageSessions / totalSessions) * 100) : 0
  const avgPagesPerSession = totalSessions > 0 ? Math.round((humanPvDocs.length / totalSessions) * 100) / 100 : 0

  // Device breakdown
  const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 }
  const countedSessions = new Set<string>()
  for (const doc of humanPvDocs) {
    const sid = (doc.sessionId as string) || doc.ip as string
    if (!countedSessions.has(sid)) {
      countedSessions.add(sid)
      deviceCounts[getDeviceType((doc.userAgent as string) || '')] += 1
    }
  }

  // Top pages
  const pageViewsByPath: Record<string, number> = {}
  for (const doc of humanPvDocs) {
    const p = (doc.path as string) || '/'
    pageViewsByPath[p] = (pageViewsByPath[p] || 0) + 1
  }
  const topPages = Object.entries(pageViewsByPath)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([path, count]) => ({ path, count }))

  // By date
  const pvByDate: Record<string, number> = {}
  for (const doc of humanPvDocs) {
    const day = new Date(doc.createdAt as string).toISOString().split('T')[0]
    pvByDate[day] = (pvByDate[day] || 0) + 1
  }

  return {
    humanCount: humanPvDocs.length,
    botsFiltered: pvDocs.length - humanPvDocs.length,
    uniqueVisitors: uniqueIPs,
    totalSessions, bounceRate, avgPagesPerSession,
    deviceCounts, topPages, pvByDate,
  }
}

// ─── Aggregate events ───
export function aggregateEvents(evDocs: Record<string, unknown>[]) {
  const eventsByName: Record<string, number> = {}
  for (const doc of evDocs) {
    const name = (doc.eventName as string) || 'unknown'
    eventsByName[name] = (eventsByName[name] || 0) + 1
  }
  return Object.entries(eventsByName)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, count]) => ({ name, count }))
}

// ─── Aggregate registrations ───
export function aggregateRegistrations(regDocs: Record<string, unknown>[]) {
  const byRegion: Record<string, number> = {}
  const byPlatform: Record<string, number> = {}
  const byDate: Record<string, number> = {}

  for (const doc of regDocs) {
    const region = (doc.region as string) || 'unknown'
    byRegion[region] = (byRegion[region] || 0) + 1
    const plat = (doc.platform as string) || 'unknown'
    byPlatform[plat] = (byPlatform[plat] || 0) + 1
    const day = new Date(doc.createdAt as string).toISOString().split('T')[0]
    byDate[day] = (byDate[day] || 0) + 1
  }

  return {
    byRegion: Object.entries(byRegion).sort((a, b) => b[1] - a[1]).map(([region, count]) => ({ region, count })),
    byPlatform: Object.entries(byPlatform).sort((a, b) => b[1] - a[1]).map(([platform, count]) => ({ platform, count })),
    byDate: Object.entries(byDate).sort().map(([date, count]) => ({ date, count })),
  }
}

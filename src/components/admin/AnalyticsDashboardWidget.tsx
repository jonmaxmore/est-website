'use client'

import React, { useEffect, useReducer, useState } from 'react'
import '@/app/styles/admin-widget.css'

/**
 * Analytics Dashboard Widget for Payload CMS Admin
 * Rendered via afterDashboard in payload.config.ts
 * Professional, clean design — no emojis
 */

interface KpiData {
  pageviews: number
  sessions: number
  uniqueVisitors: number
  bounceRate: number
  avgDuration: number
  pagesPerSession: number
  totalEvents: number
  conversions: number
  conversionRate: number
  totalRegistrations: number
  recentRegistrations: number
}

interface TrendData {
  change: number
  direction: 'up' | 'down' | 'flat'
}

interface DashboardResponse {
  period: { days: number }
  kpi: KpiData
  trends: {
    pageviews: TrendData
    sessions: TrendData
    uniqueVisitors: TrendData
    bounceRate: TrendData
    registrations: TrendData
    events: TrendData
  }
  funnel?: Array<{ step: string; label: string; count: number }>
  generatedAt: string
}

type State = { data: DashboardResponse | null; loading: boolean; error: string }
type Action =
  | { type: 'START' }
  | { type: 'OK'; data: DashboardResponse }
  | { type: 'ERR'; error: string }

function reducer(_s: State, a: Action): State {
  switch (a.type) {
    case 'START': return { data: null, loading: true, error: '' }
    case 'OK': return { data: a.data, loading: false, error: '' }
    case 'ERR': return { data: null, loading: false, error: a.error }
  }
}

function TrendBadge({ trend }: { trend: TrendData }) {
  const arrow = trend.direction === 'up' ? '\u2191' : trend.direction === 'down' ? '\u2193' : '\u2014'
  return (
    <span className={`analytics-widget__trend analytics-widget__trend--${trend.direction}`}>
      {arrow} {trend.change}%
    </span>
  )
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
    </svg>
  )
}

export default function AnalyticsDashboardWidget() {
  const [{ data, loading, error }, dispatch] = useReducer(reducer, { data: null, loading: true, error: '' })
  const [days, setDays] = useState(30)

  useEffect(() => {
    dispatch({ type: 'START' })
    fetch(`/api/analytics/dashboard?days=${days}&tab=behavior`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(r.status === 401 ? 'Unauthorized' : `HTTP ${r.status}`)
        return r.json()
      })
      .then(d => {
        if (d.error) dispatch({ type: 'ERR', error: d.error })
        else dispatch({ type: 'OK', data: d })
      })
      .catch(e => dispatch({ type: 'ERR', error: e.message || 'Failed to load' }))
  }, [days])

  return (
    <div className="analytics-widget">
      <div className="analytics-widget__header">
        <div>
          <h2 className="analytics-widget__title">
            <ChartIcon />
            Website Analytics
          </h2>
          <p className="analytics-widget__subtitle">Last {days} days</p>
        </div>
        <div className="analytics-widget__controls">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`analytics-widget__btn ${days === d ? 'analytics-widget__btn--active' : ''}`}
            >
              {d}D
            </button>
          ))}
          <a href="/admin-analytics" className="analytics-widget__link">
            Dashboard <ArrowRightIcon />
          </a>
        </div>
      </div>

      {loading && <p className="analytics-widget__loading">Loading analytics...</p>}
      {error && <p className="analytics-widget__error">{error}</p>}

      {data && !loading && (
        <>
          <div className="analytics-widget__grid">
            <MetricCard label="Registrations" value={fmt(data.kpi.totalRegistrations)} trend={data.trends.registrations} />
            <MetricCard label={`New (${days}D)`} value={fmt(data.kpi.recentRegistrations)} trend={data.trends.registrations} />
            <MetricCard label="Page Views" value={fmt(data.kpi.pageviews)} trend={data.trends.pageviews} />
            <MetricCard label="Visitors" value={fmt(data.kpi.uniqueVisitors)} trend={data.trends.uniqueVisitors} />
            <MetricCard label="Sessions" value={fmt(data.kpi.sessions)} trend={data.trends.sessions} />
            <MetricCard label="Bounce Rate" value={`${data.kpi.bounceRate}%`} />
            <MetricCard label="Avg Duration" value={formatDuration(data.kpi.avgDuration)} />
            <MetricCard label="Events" value={fmt(data.kpi.totalEvents)} trend={data.trends.events} />
          </div>

          {data.funnel && data.funnel.length > 0 && (
            <div className="analytics-widget__events">
              <h3 className="analytics-widget__title analytics-widget__title--small">Key Player Events</h3>
              <div className="analytics-widget__grid">
                {data.funnel
                  .filter((step) => ['weapon_click', 'store_click', 'event_page', 'form_interaction'].includes(step.step))
                  .map((step) => (
                    <MetricCard key={step.step} label={step.label} value={fmt(step.count)} />
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend?: TrendData }) {
  return (
    <div className="analytics-widget__card">
      <div className="analytics-widget__card-label">{label}</div>
      <div className="analytics-widget__card-value">{value}</div>
      {trend && (
        <div className="analytics-widget__card-trend">
          <TrendBadge trend={trend} />
        </div>
      )}
    </div>
  )
}

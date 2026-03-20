'use client'

import React, { useEffect, useReducer, useState } from 'react'
import '@/app/styles/admin-widget.css'

/**
 * Analytics Dashboard Widget for Payload CMS Admin
 * Rendered via afterDashboard in payload.config.ts
 * Shows key metrics from internal analytics DB
 */

interface OverviewData {
  totalRegistrations: number
  recentRegistrations: number
  totalPageViews: number
  uniqueVisitors: number
  totalSessions: number
  bounceRate: number
  avgPagesPerSession: number
  totalEvents: number
}

interface TrendData {
  change: number
  direction: 'up' | 'down' | 'flat'
}

interface AnalyticsResponse {
  period: { days: number }
  overview: OverviewData
  trends: {
    registrations: TrendData
    pageViews: TrendData
    events: TrendData
  }
  devices: Array<{ device: string; count: number }>
}

type State = { data: AnalyticsResponse | null; loading: boolean; error: string }
type Action =
  | { type: 'START' }
  | { type: 'OK'; data: AnalyticsResponse }
  | { type: 'ERR'; error: string }

function reducer(_s: State, a: Action): State {
  switch (a.type) {
    case 'START': return { data: null, loading: true, error: '' }
    case 'OK': return { data: a.data, loading: false, error: '' }
    case 'ERR': return { data: null, loading: false, error: a.error }
  }
}

const TREND_ICONS = { up: '↑', down: '↓', flat: '→' }

function TrendBadge({ trend }: { trend: TrendData }) {
  return (
    <span className={`analytics-widget__trend analytics-widget__trend--${trend.direction}`}>
      {TREND_ICONS[trend.direction]} {trend.change}%
    </span>
  )
}

// eslint-disable-next-line max-lines-per-function -- Dashboard widget with KPI cards
export default function AnalyticsDashboardWidget() {
  const [{ data, loading, error }, dispatch] = useReducer(reducer, { data: null, loading: true, error: '' })
  const [days, setDays] = useState(30)

  useEffect(() => {
    dispatch({ type: 'START' })
    fetch(`/api/analytics?days=${days}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.error) dispatch({ type: 'ERR', error: d.error })
        else dispatch({ type: 'OK', data: d })
      })
      .catch(() => dispatch({ type: 'ERR', error: 'Failed to load' }))
  }, [days])

  return (
    <div className="analytics-widget">
      <div className="analytics-widget__header">
        <div>
          <h2 className="analytics-widget__title">📊 Website Analytics</h2>
          <p className="analytics-widget__subtitle">Internal DB — Real-time data</p>
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
            Full Dashboard →
          </a>
        </div>
      </div>

      {loading && <p className="analytics-widget__loading">Loading...</p>}
      {error && <p className="analytics-widget__error">{error}</p>}

      {data && !loading && (
        <div className="analytics-widget__grid">
          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">👥</div>
            <div className="analytics-widget__card-value analytics-widget__val--amber">
              {data.overview.totalRegistrations.toLocaleString()}
            </div>
            <div className="analytics-widget__card-label">Total Registrations</div>
          </div>

          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">📈</div>
            <div className="analytics-widget__card-value analytics-widget__val--green">
              {data.overview.recentRegistrations.toLocaleString()}
            </div>
            <div className="analytics-widget__card-label">
              Registrations ({days}D)
              <TrendBadge trend={data.trends.registrations} />
            </div>
          </div>

          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">👁️</div>
            <div className="analytics-widget__card-value analytics-widget__val--blue">
              {data.overview.totalPageViews.toLocaleString()}
            </div>
            <div className="analytics-widget__card-label">
              Page Views ({days}D)
              <TrendBadge trend={data.trends.pageViews} />
            </div>
          </div>

          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">🌐</div>
            <div className="analytics-widget__card-value analytics-widget__val--purple">
              {data.overview.uniqueVisitors.toLocaleString()}
            </div>
            <div className="analytics-widget__card-label">Unique Visitors</div>
          </div>

          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">📊</div>
            <div className="analytics-widget__card-value analytics-widget__val--orange">
              {data.overview.totalSessions.toLocaleString()}
            </div>
            <div className="analytics-widget__card-label">Sessions</div>
          </div>

          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">📉</div>
            <div className={`analytics-widget__card-value ${data.overview.bounceRate > 70 ? 'analytics-widget__val--red' : 'analytics-widget__val--green'}`}>
              {data.overview.bounceRate}%
            </div>
            <div className="analytics-widget__card-label">Bounce Rate</div>
          </div>

          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">📄</div>
            <div className="analytics-widget__card-value analytics-widget__val--cyan">
              {data.overview.avgPagesPerSession}
            </div>
            <div className="analytics-widget__card-label">Avg Pages/Session</div>
          </div>

          <div className="analytics-widget__card">
            <div className="analytics-widget__card-icon">🖱️</div>
            <div className="analytics-widget__card-value analytics-widget__val--red">
              {data.overview.totalEvents.toLocaleString()}
            </div>
            <div className="analytics-widget__card-label">
              Events ({days}D)
              <TrendBadge trend={data.trends.events} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

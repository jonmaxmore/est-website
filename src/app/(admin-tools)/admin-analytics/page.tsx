'use client'

import React, { useEffect, useReducer, useCallback, useState } from 'react'
import Link from 'next/link'
import '@/app/styles/pages/admin-analytics.css'

// ─── Extracted components ───
import BarChart from '@/components/admin/charts/BarChart'
import DimTable from '@/components/admin/charts/DimTable'
import FunnelChart from '@/components/admin/charts/FunnelChart'
import KPICard from '@/components/admin/charts/KPICard'
import {
  IconChart, IconLink, IconMonitor, IconTarget,
  IconArrowLeft, IconRefresh, IconDownload,
  IconFile, IconSmartphone, IconGlobe, IconFilter,
} from '@/components/admin/charts/icons'
import type { DailyPoint } from '@/components/admin/charts/BarChart'
import type { DimensionRow } from '@/components/admin/charts/DimTable'
import type { FunnelStep } from '@/components/admin/charts/FunnelChart'
import type { Trend } from '@/components/admin/charts/KPICard'

// ─── Types ───
interface KPI {
  pageviews: number; sessions: number; uniqueVisitors: number
  bounceRate: number; avgDuration: number; pagesPerSession: number
  totalEvents: number; conversions: number; conversionRate: number
  totalRegistrations: number; recentRegistrations: number
}

interface DashboardData {
  period: { days: number; startDate: string; endDate: string }
  kpi: KPI
  trends: Record<string, Trend>
  dailyTrend: DailyPoint[]
  generatedAt: string
  tab: string
  channels?: DimensionRow[]; devices?: DimensionRow[]; topPages?: DimensionRow[]
  utmSources?: DimensionRow[]; utmCampaigns?: DimensionRow[]; referrers?: DimensionRow[]
  browsers?: DimensionRow[]; operatingSystems?: DimensionRow[]
  funnel?: FunnelStep[]
}

type Tab = 'overview' | 'acquisition' | 'technology' | 'behavior'

type State = { data: DashboardData | null; loading: boolean; error: string | null; days: number; tab: Tab }
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_OK'; payload: DashboardData }
  | { type: 'FETCH_ERR'; payload: string }
  | { type: 'SET_DAYS'; payload: number }
  | { type: 'SET_TAB'; payload: Tab }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null }
    case 'FETCH_OK': return { ...state, loading: false, data: action.payload }
    case 'FETCH_ERR': return { ...state, loading: false, error: action.payload }
    case 'SET_DAYS': return { ...state, days: action.payload }
    case 'SET_TAB': return { ...state, tab: action.payload }
  }
}

const PERIODS = [
  { days: 1, label: 'Today' }, { days: 7, label: '7 Days' },
  { days: 30, label: '30 Days' }, { days: 90, label: '90 Days' },
]

const TABS: { id: Tab; label: string; Icon: React.FC }[] = [
  { id: 'overview', label: 'Overview', Icon: IconChart },
  { id: 'acquisition', label: 'Acquisition', Icon: IconLink },
  { id: 'technology', label: 'Technology', Icon: IconMonitor },
  { id: 'behavior', label: 'Behavior', Icon: IconTarget },
]

// ─── Helpers ───
function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function exportCSV(d: DashboardData) {
  const rows: string[][] = [
    ['EST Analytics Report'],
    ['Period', `${d.period.days} days`, d.period.startDate, 'to', d.period.endDate],
    ['Generated', d.generatedAt], [],
    ['KPI', 'Value'],
    ['Page Views', String(d.kpi.pageviews)], ['Sessions', String(d.kpi.sessions)],
    ['Unique Visitors', String(d.kpi.uniqueVisitors)], ['Bounce Rate', `${d.kpi.bounceRate}%`],
    ['Avg Duration', `${d.kpi.avgDuration}s`], ['Pages/Session', String(d.kpi.pagesPerSession)],
    ['Events', String(d.kpi.totalEvents)], ['Conversion Rate', `${d.kpi.conversionRate}%`],
    ['Registrations (period)', String(d.kpi.recentRegistrations)],
    ['Registrations (total)', String(d.kpi.totalRegistrations)], [],
    ['Daily Trend'], ['Date', 'Page Views', 'Sessions', 'Visitors'],
    ...d.dailyTrend.map(x => [x.date, String(x.pageviews), String(x.sessions), String(x.uniqueVisitors)]),
  ]
  if (d.topPages) {
    rows.push([], ['Top Pages'], ['Path', 'Sessions', 'Visitors', 'Bounce Rate'])
    for (const p of d.topPages) rows.push([p.value, String(p.sessions), String(p.uniqueVisitors), `${p.bounceRate}%`])
  }
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `est-analytics-${d.period.days}d-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Dashboard ───
// eslint-disable-next-line max-lines-per-function -- Page-level orchestrator: state, fetch, layout with 4 tabs. Components already extracted.
export default function AnalyticsDashboardPage() {
  const [state, dispatch] = useReducer(reducer, {
    data: null, loading: true, error: null, days: 30, tab: 'overview',
  })
  const [useLegacy, setUseLegacy] = useState(false)

  const fetchData = useCallback(async (days: number, tab: Tab) => {
    dispatch({ type: 'FETCH_START' })
    try {
      const res = await fetch(`/api/analytics/dashboard?days=${days}&tab=${tab}`, { credentials: 'include' })
      if (res.status === 401) { dispatch({ type: 'FETCH_ERR', payload: 'unauthorized' }); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.kpi && json.kpi.sessions === 0 && json.kpi.pageviews === 0 && !useLegacy) setUseLegacy(true)
      dispatch({ type: 'FETCH_OK', payload: json })
    } catch (err) {
      dispatch({ type: 'FETCH_ERR', payload: String(err) })
    }
  }, [useLegacy])

  useEffect(() => { fetchData(state.days, state.tab) }, [state.days, state.tab, fetchData])

  if (state.error === 'unauthorized') {
    return (
      <div className="da-auth-wall">
        <div className="da-auth-card">
          <h2>Authentication Required</h2>
          <p>Sign in to the CMS admin panel to access analytics.</p>
          <Link href="/admin" className="da-login-btn">Sign In</Link>
        </div>
      </div>
    )
  }

  if (state.loading && !state.data) {
    return <div className="da-loading"><div className="da-spinner" /><p>Loading analytics...</p></div>
  }

  if (state.error) {
    return (
      <div className="da-error-page">
        <h2>Unable to load analytics</h2>
        <p style={{ color: 'var(--da-text-secondary)', marginBottom: '1rem' }}>{state.error}</p>
        <button onClick={() => fetchData(state.days, state.tab)} className="da-retry-btn">Try Again</button>
      </div>
    )
  }

  const d = state.data!
  const k = d.kpi

  return (
    <div className="da-page">
      <div className="da-topbar">
        <div className="da-topbar-inner">
          <div className="da-topbar-left">
            <Link href="/admin" className="da-back"><IconArrowLeft /> CMS</Link>
            <div className="da-topbar-divider" />
            <h1 className="da-topbar-title">Analytics</h1>
          </div>
          <div className="da-topbar-right">
            <div className="da-periods">
              {PERIODS.map(p => (
                <button key={p.days} className={`da-period ${state.days === p.days ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_DAYS', payload: p.days })}>{p.label}</button>
              ))}
            </div>
            <button className="da-icon-btn" onClick={() => fetchData(state.days, state.tab)} disabled={state.loading} title="Refresh">
              <IconRefresh />
            </button>
            <button className="da-export-btn" onClick={() => d && exportCSV(d)}><IconDownload /> Export</button>
          </div>
        </div>
      </div>

      <div className="da-container">
        <nav className="da-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`da-tab ${state.tab === t.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TAB', payload: t.id })}>
              <t.Icon /> {t.label}
            </button>
          ))}
        </nav>

        <section className="da-kpi-row">
          <KPICard label="Page Views" value={fmt(k.pageviews)} trend={d.trends.pageviews} />
          <KPICard label="Sessions" value={fmt(k.sessions)} trend={d.trends.sessions} />
          <KPICard label="Unique Visitors" value={fmt(k.uniqueVisitors)} trend={d.trends.uniqueVisitors} />
          <KPICard label="Bounce Rate" value={`${k.bounceRate}%`} trend={d.trends.bounceRate} invertTrend />
          <KPICard label="Avg. Duration" value={fmtDuration(k.avgDuration)} />
          <KPICard label="Pages / Session" value={String(k.pagesPerSession)} />
          <KPICard label="Registrations" value={fmt(k.recentRegistrations)} trend={d.trends.registrations} highlight />
          <KPICard label="Conversion Rate" value={`${k.conversionRate}%`} />
        </section>

        {d.dailyTrend.length > 0 && (
          <section className="da-charts-row">
            <div className="da-card"><BarChart data={d.dailyTrend} valueKey="pageviews" label="Page Views" /></div>
            <div className="da-card"><BarChart data={d.dailyTrend} valueKey="sessions" label="Sessions" /></div>
          </section>
        )}

        {state.tab === 'overview' && (
          <section className="da-grid-3">
            <DimTable rows={d.topPages} title="Pages" icon={<IconFile />} />
            <DimTable rows={d.channels} title="Channels" icon={<IconLink />} />
            <DimTable rows={d.devices} title="Devices" icon={<IconSmartphone />} />
          </section>
        )}
        {state.tab === 'acquisition' && (
          <section className="da-grid-2">
            <DimTable rows={d.channels} title="Channels" icon={<IconLink />} />
            <DimTable rows={d.utmSources} title="UTM Sources" icon={<IconGlobe />} />
            <DimTable rows={d.utmCampaigns} title="Campaigns" icon={<IconTarget />} />
            <DimTable rows={d.referrers} title="Referrers" icon={<IconGlobe />} />
          </section>
        )}
        {state.tab === 'technology' && (
          <section className="da-grid-3">
            <DimTable rows={d.devices} title="Devices" icon={<IconSmartphone />} />
            <DimTable rows={d.browsers} title="Browsers" icon={<IconGlobe />} />
            <DimTable rows={d.operatingSystems} title="Operating Systems" icon={<IconMonitor />} />
          </section>
        )}
        {state.tab === 'behavior' && (
          <section className="da-grid-2">
            <DimTable rows={d.topPages} title="Pages" icon={<IconFile />} />
            <div className="da-card">
              <div className="da-card-header"><h3 className="da-card-title"><IconFilter /> Conversion Funnel</h3></div>
              <FunnelChart steps={d.funnel} />
            </div>
          </section>
        )}

        <footer className="da-footer">
          <p>Last updated: {new Date(d.generatedAt).toLocaleString()}</p>
          {useLegacy && <p className="da-footer-note">Rollup data pending — run POST /api/analytics/rollup to populate</p>}
        </footer>
      </div>
    </div>
  )
}

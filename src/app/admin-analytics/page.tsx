'use client';

import React, { useEffect, useReducer, useCallback, useState } from 'react';
import Link from 'next/link';
import '@/app/styles/pages/admin-analytics.css';

/* ═══════════════════════════════════════════════
   EST Enterprise Analytics Dashboard
   Multi-tab layout: Overview | Acquisition | Technology | Behavior
   Reads from /api/analytics/dashboard (rollup-powered)
   Falls back to /api/analytics (legacy) if rollups empty
   ═══════════════════════════════════════════════ */

// ─── Types ───
interface KPI {
  pageviews: number; sessions: number; uniqueVisitors: number;
  bounceRate: number; avgDuration: number; pagesPerSession: number;
  totalEvents: number; conversions: number; conversionRate: number;
  totalRegistrations: number; recentRegistrations: number;
}

interface Trend { change: number; direction: 'up' | 'down' | 'flat' }

interface DailyPoint { date: string; pageviews: number; sessions: number; uniqueVisitors: number }

interface DimensionRow {
  value: string; pageviews: number; sessions: number; uniqueVisitors: number;
  bounceRate: number; avgDuration: number; conversionRate: number;
}

interface FunnelStep { step: string; label: string; count: number }

interface DashboardData {
  period: { days: number; startDate: string; endDate: string };
  kpi: KPI;
  trends: Record<string, Trend>;
  dailyTrend: DailyPoint[];
  generatedAt: string;
  tab: string;
  // Overview
  channels?: DimensionRow[];
  devices?: DimensionRow[];
  topPages?: DimensionRow[];
  // Acquisition
  utmSources?: DimensionRow[];
  utmCampaigns?: DimensionRow[];
  referrers?: DimensionRow[];
  // Technology
  browsers?: DimensionRow[];
  operatingSystems?: DimensionRow[];
  // Behavior
  funnel?: FunnelStep[];
}

type Tab = 'overview' | 'acquisition' | 'technology' | 'behavior';

type State = { data: DashboardData | null; loading: boolean; error: string | null; days: number; tab: Tab };
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_OK'; payload: DashboardData }
  | { type: 'FETCH_ERR'; payload: string }
  | { type: 'SET_DAYS'; payload: number }
  | { type: 'SET_TAB'; payload: Tab };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_OK': return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERR': return { ...state, loading: false, error: action.payload };
    case 'SET_DAYS': return { ...state, days: action.payload };
    case 'SET_TAB': return { ...state, tab: action.payload };
  }
}

const PERIODS = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 90, label: '90D' },
];

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'acquisition', label: 'Acquisition', icon: '🔗' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'behavior', label: 'Behavior', icon: '🎯' },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function trendBadge(trend?: Trend) {
  if (!trend) return null;
  const cls = trend.direction === 'up' ? 'trend-up' : trend.direction === 'down' ? 'trend-down' : 'trend-flat';
  const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '—';
  return <span className={`da-trend ${cls}`}>{arrow} {trend.change}%</span>;
}

// ─── Bar chart component ───
function BarChart({ data, valueKey, label }: { data: DailyPoint[]; valueKey: keyof DailyPoint; label: string }) {
  if (data.length === 0) return <p className="da-empty">No data</p>;
  const values = data.map(d => d[valueKey] as number);
  const max = Math.max(...values, 1);
  return (
    <div className="da-chart-container">
      <div className="da-chart-label">{label}</div>
      <div className="da-bar-chart">
        {data.map((d) => (
          <div className="da-bar-col" key={d.date} title={`${d.date}: ${d[valueKey]}`}>
            <span className="da-bar-val">{d[valueKey] as number}</span>
            <div className="da-bar" style={{ height: `${((d[valueKey] as number) / max) * 100}%` }} />
            <span className="da-bar-date">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dimension table component ───
function DimTable({ rows, title, icon }: { rows?: DimensionRow[]; title: string; icon: string }) {
  if (!rows || rows.length === 0) return (
    <div className="da-card">
      <h3 className="da-card-title">{icon} {title}</h3>
      <p className="da-empty">No data yet</p>
    </div>
  );
  const maxSessions = rows[0]?.sessions || 1;
  return (
    <div className="da-card">
      <h3 className="da-card-title">{icon} {title}</h3>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead>
            <tr>
              <th>{title}</th>
              <th>Sessions</th>
              <th>Visitors</th>
              <th>Bounce</th>
              <th>Avg Dur</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="da-cell-name">{r.value}</td>
                <td className="da-cell-num">{fmt(r.sessions)}</td>
                <td className="da-cell-num">{fmt(r.uniqueVisitors)}</td>
                <td className="da-cell-num">{r.bounceRate}%</td>
                <td className="da-cell-num">{fmtDuration(r.avgDuration)}</td>
                <td className="da-cell-bar">
                  <div className="da-minibar-track">
                    <div className="da-minibar-fill" style={{ width: `${(r.sessions / maxSessions) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Funnel visualization ───
function FunnelChart({ steps }: { steps?: FunnelStep[] }) {
  if (!steps || steps.length === 0) return <p className="da-empty">No funnel data yet</p>;
  const max = Math.max(...steps.map(s => s.count), 1);
  return (
    <div className="da-funnel">
      {steps.map((s, i) => {
        const pct = max > 0 ? (s.count / max) * 100 : 0;
        const dropoff = i > 0 && steps[i - 1].count > 0
          ? Math.round(((steps[i - 1].count - s.count) / steps[i - 1].count) * 100)
          : 0;
        return (
          <div className="da-funnel-step" key={s.step}>
            <div className="da-funnel-label">
              <span className="da-funnel-name">{s.label}</span>
              <span className="da-funnel-count">{fmt(s.count)}</span>
              {i > 0 && dropoff > 0 && <span className="da-funnel-drop">-{dropoff}%</span>}
            </div>
            <div className="da-funnel-bar-track">
              <div className="da-funnel-bar" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CSV Export ───
function exportCSV(d: DashboardData) {
  const rows: string[][] = [
    ['EST Analytics Report'],
    ['Period', `${d.period.days} days`, d.period.startDate, 'to', d.period.endDate],
    ['Generated', d.generatedAt],
    [],
    ['KPI', 'Value'],
    ['Page Views', String(d.kpi.pageviews)],
    ['Sessions', String(d.kpi.sessions)],
    ['Unique Visitors', String(d.kpi.uniqueVisitors)],
    ['Bounce Rate', `${d.kpi.bounceRate}%`],
    ['Avg Duration', `${d.kpi.avgDuration}s`],
    ['Pages/Session', String(d.kpi.pagesPerSession)],
    ['Events', String(d.kpi.totalEvents)],
    ['Conversions', String(d.kpi.conversions)],
    ['Conversion Rate', `${d.kpi.conversionRate}%`],
    ['Registrations (period)', String(d.kpi.recentRegistrations)],
    ['Registrations (total)', String(d.kpi.totalRegistrations)],
    [],
    ['Daily Trend'],
    ['Date', 'Page Views', 'Sessions', 'Visitors'],
    ...d.dailyTrend.map(x => [x.date, String(x.pageviews), String(x.sessions), String(x.uniqueVisitors)]),
  ];
  if (d.topPages) {
    rows.push([], ['Top Pages'], ['Path', 'Sessions', 'Visitors', 'Bounce Rate']);
    for (const p of d.topPages) rows.push([p.value, String(p.sessions), String(p.uniqueVisitors), `${p.bounceRate}%`]);
  }
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `est-analytics-${d.period.days}d-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Dashboard ───
// eslint-disable-next-line max-lines-per-function
export default function AnalyticsDashboardPage() {
  const [state, dispatch] = useReducer(reducer, {
    data: null, loading: true, error: null, days: 30, tab: 'overview',
  });
  const [useLegacy, setUseLegacy] = useState(false);

  const fetchData = useCallback(async (days: number, tab: Tab) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch(`/api/analytics/dashboard?days=${days}&tab=${tab}`, { credentials: 'include' });
      if (res.status === 401) { dispatch({ type: 'FETCH_ERR', payload: 'unauthorized' }); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Check if rollups have data
      if (json.kpi && json.kpi.sessions === 0 && json.kpi.pageviews === 0 && !useLegacy) {
        setUseLegacy(true);
      }
      dispatch({ type: 'FETCH_OK', payload: json });
    } catch (err) {
      dispatch({ type: 'FETCH_ERR', payload: String(err) });
    }
  }, [useLegacy]);

  useEffect(() => { fetchData(state.days, state.tab); }, [state.days, state.tab, fetchData]);

  // Auth wall
  if (state.error === 'unauthorized') {
    return (
      <div className="da-auth-wall">
        <div className="da-auth-card">
          <h2>Admin Access Required</h2>
          <p>Please login to the CMS admin panel first.</p>
          <Link href="/admin" className="da-login-btn">Login to CMS</Link>
        </div>
      </div>
    );
  }

  // Loading
  if (state.loading && !state.data) {
    return <div className="da-loading"><div className="da-spinner" /><p>Loading analytics...</p></div>;
  }

  // Error
  if (state.error) {
    return (
      <div className="da-error">
        <h2>Error loading analytics</h2>
        <p>{state.error}</p>
        <button onClick={() => fetchData(state.days, state.tab)} className="da-retry-btn">Retry</button>
      </div>
    );
  }

  const d = state.data!;
  const k = d.kpi;

  return (
    <div className="da-page">
      {/* ─── Header ─── */}
      <header className="da-header">
        <div className="da-header-left">
          <Link href="/admin" className="da-back">← CMS</Link>
          <h1 className="da-title">Analytics</h1>
          <span className="da-subtitle">Eternal Tower Saga</span>
        </div>
        <div className="da-header-right">
          <div className="da-periods">
            {PERIODS.map(p => (
              <button key={p.days} className={`da-period ${state.days === p.days ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_DAYS', payload: p.days })}>{p.label}</button>
            ))}
          </div>
          <button className="da-btn-refresh" onClick={() => fetchData(state.days, state.tab)} disabled={state.loading}>
            {state.loading ? '...' : '↻'}
          </button>
          <button className="da-btn-export" onClick={() => d && exportCSV(d)}>CSV</button>
        </div>
      </header>

      {/* ─── Tabs ─── */}
      <nav className="da-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`da-tab ${state.tab === t.id ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_TAB', payload: t.id })}>
            <span className="da-tab-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* ─── KPI Row ─── */}
      <section className="da-kpi-row">
        <KPICard label="Page Views" value={fmt(k.pageviews)} trend={d.trends.pageviews} />
        <KPICard label="Sessions" value={fmt(k.sessions)} trend={d.trends.sessions} />
        <KPICard label="Visitors" value={fmt(k.uniqueVisitors)} trend={d.trends.uniqueVisitors} />
        <KPICard label="Bounce Rate" value={`${k.bounceRate}%`} trend={d.trends.bounceRate} invertTrend />
        <KPICard label="Avg Duration" value={fmtDuration(k.avgDuration)} />
        <KPICard label="Pages/Session" value={String(k.pagesPerSession)} />
        <KPICard label="Registrations" value={fmt(k.recentRegistrations)} trend={d.trends.registrations} highlight />
        <KPICard label="Conversion" value={`${k.conversionRate}%`} />
      </section>

      {/* ─── Daily Trend Charts ─── */}
      {d.dailyTrend.length > 0 && (
        <section className="da-charts-row">
          <div className="da-card da-card-wide">
            <BarChart data={d.dailyTrend} valueKey="pageviews" label="Page Views" />
          </div>
          <div className="da-card da-card-wide">
            <BarChart data={d.dailyTrend} valueKey="sessions" label="Sessions" />
          </div>
        </section>
      )}

      {/* ─── Tab Content ─── */}
      {state.tab === 'overview' && <OverviewTab data={d} />}
      {state.tab === 'acquisition' && <AcquisitionTab data={d} />}
      {state.tab === 'technology' && <TechnologyTab data={d} />}
      {state.tab === 'behavior' && <BehaviorTab data={d} />}

      {/* ─── Footer ─── */}
      <footer className="da-footer">
        <p>Internal analytics • Last updated: {new Date(d.generatedAt).toLocaleString()}</p>
        {useLegacy && <p className="da-footer-note">Rollup data not yet available — run /api/analytics/rollup to populate</p>}
      </footer>
    </div>
  );
}

// ─── KPI Card ───
function KPICard({ label, value, trend, highlight, invertTrend }: {
  label: string; value: string; trend?: Trend; highlight?: boolean; invertTrend?: boolean;
}) {
  const effectiveTrend = invertTrend && trend ? {
    ...trend,
    direction: (trend.direction === 'up' ? 'down' : trend.direction === 'down' ? 'up' : 'flat') as Trend['direction'],
  } : trend;
  return (
    <div className={`da-kpi ${highlight ? 'da-kpi-highlight' : ''}`}>
      <div className="da-kpi-value">{value}</div>
      <div className="da-kpi-label">{label}</div>
      {effectiveTrend && trendBadge(effectiveTrend)}
    </div>
  );
}

// ─── Tab: Overview ───
function OverviewTab({ data }: { data: DashboardData }) {
  return (
    <section className="da-grid-3">
      <DimTable rows={data.topPages} title="Pages" icon="📄" />
      <DimTable rows={data.channels} title="Channels" icon="🔗" />
      <DimTable rows={data.devices} title="Devices" icon="📱" />
    </section>
  );
}

// ─── Tab: Acquisition ───
function AcquisitionTab({ data }: { data: DashboardData }) {
  return (
    <section className="da-grid-2">
      <DimTable rows={data.channels} title="Channels" icon="🔗" />
      <DimTable rows={data.utmSources} title="UTM Sources" icon="📡" />
      <DimTable rows={data.utmCampaigns} title="Campaigns" icon="📢" />
      <DimTable rows={data.referrers} title="Referrer Domains" icon="🌐" />
    </section>
  );
}

// ─── Tab: Technology ───
function TechnologyTab({ data }: { data: DashboardData }) {
  return (
    <section className="da-grid-3">
      <DimTable rows={data.devices} title="Devices" icon="📱" />
      <DimTable rows={data.browsers} title="Browsers" icon="🌐" />
      <DimTable rows={data.operatingSystems} title="Operating Systems" icon="💻" />
    </section>
  );
}

// ─── Tab: Behavior ───
function BehaviorTab({ data }: { data: DashboardData }) {
  return (
    <section className="da-grid-2">
      <DimTable rows={data.topPages} title="Pages" icon="📄" />
      <div className="da-card">
        <h3 className="da-card-title">🎯 Conversion Funnel</h3>
        <FunnelChart steps={data.funnel} />
      </div>
    </section>
  );
}

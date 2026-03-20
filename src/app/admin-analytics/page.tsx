/* eslint-disable max-lines */
'use client';

import React, { useEffect, useReducer, useCallback } from 'react';
import Link from 'next/link';
import '@/app/styles/pages/admin-analytics.css';

/* ═══════════════════════════════════════════════
   EST Analytics Dashboard
   Full-page analytics view matching /api/analytics
   ═══════════════════════════════════════════════ */

// Match the EXACT /api/analytics response shape
interface AnalyticsResponse {
  period: { days: number; since: string };
  overview: {
    totalRegistrations: number;
    recentRegistrations: number;
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    bounceRate: number;
    avgPagesPerSession: number;
    totalEvents: number;
  };
  trends: {
    registrations: { change: number; direction: 'up' | 'down' | 'flat' };
    pageViews: { change: number; direction: 'up' | 'down' | 'flat' };
    events: { change: number; direction: 'up' | 'down' | 'flat' };
  };
  devices: { device: string; count: number }[];
  registrations: {
    byRegion: { region: string; count: number }[];
    byPlatform: { platform: string; count: number }[];
    byDate: { date: string; count: number }[];
  };
  pageViews: {
    topPages: { path: string; count: number }[];
    byDate: { date: string; count: number }[];
  };
  events: {
    topEvents: { name: string; count: number }[];
  };
  dataSource: string;
  _meta: {
    docsProcessed: { pageViews: number; events: number; registrations: number };
    maxAggregationDocs: number;
    botsFiltered: number;
  };
}

type State = {
  data: AnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  days: number;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_OK'; payload: AnalyticsResponse }
  | { type: 'FETCH_ERR'; payload: string }
  | { type: 'SET_DAYS'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_OK': return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERR': return { ...state, loading: false, error: action.payload };
    case 'SET_DAYS': return { ...state, days: action.payload };
  }
}

const PERIODS = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' },
  { days: 365, label: 'All Time' },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function trendIndicator(trend: { change: number; direction: string }): string {
  if (trend.direction === 'up') return `↑ ${trend.change}%`;
  if (trend.direction === 'down') return `↓ ${trend.change}%`;
  return '—';
}

function trendClass(direction: string): string {
  if (direction === 'up') return 'analytics-trend-up';
  if (direction === 'down') return 'analytics-trend-down';
  return 'analytics-trend-neutral';
}

function exportCSV(d: AnalyticsResponse) {
  const rows: string[][] = [
    ['=== Eternal Tower Saga — Analytics Report ==='],
    ['Period', `Last ${d.period.days} days`],
    ['Generated', new Date().toISOString()],
    [],
    ['=== Overview ==='],
    ['Metric', 'Value'],
    ['Total Page Views', String(d.overview.totalPageViews)],
    ['Unique Visitors', String(d.overview.uniqueVisitors)],
    ['Registrations (period)', String(d.overview.recentRegistrations)],
    ['Total Registrations', String(d.overview.totalRegistrations)],
    ['Sessions', String(d.overview.totalSessions)],
    ['Bounce Rate', `${d.overview.bounceRate}%`],
    ['Avg Pages/Session', String(d.overview.avgPagesPerSession)],
    ['Events Tracked', String(d.overview.totalEvents)],
    [],
    ['=== Top Pages ==='],
    ['Path', 'Views'],
    ...d.pageViews.topPages.map(p => [p.path, String(p.count)]),
    [],
    ['=== Top Events ==='],
    ['Event', 'Count'],
    ...d.events.topEvents.map(e => [e.name, String(e.count)]),
    [],
    ['=== Registrations by Region ==='],
    ['Region', 'Count'],
    ...d.registrations.byRegion.map(r => [r.region.toUpperCase(), String(r.count)]),
    [],
    ['=== Registrations by Platform ==='],
    ['Platform', 'Count'],
    ...d.registrations.byPlatform.map(p => [p.platform, String(p.count)]),
    [],
    ['=== Daily Page Views ==='],
    ['Date', 'Views'],
    ...d.pageViews.byDate.map(x => [x.date, String(x.count)]),
    [],
    ['=== Daily Registrations ==='],
    ['Date', 'Count'],
    ...d.registrations.byDate.map(x => [x.date, String(x.count)]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `est-analytics-${d.period.days}d-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// eslint-disable-next-line max-lines-per-function
export default function AnalyticsDashboardPage() {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    loading: true,
    error: null,
    days: 30,
  });

  const fetchData = useCallback(async (days: number) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch(`/api/analytics?days=${days}`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        dispatch({ type: 'FETCH_ERR', payload: 'unauthorized' });
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      dispatch({ type: 'FETCH_OK', payload: json });
    } catch (err) {
      dispatch({ type: 'FETCH_ERR', payload: String(err) });
    }
  }, []);

  useEffect(() => {
    fetchData(state.days);
  }, [state.days, fetchData]);

  // Unauthorized → redirect to login
  if (state.error === 'unauthorized') {
    return (
      <div className="analytics-auth-wall">
        <div className="analytics-auth-card">
          <h2>🔒 Admin Access Required</h2>
          <p>Please login to the CMS admin panel first to access analytics.</p>
          <Link href="/admin" className="analytics-login-btn">
            Login to CMS →
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (state.loading && !state.data) {
    return (
      <div className="analytics-loading">
        <div className="analytics-spinner" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  // Error
  if (state.error) {
    return (
      <div className="analytics-error">
        <h2>⚠️ Error loading analytics</h2>
        <p>{state.error}</p>
        <button onClick={() => fetchData(state.days)} className="analytics-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const d = state.data!;
  const ov = d.overview;
  const totalDevices = d.devices.reduce((s, x) => s + x.count, 0);

  return (
    <div className="analytics-page">
      {/* Header */}
      <header className="analytics-header">
        <div className="analytics-header-left">
          <Link href="/admin" className="analytics-back-link">← Back to CMS</Link>
          <h1 className="analytics-title">📊 Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Real-time insights for Eternal Tower Saga • {d.dataSource === 'internal_db' ? 'Internal DB' : 'External'}
          </p>
        </div>
        <div className="analytics-header-right">
          <div className="analytics-period-selector">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                className={`analytics-period-btn ${state.days === p.days ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_DAYS', payload: p.days })}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            className="analytics-refresh-btn"
            onClick={() => fetchData(state.days)}
            disabled={state.loading}
          >
            {state.loading ? '⟳' : '↻'} Refresh
          </button>
          <button
            className="analytics-export-btn"
            onClick={() => state.data && exportCSV(state.data)}
            disabled={!state.data}
          >
            📥 Export CSV
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">👁️</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(ov.totalPageViews)}</span>
            <span className="analytics-kpi-label">Page Views</span>
            <span className={`analytics-kpi-trend ${trendClass(d.trends.pageViews.direction)}`}>
              {trendIndicator(d.trends.pageViews)}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">👤</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(ov.uniqueVisitors)}</span>
            <span className="analytics-kpi-label">Unique Visitors</span>
          </div>
        </div>

        <div className="analytics-kpi-card highlight">
          <div className="analytics-kpi-icon">📝</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(ov.recentRegistrations)}</span>
            <span className="analytics-kpi-label">Registrations ({d.period.days}D)</span>
            <span className={`analytics-kpi-trend ${trendClass(d.trends.registrations.direction)}`}>
              {trendIndicator(d.trends.registrations)}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">🔄</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(ov.totalSessions)}</span>
            <span className="analytics-kpi-label">Sessions</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">📈</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{ov.bounceRate}%</span>
            <span className="analytics-kpi-label">Bounce Rate</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">📄</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{ov.avgPagesPerSession.toFixed(1)}</span>
            <span className="analytics-kpi-label">Pages / Session</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">🎯</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(ov.totalEvents)}</span>
            <span className="analytics-kpi-label">Events Tracked</span>
            <span className={`analytics-kpi-trend ${trendClass(d.trends.events.direction)}`}>
              {trendIndicator(d.trends.events)}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">🤖</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(d._meta.botsFiltered)}</span>
            <span className="analytics-kpi-label">Bots Filtered</span>
          </div>
        </div>
      </section>

      {/* Daily Trends */}
      {(d.pageViews.byDate.length > 0 || d.registrations.byDate.length > 0) && (
        <section className="analytics-charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Page Views by Day */}
          <div className="analytics-chart-card">
            <h3 className="analytics-chart-title">📈 Page Views by Day</h3>
            <div className="analytics-daily-chart">
              {d.pageViews.byDate.slice(-14).map((day) => {
                const maxPV = Math.max(...d.pageViews.byDate.slice(-14).map(x => x.count));
                return (
                  <div className="analytics-daily-bar-col" key={day.date} title={`${day.date}: ${day.count} views`}>
                    <span className="analytics-daily-bar-value">{day.count}</span>
                    <div
                      className="analytics-daily-bar"
                      style={{ height: maxPV > 0 ? `${(day.count / maxPV) * 100}%` : '0%' }}
                    />
                    <span className="analytics-daily-bar-label">{day.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registrations by Day */}
          <div className="analytics-chart-card">
            <h3 className="analytics-chart-title">📝 Registrations by Day</h3>
            <div className="analytics-daily-chart">
              {d.registrations.byDate.slice(-14).map((day) => {
                const maxReg = Math.max(...d.registrations.byDate.slice(-14).map(x => x.count));
                return (
                  <div className="analytics-daily-bar-col" key={day.date} title={`${day.date}: ${day.count} registrations`}>
                    <span className="analytics-daily-bar-value">{day.count}</span>
                    <div
                      className="analytics-daily-bar registration"
                      style={{ height: maxReg > 0 ? `${(day.count / maxReg) * 100}%` : '0%' }}
                    />
                    <span className="analytics-daily-bar-label">{day.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Charts */}
      <section className="analytics-charts-grid">
        {/* Device Breakdown */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">📱 Device Breakdown</h3>
          <div className="analytics-device-bars">
            {d.devices.map((dev) => (
              <div className="analytics-device-row" key={dev.device}>
                <span className="analytics-device-label">
                  {dev.device === 'desktop' ? '🖥️' : dev.device === 'mobile' ? '📱' : '📟'} {dev.device}
                </span>
                <div className="analytics-device-bar-track">
                  <div
                    className={`analytics-device-bar-fill ${dev.device}`}
                    style={{ width: totalDevices > 0 ? `${(dev.count / totalDevices) * 100}%` : '0%' }}
                  />
                </div>
                <span className="analytics-device-count">
                  {dev.count} ({totalDevices > 0 ? ((dev.count / totalDevices) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            ))}
            {d.devices.length === 0 && <p className="analytics-empty">No device data yet</p>}
          </div>
        </div>

        {/* Top Pages */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">📄 Top Pages</h3>
          {d.pageViews.topPages.length === 0 ? (
            <p className="analytics-empty">No page data yet</p>
          ) : (
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr><th>Path</th><th>Views</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {d.pageViews.topPages.slice(0, 10).map((p, i) => (
                    <tr key={i}>
                      <td className="analytics-cell-path">{p.path}</td>
                      <td className="analytics-cell-num">{p.count}</td>
                      <td className="analytics-cell-bar">
                        <div className="analytics-mini-bar-track">
                          <div
                            className="analytics-mini-bar-fill"
                            style={{ width: `${d.pageViews.topPages[0] ? (p.count / d.pageViews.topPages[0].count) * 100 : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Events */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">🎯 Top Events</h3>
          {d.events.topEvents.length === 0 ? (
            <p className="analytics-empty">No events tracked yet</p>
          ) : (
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr><th>Event</th><th>Count</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {d.events.topEvents.slice(0, 10).map((e, i) => (
                    <tr key={i}>
                      <td className="analytics-cell-path">{e.name}</td>
                      <td className="analytics-cell-num">{e.count}</td>
                      <td className="analytics-cell-bar">
                        <div className="analytics-mini-bar-track">
                          <div
                            className="analytics-mini-bar-fill event"
                            style={{ width: `${d.events.topEvents[0] ? (e.count / d.events.topEvents[0].count) * 100 : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Registrations Breakdown */}
      <section className="analytics-charts-grid">
        {/* By Region */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">🌏 Registrations by Region</h3>
          {d.registrations.byRegion.length === 0 ? (
            <p className="analytics-empty">No registration data yet</p>
          ) : (
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr><th>Region</th><th>Count</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {d.registrations.byRegion.map((r, i) => (
                    <tr key={i}>
                      <td className="analytics-cell-path">{r.region.toUpperCase()}</td>
                      <td className="analytics-cell-num">{r.count}</td>
                      <td className="analytics-cell-bar">
                        <div className="analytics-mini-bar-track">
                          <div
                            className="analytics-mini-bar-fill"
                            style={{ width: `${d.registrations.byRegion[0] ? (r.count / d.registrations.byRegion[0].count) * 100 : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* By Platform */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">📱 Registrations by Platform</h3>
          {d.registrations.byPlatform.length === 0 ? (
            <p className="analytics-empty">No platform data yet</p>
          ) : (
            <div className="analytics-device-bars">
              {d.registrations.byPlatform.map((p) => {
                const totalReg = d.registrations.byPlatform.reduce((s, x) => s + x.count, 0);
                return (
                  <div className="analytics-device-row" key={p.platform}>
                    <span className="analytics-device-label">
                      {p.platform === 'ios' ? '🍎' : p.platform === 'android' ? '🤖' : '🖥️'} {p.platform}
                    </span>
                    <div className="analytics-device-bar-track">
                      <div
                        className={`analytics-device-bar-fill ${p.platform === 'ios' ? 'desktop' : 'mobile'}`}
                        style={{ width: totalReg > 0 ? `${(p.count / totalReg) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="analytics-device-count">
                      {p.count} ({totalReg > 0 ? ((p.count / totalReg) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Total Registrations */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">📊 Registration Summary</h3>
          <div className="analytics-device-bars">
            <div className="analytics-device-row">
              <span className="analytics-device-label">📋 Total (All Time)</span>
              <span className="analytics-device-count" style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fbbf24' }}>
                {formatNumber(ov.totalRegistrations)}
              </span>
            </div>
            <div className="analytics-device-row">
              <span className="analytics-device-label">📅 This Period</span>
              <span className="analytics-device-count" style={{ fontWeight: 800, fontSize: '1.2rem', color: '#22c55e' }}>
                {formatNumber(ov.recentRegistrations)}
              </span>
            </div>
            <div className="analytics-device-row">
              <span className="analytics-device-label">📊 Trend</span>
              <span className={`analytics-device-count ${trendClass(d.trends.registrations.direction)}`} style={{ fontWeight: 800, fontSize: '1rem' }}>
                {trendIndicator(d.trends.registrations)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="analytics-footer">
        <p>Data from internal tracking • Bot-filtered ({d._meta.botsFiltered} filtered) • Updated in real-time</p>
        <p className="analytics-footer-note">
          Period: Last {d.period.days} days from {new Date(d.period.since).toLocaleDateString()} • Docs processed: {d._meta.docsProcessed.pageViews} PV / {d._meta.docsProcessed.events} Events / {d._meta.docsProcessed.registrations} Registrations
        </p>
      </footer>
    </div>
  );
}

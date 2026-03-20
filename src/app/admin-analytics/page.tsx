'use client';

import React, { useEffect, useReducer, useCallback } from 'react';
import Link from 'next/link';
import '@/app/styles/pages/admin-analytics.css';

/* ═══════════════════════════════════════════════
   EST Analytics Dashboard
   Full-page analytics view with KPI cards,
   charts, tables, and real-time data
   ═══════════════════════════════════════════════ */

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  totalRegistrations: number;
  realRegistrationCount: number;
  totalEvents: number;
  sessions: number;
  bounceRate: number;
  avgPagesPerSession: number;
  topPages: { path: string; count: number }[];
  topEvents: { name: string; count: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  trends: {
    pageViews: number;
    visitors: number;
    registrations: number;
    events: number;
  };
  botsFiltered: number;
  dateRange: { from: string; to: string };
}

type State = {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  period: string;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_OK'; payload: AnalyticsData }
  | { type: 'FETCH_ERR'; payload: string }
  | { type: 'SET_PERIOD'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null };
    case 'FETCH_OK': return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERR': return { ...state, loading: false, error: action.payload };
    case 'SET_PERIOD': return { ...state, period: action.payload };
  }
}

const PERIODS = [
  { key: '1d', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'all', label: 'All Time' },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function trendArrow(pct: number): string {
  if (pct > 0) return `↑ ${Math.abs(pct).toFixed(1)}%`;
  if (pct < 0) return `↓ ${Math.abs(pct).toFixed(1)}%`;
  return '—';
}

function trendClass(pct: number): string {
  if (pct > 0) return 'analytics-trend-up';
  if (pct < 0) return 'analytics-trend-down';
  return 'analytics-trend-neutral';
}

// eslint-disable-next-line max-lines-per-function
export default function AnalyticsDashboardPage() {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    loading: true,
    error: null,
    period: '30d',
  });

  const fetchData = useCallback(async (period: string) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const res = await fetch(`/api/analytics?period=${period}`, {
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
    fetchData(state.period);
  }, [state.period, fetchData]);

  // ─── Unauthorized → redirect to login ───
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

  // ─── Loading ───
  if (state.loading && !state.data) {
    return (
      <div className="analytics-loading">
        <div className="analytics-spinner" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  // ─── Error ───
  if (state.error) {
    return (
      <div className="analytics-error">
        <h2>⚠️ Error loading analytics</h2>
        <p>{state.error}</p>
        <button onClick={() => fetchData(state.period)} className="analytics-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const d = state.data!;
  const totalDevices = d.deviceBreakdown.desktop + d.deviceBreakdown.mobile + d.deviceBreakdown.tablet;

  return (
    <div className="analytics-page">
      {/* ─── Header ─── */}
      <header className="analytics-header">
        <div className="analytics-header-left">
          <Link href="/admin" className="analytics-back-link">← Back to CMS</Link>
          <h1 className="analytics-title">📊 Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Real-time insights for Eternal Tower Saga
          </p>
        </div>
        <div className="analytics-header-right">
          <div className="analytics-period-selector">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`analytics-period-btn ${state.period === p.key ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_PERIOD', payload: p.key })}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            className="analytics-refresh-btn"
            onClick={() => fetchData(state.period)}
            disabled={state.loading}
          >
            {state.loading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </header>

      {/* ─── KPI Cards ─── */}
      <section className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">👁️</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(d.totalPageViews)}</span>
            <span className="analytics-kpi-label">Page Views</span>
            <span className={`analytics-kpi-trend ${trendClass(d.trends.pageViews)}`}>
              {trendArrow(d.trends.pageViews)}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">👤</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(d.uniqueVisitors)}</span>
            <span className="analytics-kpi-label">Unique Visitors</span>
            <span className={`analytics-kpi-trend ${trendClass(d.trends.visitors)}`}>
              {trendArrow(d.trends.visitors)}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card highlight">
          <div className="analytics-kpi-icon">📝</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(d.realRegistrationCount)}</span>
            <span className="analytics-kpi-label">Registrations</span>
            <span className={`analytics-kpi-trend ${trendClass(d.trends.registrations)}`}>
              {trendArrow(d.trends.registrations)}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">🔄</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(d.sessions)}</span>
            <span className="analytics-kpi-label">Sessions</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">📈</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{d.bounceRate.toFixed(1)}%</span>
            <span className="analytics-kpi-label">Bounce Rate</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">📄</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{d.avgPagesPerSession.toFixed(1)}</span>
            <span className="analytics-kpi-label">Pages / Session</span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">🎯</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(d.totalEvents)}</span>
            <span className="analytics-kpi-label">Events Tracked</span>
            <span className={`analytics-kpi-trend ${trendClass(d.trends.events)}`}>
              {trendArrow(d.trends.events)}
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon">🤖</div>
          <div className="analytics-kpi-content">
            <span className="analytics-kpi-value">{formatNumber(d.botsFiltered)}</span>
            <span className="analytics-kpi-label">Bots Filtered</span>
          </div>
        </div>
      </section>

      {/* ─── Charts Section ─── */}
      <section className="analytics-charts-grid">
        {/* Device Breakdown */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">📱 Device Breakdown</h3>
          <div className="analytics-device-bars">
            <div className="analytics-device-row">
              <span className="analytics-device-label">🖥️ Desktop</span>
              <div className="analytics-device-bar-track">
                <div
                  className="analytics-device-bar-fill desktop"
                  style={{ width: totalDevices > 0 ? `${(d.deviceBreakdown.desktop / totalDevices) * 100}%` : '0%' }}
                />
              </div>
              <span className="analytics-device-count">
                {d.deviceBreakdown.desktop} ({totalDevices > 0 ? ((d.deviceBreakdown.desktop / totalDevices) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="analytics-device-row">
              <span className="analytics-device-label">📱 Mobile</span>
              <div className="analytics-device-bar-track">
                <div
                  className="analytics-device-bar-fill mobile"
                  style={{ width: totalDevices > 0 ? `${(d.deviceBreakdown.mobile / totalDevices) * 100}%` : '0%' }}
                />
              </div>
              <span className="analytics-device-count">
                {d.deviceBreakdown.mobile} ({totalDevices > 0 ? ((d.deviceBreakdown.mobile / totalDevices) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="analytics-device-row">
              <span className="analytics-device-label">📟 Tablet</span>
              <div className="analytics-device-bar-track">
                <div
                  className="analytics-device-bar-fill tablet"
                  style={{ width: totalDevices > 0 ? `${(d.deviceBreakdown.tablet / totalDevices) * 100}%` : '0%' }}
                />
              </div>
              <span className="analytics-device-count">
                {d.deviceBreakdown.tablet} ({totalDevices > 0 ? ((d.deviceBreakdown.tablet / totalDevices) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">📄 Top Pages</h3>
          {d.topPages.length === 0 ? (
            <p className="analytics-empty">No page data yet</p>
          ) : (
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr><th>Path</th><th>Views</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {d.topPages.slice(0, 10).map((p, i) => (
                    <tr key={i}>
                      <td className="analytics-cell-path">{p.path}</td>
                      <td className="analytics-cell-num">{p.count}</td>
                      <td className="analytics-cell-bar">
                        <div className="analytics-mini-bar-track">
                          <div
                            className="analytics-mini-bar-fill"
                            style={{ width: `${d.topPages[0] ? (p.count / d.topPages[0].count) * 100 : 0}%` }}
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
          {d.topEvents.length === 0 ? (
            <p className="analytics-empty">No events tracked yet</p>
          ) : (
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr><th>Event</th><th>Count</th><th>Share</th></tr>
                </thead>
                <tbody>
                  {d.topEvents.slice(0, 10).map((e, i) => (
                    <tr key={i}>
                      <td className="analytics-cell-path">{e.name}</td>
                      <td className="analytics-cell-num">{e.count}</td>
                      <td className="analytics-cell-bar">
                        <div className="analytics-mini-bar-track">
                          <div
                            className="analytics-mini-bar-fill event"
                            style={{ width: `${d.topEvents[0] ? (e.count / d.topEvents[0].count) * 100 : 0}%` }}
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

      {/* ─── Footer ─── */}
      <footer className="analytics-footer">
        <p>Data from internal tracking • Bot-filtered • Updated in real-time</p>
        <p className="analytics-footer-note">
          Period: {d.dateRange.from} → {d.dateRange.to}
        </p>
      </footer>
    </div>
  );
}

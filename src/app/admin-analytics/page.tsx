'use client';

import React, { useEffect, useReducer, useState } from 'react';
import Link from 'next/link';
import '@/app/styles/pages/admin-analytics.css';

/* ═══════════════════════════════════════════════
   Full Analytics Dashboard — /admin-analytics
   Professional metrics with admin auth
   Data source: Internal DB (NOT Google/Adjust)
   ═══════════════════════════════════════════════ */

interface OverviewData {
  totalRegistrations: number;
  recentRegistrations: number;
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  bounceRate: number;
  avgPagesPerSession: number;
  totalEvents: number;
}

interface TrendData {
  change: number;
  direction: 'up' | 'down' | 'flat';
}

interface AnalyticsData {
  period: { days: number; since: string };
  overview: OverviewData;
  trends: {
    registrations: TrendData;
    pageViews: TrendData;
    events: TrendData;
  };
  devices: Array<{ device: string; count: number }>;
  registrations: {
    byRegion: Array<{ region: string; count: number }>;
    byPlatform: Array<{ platform: string; count: number }>;
    byDate: Array<{ date: string; count: number }>;
  };
  pageViews: {
    topPages: Array<{ path: string; count: number }>;
    byDate: Array<{ date: string; count: number }>;
  };
  events: {
    topEvents: Array<{ name: string; count: number }>;
  };
  _meta?: {
    docsProcessed: { pageViews: number; events: number; registrations: number };
    botsFiltered: number;
  };
}

type FetchState = { data: AnalyticsData | null; loading: boolean; error: string };
type FetchAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_OK'; data: AnalyticsData }
  | { type: 'FETCH_ERR'; error: string };

function fetchReducer(_state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'FETCH_START': return { data: null, loading: true, error: '' };
    case 'FETCH_OK': return { data: action.data, loading: false, error: '' };
    case 'FETCH_ERR': return { data: null, loading: false, error: action.error };
  }
}

const TREND_ICONS: Record<string, string> = { up: '↑', down: '↓', flat: '→' };
const TREND_CSS: Record<string, string> = { up: 'color-green', down: 'color-red', flat: '' };

function TrendBadge({ trend, label }: { trend: TrendData; label?: string }) {
  return (
    <span className={`analytics-trend ${TREND_CSS[trend.direction]}`}>
      {TREND_ICONS[trend.direction]} {trend.change}% {label && `vs prev ${label}`}
    </span>
  );
}

// eslint-disable-next-line max-lines-per-function -- Dashboard page with multiple chart sections
export default function AnalyticsDashboard() {
  const [{ data, loading, error }, dispatch] = useReducer(fetchReducer, { data: null, loading: true, error: '' });
  const [days, setDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'FETCH_START' });
    fetch(`/api/analytics?days=${days}`, { credentials: 'include' })
      .then(r => {
        if (r.status === 401) {
          window.location.href = '/admin';
          return null;
        }
        return r.json();
      })
      .then(d => {
        if (cancelled || !d) return;
        if (d.error) dispatch({ type: 'FETCH_ERR', error: d.error });
        else dispatch({ type: 'FETCH_OK', data: d });
      })
      .catch(() => { if (!cancelled) dispatch({ type: 'FETCH_ERR', error: 'Failed to load analytics' }); });
    return () => { cancelled = true; };
  }, [days, refreshKey]);

  const maxBar = (arr: Array<{ count: number }>) => Math.max(...arr.map(i => i.count), 1);

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title">📊 Analytics Dashboard</h1>
            <p className="analytics-subtitle">
              Data Source: <strong className="analytics-source-label">Internal Database</strong> — Not from Google/Adjust
              {data?._meta && (
                <> · Bots filtered: {data._meta.botsFiltered}</>
              )}
            </p>
          </div>
          <div className="analytics-controls">
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`analytics-day-btn ${days === d ? 'active' : ''}`}
              >
                {d}D
              </button>
            ))}
            <button onClick={() => setRefreshKey(k => k + 1)} className="analytics-refresh-btn">
              ↻
            </button>
          </div>
        </div>

        {loading && <p className="analytics-loading">Loading analytics...</p>}
        {error && <p className="analytics-error">{error}</p>}

        {data && !loading && (
          <>
            {/* ═══ OVERVIEW CARDS ═══ */}
            <div className="analytics-cards-grid">
              {[
                { label: 'Total Registrations', value: data.overview.totalRegistrations, colorClass: 'color-gold', icon: '👥' },
                { label: `Registrations (${days}D)`, value: data.overview.recentRegistrations, colorClass: 'color-green', icon: '📈', trend: data.trends.registrations },
                { label: `Page Views (${days}D)`, value: data.overview.totalPageViews, colorClass: 'color-blue', icon: '👁️', trend: data.trends.pageViews },
                { label: `Unique Visitors`, value: data.overview.uniqueVisitors, colorClass: 'color-purple', icon: '🌐' },
                { label: `Sessions`, value: data.overview.totalSessions, colorClass: 'color-gold', icon: '📊' },
                { label: `Bounce Rate`, value: data.overview.bounceRate, colorClass: data.overview.bounceRate > 70 ? 'color-red' : 'color-green', icon: '📉', suffix: '%' },
                { label: `Avg Pages/Session`, value: data.overview.avgPagesPerSession, colorClass: 'color-blue', icon: '📄' },
                { label: `Events (${days}D)`, value: data.overview.totalEvents, colorClass: 'color-red', icon: '🖱️', trend: data.trends.events },
              ].map(card => (
                <div key={card.label} className="analytics-card">
                  <div className="analytics-card-icon">{card.icon}</div>
                  <div className={`analytics-card-value ${card.colorClass}`}>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}{'suffix' in card ? card.suffix : ''}
                  </div>
                  <div className="analytics-card-label">
                    {card.label}
                    {'trend' in card && card.trend && <TrendBadge trend={card.trend} />}
                  </div>
                </div>
              ))}
            </div>

            {/* ═══ DEVICE BREAKDOWN ═══ */}
            {data.devices.length > 0 && (
              <>
                <h2 className="analytics-section-title analytics-section-title--purple">
                  📱 Device Breakdown
                </h2>
                <div className="analytics-panel analytics-panel--mb">
                  {data.devices.map(item => (
                    <div key={item.device} className="analytics-bar-row">
                      <span className="analytics-bar-label analytics-bar-label--platform">{item.device}</span>
                      <div className="analytics-bar-track">
                        <div className="analytics-bar-fill analytics-bar-fill--blue" style={{ width: `${(item.count / maxBar(data.devices)) * 100}%` } as React.CSSProperties} />
                      </div>
                      <span className="analytics-bar-count">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ SECTION: REGISTRATIONS ═══ */}
            <h2 className="analytics-section-title analytics-section-title--gold">
              📝 Registrations (Internal DB)
            </h2>
            <div className="analytics-two-col">
              <div className="analytics-panel">
                <h3 className="analytics-panel-title">By Region</h3>
                {data.registrations.byRegion.map(item => (
                  <div key={item.region} className="analytics-bar-row">
                    <span className="analytics-bar-label analytics-bar-label--region">{item.region.toUpperCase()}</span>
                    <div className="analytics-bar-track">
                      <div className="analytics-bar-fill analytics-bar-fill--gold" style={{ width: `${(item.count / maxBar(data.registrations.byRegion)) * 100}%` } as React.CSSProperties} />
                    </div>
                    <span className="analytics-bar-count">{item.count}</span>
                  </div>
                ))}
                {data.registrations.byRegion.length === 0 && <p className="analytics-empty">No data yet</p>}
              </div>

              <div className="analytics-panel">
                <h3 className="analytics-panel-title">By Platform</h3>
                {data.registrations.byPlatform.map(item => (
                  <div key={item.platform} className="analytics-bar-row">
                    <span className="analytics-bar-label analytics-bar-label--platform">{item.platform}</span>
                    <div className="analytics-bar-track">
                      <div className="analytics-bar-fill analytics-bar-fill--blue" style={{ width: `${(item.count / maxBar(data.registrations.byPlatform)) * 100}%` } as React.CSSProperties} />
                    </div>
                    <span className="analytics-bar-count">{item.count}</span>
                  </div>
                ))}
                {data.registrations.byPlatform.length === 0 && <p className="analytics-empty">No data yet</p>}
              </div>
            </div>

            {/* ═══ SECTION: PAGE VIEWS ═══ */}
            <h2 className="analytics-section-title analytics-section-title--blue">
              👁️ Page Views (Internal DB)
            </h2>
            <div className="analytics-panel analytics-panel--mb">
              <h3 className="analytics-panel-title">Top Pages</h3>
              {data.pageViews.topPages.map(item => (
                <div key={item.path} className="analytics-bar-row">
                  <span className="analytics-bar-label analytics-bar-label--page">{item.path}</span>
                  <div className="analytics-bar-track">
                    <div className="analytics-bar-fill analytics-bar-fill--blue" style={{ width: `${(item.count / maxBar(data.pageViews.topPages)) * 100}%` } as React.CSSProperties} />
                  </div>
                  <span className="analytics-bar-count">{item.count}</span>
                </div>
              ))}
              {data.pageViews.topPages.length === 0 && <p className="analytics-empty">No page views yet — data appears after real users visit</p>}
            </div>

            {/* ═══ SECTION: EVENTS ═══ */}
            <h2 className="analytics-section-title analytics-section-title--red">
              🖱️ Events (Internal DB)
            </h2>
            <div className="analytics-panel analytics-panel--mb">
              <h3 className="analytics-panel-title">Top Events</h3>
              {data.events.topEvents.map(item => (
                <div key={item.name} className="analytics-bar-row">
                  <span className="analytics-bar-label analytics-bar-label--event">{item.name}</span>
                  <div className="analytics-bar-track">
                    <div className="analytics-bar-fill analytics-bar-fill--red" style={{ width: `${(item.count / maxBar(data.events.topEvents)) * 100}%` } as React.CSSProperties} />
                  </div>
                  <span className="analytics-bar-count">{item.count}</span>
                </div>
              ))}
              {data.events.topEvents.length === 0 && <p className="analytics-empty">No events yet — data appears when users interact</p>}
            </div>

            {/* ═══ EXTERNAL DATA SOURCES ═══ */}
            <h2 className="analytics-section-title analytics-section-title--purple">
              🔗 External Analytics (Separate Data Sources)
            </h2>
            <div className="analytics-two-col">
              <div className="analytics-external-ga4">
                <h3>📊 Google Analytics (GA4)</h3>
                <p className="analytics-external-desc">
                  GA4 tracks: sessions, bounce rate, user demographics, traffic sources, real-time users, conversion funnels.
                  <br />Data is <strong>separate</strong> from our internal DB.
                </p>
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="analytics-external-link analytics-external-link--ga4">
                  Open GA4 Dashboard →
                </a>
              </div>

              <div className="analytics-external-adjust">
                <h3>📱 Adjust</h3>
                <p className="analytics-external-desc">
                  Adjust tracks: app installs, mobile attribution, deep links, ad campaign performance, in-app events.
                  <br />Data is <strong>separate</strong> from our internal DB and GA4.
                </p>
                <a href="https://dash.adjust.com" target="_blank" rel="noopener noreferrer" className="analytics-external-link analytics-external-link--adjust">
                  Open Adjust Dashboard →
                </a>
              </div>
            </div>

            {/* Data Separation Note */}
            <div className="analytics-note">
              <h4>⚠️ Data Source Separation</h4>
              <ul>
                <li><strong className="color-gold">Internal DB</strong> — Registrations, page views, button clicks (data shown above)</li>
                <li><strong className="color-ga4">Google Analytics</strong> — Sessions, demographics, traffic sources (access via GA4)</li>
                <li><strong className="color-adjust">Adjust</strong> — App installs, mobile attribution (access via Adjust dashboard)</li>
              </ul>
              <p>Each system tracks independently. Data does NOT overlap or conflict between sources.</p>
            </div>
          </>
        )}

        <div className="analytics-footer">
          <Link href="/admin" className="analytics-back-link">← Back to CMS Admin</Link>
        </div>
      </div>
    </div>
  );
}

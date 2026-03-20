'use client';

import React, { useEffect, useReducer, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  period: { days: number; since: string };
  overview: {
    totalRegistrations: number;
    recentRegistrations: number;
    totalPageViews: number;
    uniqueVisitors: number;
    totalEvents: number;
  };
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
  dataSource: string;
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

// eslint-disable-next-line max-lines-per-function -- Dashboard page with multiple chart sections
export default function AnalyticsDashboard() {
  const [{ data, loading, error }, dispatch] = useReducer(fetchReducer, { data: null, loading: true, error: '' });
  const [days, setDays] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'FETCH_START' });
    fetch(`/api/analytics?days=${days}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.error) dispatch({ type: 'FETCH_ERR', error: d.error });
        else dispatch({ type: 'FETCH_OK', data: d });
      })
      .catch(() => { if (!cancelled) dispatch({ type: 'FETCH_ERR', error: 'Failed to load analytics' }); });
    return () => { cancelled = true; };
  }, [days, refreshKey]);

  const maxBar = (arr: Array<{ count: number }>) => Math.max(...arr.map(i => i.count), 1);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: '#0a0e1a', color: '#e0e0e0', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f5a623', margin: 0 }}>📊 Analytics Dashboard</h1>
            <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              Data Source: <strong style={{ color: '#4fc3f7' }}>Internal Database</strong> — Not from Google/Adjust
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: days === d ? '#f5a623' : 'rgba(255,255,255,0.1)',
                  color: days === d ? '#000' : '#ccc', fontWeight: 600, fontSize: '0.85rem',
                }}
              >
                {d}D
              </button>
            ))}
            <button onClick={() => setRefreshKey(k => k + 1)} style={{ padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(79,195,247,0.2)', color: '#4fc3f7', fontWeight: 600 }}>
              ↻
            </button>
          </div>
        </div>

        {loading && <p style={{ textAlign: 'center', color: '#888', padding: '3rem 0' }}>Loading analytics...</p>}
        {error && <p style={{ textAlign: 'center', color: '#ff5252', padding: '1rem', background: 'rgba(255,82,82,0.1)', borderRadius: 8 }}>{error}</p>}

        {data && !loading && (
          <>
            {/* ═══ OVERVIEW CARDS ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Registrations', value: data.overview.totalRegistrations, color: '#f5a623', icon: '👥' },
                { label: `Registrations (${days}D)`, value: data.overview.recentRegistrations, color: '#66bb6a', icon: '📈' },
                { label: `Page Views (${days}D)`, value: data.overview.totalPageViews, color: '#4fc3f7', icon: '👁️' },
                { label: `Unique Visitors (${days}D)`, value: data.overview.uniqueVisitors, color: '#ab47bc', icon: '🌐' },
                { label: `Events (${days}D)`, value: data.overview.totalEvents, color: '#ef5350', icon: '🖱️' },
              ].map(card => (
                <div key={card.label} style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{card.icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: card.color }}>{card.value.toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* ═══ SECTION: REGISTRATIONS ═══ */}
            <h2 style={{ fontSize: '1.2rem', color: '#f5a623', marginBottom: '1rem', borderBottom: '1px solid rgba(245,166,35,0.3)', paddingBottom: '0.5rem' }}>
              📝 Registrations (Internal DB)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {/* By Region */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '1rem' }}>By Region</h3>
                {data.registrations.byRegion.map(item => (
                  <div key={item.region} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ width: 30, fontSize: '0.85rem', fontWeight: 600, color: '#f5a623' }}>{item.region.toUpperCase()}</span>
                    <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(item.count / maxBar(data.registrations.byRegion)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f5a623, #ff8f00)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ width: 40, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{item.count}</span>
                  </div>
                ))}
                {data.registrations.byRegion.length === 0 && <p style={{ color: '#666', fontSize: '0.85rem' }}>No data yet</p>}
              </div>

              {/* By Platform */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '1rem' }}>By Platform</h3>
                {data.registrations.byPlatform.map(item => (
                  <div key={item.platform} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ width: 60, fontSize: '0.85rem', fontWeight: 600, color: '#4fc3f7' }}>{item.platform}</span>
                    <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(item.count / maxBar(data.registrations.byPlatform)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4fc3f7, #0288d1)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ width: 40, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{item.count}</span>
                  </div>
                ))}
                {data.registrations.byPlatform.length === 0 && <p style={{ color: '#666', fontSize: '0.85rem' }}>No data yet</p>}
              </div>
            </div>

            {/* ═══ SECTION: PAGE VIEWS ═══ */}
            <h2 style={{ fontSize: '1.2rem', color: '#4fc3f7', marginBottom: '1rem', borderBottom: '1px solid rgba(79,195,247,0.3)', paddingBottom: '0.5rem' }}>
              👁️ Page Views (Internal DB)
            </h2>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '1rem' }}>Top Pages</h3>
              {data.pageViews.topPages.map(item => (
                <div key={item.path} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ width: 120, fontSize: '0.85rem', fontWeight: 600, color: '#4fc3f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.path}</span>
                  <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(item.count / maxBar(data.pageViews.topPages)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4fc3f7, #0288d1)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ width: 40, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{item.count}</span>
                </div>
              ))}
              {data.pageViews.topPages.length === 0 && <p style={{ color: '#666', fontSize: '0.85rem' }}>No page views yet — data will appear after users visit the site</p>}
            </div>

            {/* ═══ SECTION: EVENTS ═══ */}
            <h2 style={{ fontSize: '1.2rem', color: '#ef5350', marginBottom: '1rem', borderBottom: '1px solid rgba(239,83,80,0.3)', paddingBottom: '0.5rem' }}>
              🖱️ Button Clicks & Events (Internal DB)
            </h2>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#ccc', marginBottom: '1rem' }}>Top Events</h3>
              {data.events.topEvents.map(item => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ width: 160, fontSize: '0.85rem', fontWeight: 600, color: '#ef5350' }}>{item.name}</span>
                  <div style={{ flex: 1, height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(item.count / maxBar(data.events.topEvents)) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ef5350, #c62828)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ width: 40, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700 }}>{item.count}</span>
                </div>
              ))}
              {data.events.topEvents.length === 0 && <p style={{ color: '#666', fontSize: '0.85rem' }}>No events yet — data will appear when users click buttons</p>}
            </div>

            {/* ═══ EXTERNAL DATA SOURCES ═══ */}
            <h2 style={{ fontSize: '1.2rem', color: '#ab47bc', marginBottom: '1rem', borderBottom: '1px solid rgba(171,71,188,0.3)', paddingBottom: '0.5rem' }}>
              🔗 External Analytics (Separate Data Sources)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {/* Google Analytics */}
              <div style={{ background: 'rgba(66,133,244,0.08)', borderRadius: 12, padding: '1.5rem', border: '1px solid rgba(66,133,244,0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#4285f4', marginBottom: '0.75rem' }}>📊 Google Analytics (GA4)</h3>
                <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: 1.6, marginBottom: '1rem' }}>
                  GA4 tracks: sessions, bounce rate, user demographics, traffic sources, real-time users, conversion funnels.
                  <br />Data is <strong>separate</strong> from our internal DB.
                </p>
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', padding: '0.5rem 1.5rem', background: '#4285f4', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Open GA4 Dashboard →
                </a>
              </div>

              {/* Adjust */}
              <div style={{ background: 'rgba(0,176,255,0.08)', borderRadius: 12, padding: '1.5rem', border: '1px solid rgba(0,176,255,0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#00b0ff', marginBottom: '0.75rem' }}>📱 Adjust</h3>
                <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Adjust tracks: app installs, mobile attribution, deep links, ad campaign performance, in-app events.
                  <br />Data is <strong>separate</strong> from our internal DB and GA4.
                </p>
                <a
                  href="https://dash.adjust.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', padding: '0.5rem 1.5rem', background: '#00b0ff', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Open Adjust Dashboard →
                </a>
              </div>
            </div>

            {/* Data Separation Note */}
            <div style={{ background: 'rgba(255,235,59,0.05)', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,235,59,0.15)', marginBottom: '2rem' }}>
              <h4 style={{ color: '#ffd54f', fontSize: '0.95rem', marginBottom: '0.5rem' }}>⚠️ Data Source Separation</h4>
              <ul style={{ color: '#bbb', fontSize: '0.85rem', lineHeight: 1.8, margin: 0, paddingLeft: '1.25rem' }}>
                <li><strong style={{ color: '#f5a623' }}>Internal DB</strong> — Registrations, page views, button clicks (data shown above)</li>
                <li><strong style={{ color: '#4285f4' }}>Google Analytics</strong> — Sessions, demographics, traffic sources (access via GA4)</li>
                <li><strong style={{ color: '#00b0ff' }}>Adjust</strong> — App installs, mobile attribution (access via Adjust dashboard)</li>
              </ul>
              <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Each system tracks independently. Data does NOT overlap or conflict between sources.
              </p>
            </div>
          </>
        )}

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/admin" style={{ color: '#4fc3f7', fontSize: '0.9rem' }}>← Back to CMS Admin</Link>
        </div>
      </div>
    </div>
  );
}

'use client'

import React from 'react'

interface DimensionRow {
  value: string
  pageviews: number
  sessions: number
  uniqueVisitors: number
  bounceRate: number
  avgDuration: number
  conversionRate: number
}

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

interface DimTableProps {
  rows?: DimensionRow[]
  title: string
  icon: React.ReactNode
}

export default function DimTable({ rows, title, icon }: DimTableProps) {
  if (!rows || rows.length === 0) return (
    <div className="da-card">
      <div className="da-card-header">
        <h3 className="da-card-title">{icon} {title}</h3>
      </div>
      <p className="da-empty">No data yet</p>
    </div>
  )

  const maxSessions = rows[0]?.sessions || 1

  return (
    <div className="da-card">
      <div className="da-card-header">
        <h3 className="da-card-title">{icon} {title}</h3>
        <span style={{ color: 'var(--da-text-muted)', fontSize: '0.6875rem' }}>{rows.length} items</span>
      </div>
      <div className="da-table-wrap">
        <table className="da-table">
          <thead>
            <tr>
              <th>{title}</th>
              <th>Sessions</th>
              <th>Visitors</th>
              <th>Bounce</th>
              <th>Duration</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="da-cell-name">
                  <span className={`da-rank da-rank-${i < 3 ? i + 1 : ''}`}>{i + 1}</span>
                  {r.value || '(direct)'}
                </td>
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
  )
}

export type { DimensionRow }

'use client'

import React from 'react'

interface Trend {
  change: number
  direction: 'up' | 'down' | 'flat'
}

function TrendBadge({ trend }: { trend?: Trend }) {
  if (!trend) return null
  const cls = trend.direction === 'up' ? 'trend-up' : trend.direction === 'down' ? 'trend-down' : 'trend-flat'
  const arrow = trend.direction === 'up' ? '\u2191' : trend.direction === 'down' ? '\u2193' : '\u2014'
  return <span className={`da-trend ${cls}`}>{arrow} {trend.change}%</span>
}

interface KPICardProps {
  label: string
  value: string
  trend?: Trend
  highlight?: boolean
  invertTrend?: boolean
}

export default function KPICard({ label, value, trend, highlight, invertTrend }: KPICardProps) {
  const effectiveTrend = invertTrend && trend ? {
    ...trend,
    direction: (trend.direction === 'up' ? 'down' : trend.direction === 'down' ? 'up' : 'flat') as Trend['direction'],
  } : trend

  return (
    <div className={`da-kpi ${highlight ? 'da-kpi-highlight' : ''}`}>
      <div className="da-kpi-top">
        <span className="da-kpi-label">{label}</span>
        <TrendBadge trend={effectiveTrend} />
      </div>
      <div className="da-kpi-value">{value}</div>
    </div>
  )
}

export type { Trend }

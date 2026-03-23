'use client'

import React from 'react'

interface DailyPoint {
  date: string
  pageviews: number
  sessions: number
  uniqueVisitors: number
}

interface BarChartProps {
  data: DailyPoint[]
  valueKey: keyof DailyPoint
  label: string
}

export default function BarChart({ data, valueKey, label }: BarChartProps) {
  if (data.length === 0) return <p className="da-empty">No data available</p>
  const values = data.map(d => d[valueKey] as number)
  const max = Math.max(...values, 1)

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
  )
}

export type { DailyPoint }

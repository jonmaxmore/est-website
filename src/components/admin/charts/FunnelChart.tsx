'use client'

import React from 'react'

interface FunnelStep {
  step: string
  label: string
  count: number
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export default function FunnelChart({ steps }: { steps?: FunnelStep[] }) {
  if (!steps || steps.length === 0) return <p className="da-empty">No funnel data yet</p>
  const max = Math.max(...steps.map(s => s.count), 1)

  return (
    <div className="da-funnel">
      {steps.map((s, i) => {
        const pct = max > 0 ? (s.count / max) * 100 : 0
        const dropoff = i > 0 && steps[i - 1].count > 0
          ? Math.round(((steps[i - 1].count - s.count) / steps[i - 1].count) * 100)
          : 0
        return (
          <div className="da-funnel-step" key={s.step}>
            <div className="da-funnel-label">
              <span className="da-funnel-number">{i + 1}</span>
              <span className="da-funnel-name">{s.label}</span>
              <span className="da-funnel-count">{fmt(s.count)}</span>
              {i > 0 && dropoff > 0 && <span className="da-funnel-drop">-{dropoff}%</span>}
            </div>
            <div className="da-funnel-bar-track">
              <div className="da-funnel-bar" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export type { FunnelStep }

'use client'

import React from 'react'

/**
 * Analytics nav link for Payload CMS admin sidebar
 * Rendered via afterNavLinks in payload.config.ts
 * Uses SVG icon â€” no emojis
 */
export default function AnalyticsNavLink() {
  return (
    <a
      href="/admin-analytics"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.5rem 1rem',
        color: 'var(--theme-elevation-400, #8b949e)',
        textDecoration: 'none',
        fontSize: '0.8125rem',
        fontWeight: 500,
        borderRadius: '4px',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.background = 'var(--theme-elevation-100, rgba(255,255,255,0.05))'
        el.style.color = 'var(--theme-text, #e6edf3)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.background = 'transparent'
        el.style.color = 'var(--theme-elevation-400, #8b949e)'
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 4-8" />
      </svg>
      <span>Analytics</span>
    </a>
  )
}

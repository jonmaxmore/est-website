'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #071224 0%, #040b18 52%, #02050d 100%)',
  color: '#fff',
  fontFamily: 'var(--font-body, system-ui, sans-serif)',
  padding: '2rem',
}

const cardStyle: React.CSSProperties = {
  maxWidth: '480px',
  textAlign: 'center',
  padding: '3rem 2rem',
  background: 'rgba(10, 28, 58, 0.6)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(12px)',
}

const retryBtnStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  background: 'linear-gradient(135deg, #D4A843, #8B6914)',
  color: '#02050D',
  border: 'none',
  borderRadius: '50px',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
}

const homeLinkStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  background: 'transparent',
  color: 'rgba(240, 245, 255, 0.78)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '50px',
  fontWeight: 500,
  fontSize: '0.95rem',
  textDecoration: 'none',
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[EST] Page error:', error)
  }, [error])

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚔️</div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: 'var(--font-display, serif)', color: '#D4A843', marginBottom: '0.75rem' }}>
          เกิดข้อผิดพลาด
        </h1>
        <p style={{ color: 'rgba(240, 245, 255, 0.65)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          ขออภัย เกิดข้อผิดพลาดขึ้นระหว่างโหลดหน้านี้<br />กรุณาลองใหม่อีกครั้ง หรือกลับไปหน้าหลัก
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} style={retryBtnStyle}>ลองใหม่อีกครั้ง</button>
          <Link href="/" style={homeLinkStyle}>กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  )
}

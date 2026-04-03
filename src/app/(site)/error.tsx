'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import styles from './error.module.css'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[EST] Page error:', error)
  }, [error])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>⚔️</div>
        <h1 className={styles.title}>เกิดข้อผิดพลาด</h1>
        <p className={styles.description}>
          ขออภัย เกิดข้อผิดพลาดขึ้นระหว่างโหลดหน้านี้<br />กรุณาลองใหม่อีกครั้ง หรือกลับไปหน้าหลัก
        </p>
        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryBtn}>ลองใหม่อีกครั้ง</button>
          <Link href="/" className={styles.homeLink}>กลับหน้าหลัก</Link>
        </div>
      </div>
    </div>
  )
}

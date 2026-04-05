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
        <div className={styles.icon}>âš”ï¸</div>
        <h1 className={styles.title}>à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”</h1>
        <p className={styles.description}>
          à¸‚à¸­à¸­à¸ à¸±à¸¢ à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”à¸‚à¸¶à¹‰à¸™à¸£à¸°à¸«à¸§à¹ˆà¸²à¸‡à¹‚à¸«à¸¥à¸”à¸«à¸™à¹‰à¸²à¸™à¸µà¹‰<br />à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡ à¸«à¸£à¸·à¸­à¸à¸¥à¸±à¸šà¹„à¸›à¸«à¸™à¹‰à¸²à¸«à¸¥à¸±à¸
        </p>
        <div className={styles.actions}>
          <button onClick={reset} className={styles.retryBtn}>à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡</button>
          <Link href="/" className={styles.homeLink}>à¸à¸¥à¸±à¸šà¸«à¸™à¹‰à¸²à¸«à¸¥à¸±à¸</Link>
        </div>
      </div>
    </div>
  )
}

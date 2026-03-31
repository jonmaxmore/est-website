import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Download',
  description: 'ดาวน์โหลด Eternal Tower Saga บน iOS, Android และ PC — Download the game on your preferred platform.',
  openGraph: {
    title: 'Download — Eternal Tower Saga',
    description: 'ดาวน์โหลดเกม Eternal Tower Saga ได้แล้ววันนี้!',
  },
}

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return children
}
